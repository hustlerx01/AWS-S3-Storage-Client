import { S3Client, ListObjectsV2Command, DeleteObjectsCommand, CopyObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import type { Credentials } from "../stores/useAuthStore";
import { useAuthStore } from "../stores/useAuthStore";

// Helper to get a fresh client
const getClient = (creds: Credentials) => {
    return new S3Client({
        region: creds.region,
        credentials: {
            accessKeyId: creds.accessKeyId,
            secretAccessKey: creds.secretAccessKey,
        },
        // Prevent SDK from auto-adding checksums (CRC32) which can cause mismatches in multipart uploads
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
    });
};

// Helper to get MIME type for common files often missed by browsers
const getMimeType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'apk': return 'application/vnd.android.package-archive';
        case 'mkv': return 'video/x-matroska';
        case 'dmg': return 'application/x-apple-diskimage';
        case 'iso': return 'application/x-iso9660-image';
        case 'exe': return 'application/x-msdownload';
        case 'msi': return 'application/x-msi';
        case 'deb': return 'application/vnd.debian.binary-package';
        case 'rpm': return 'application/x-rpm';
        case '7z': return 'application/x-7z-compressed';
        case 'rar': return 'application/vnd.rar';
        default: return undefined;
    }
};

export const s3Service = {
    listFiles: async (prefix: string = "") => {
        const { credentials } = useAuthStore.getState();
        if (!credentials) throw new Error("No credentials");

        const client = getClient(credentials);
        const command = new ListObjectsV2Command({
            Bucket: credentials.bucketName,
            Prefix: prefix,
            Delimiter: "/",
        });

        const response = await client.send(command);
        return {
            folders: response.CommonPrefixes?.map(p => p.Prefix!) || [],
            files: response.Contents?.map(c => ({
                key: c.Key!,
                lastModified: c.LastModified!,
                size: c.Size!,
            })) || [],
        };
    },

    uploadFile: async (file: File, prefix: string, onProgress?: (progress: { loaded: number, total: number }) => void) => {
        const { credentials } = useAuthStore.getState();
        if (!credentials) throw new Error("No credentials");

        const client = getClient(credentials);
        const key = `${prefix}${file.name}`;

        // Dynamic part size calculation
        // Min 5MB, Target ~100 parts for very large files to balance overhead vs reliability
        // For 2.5GB: 2500MB / 100 = 25MB parts (100 parts) -> Good
        // For 10MB: 10MB / 100 = 0.1MB -> Uses min 5MB (2 parts) -> Good
        const minPartSize = 1024 * 1024 * 5; // 5MB
        const calculatedPartSize = Math.ceil(file.size / 100);
        const partSize = Math.max(minPartSize, calculatedPartSize);

        const parallelUploads3 = new Upload({
            client,
            partSize,
            queueSize: 4, // 4 concurrent uploads
            leavePartsOnError: false,
            params: {
                Bucket: credentials.bucketName,
                Key: key,
                Body: file,
                ContentType: file.type || getMimeType(file.name) || 'application/octet-stream',
            },
        });

        parallelUploads3.on("httpUploadProgress", (progress) => {
            if (progress.loaded && progress.total && onProgress) {
                onProgress({ loaded: progress.loaded, total: progress.total });
            }
        });

        await parallelUploads3.done();
        return key;
    },

    createFolder: async (folderName: string) => {
        const { credentials } = useAuthStore.getState();
        if (!credentials) throw new Error("No credentials");

        const client = getClient(credentials);
        const key = folderName.endsWith('/') ? folderName : `${folderName}/`;

        const upload = new Upload({
            client,
            params: {
                Bucket: credentials.bucketName,
                Key: key,
                Body: "",
            }
        });

        await upload.done();
    },

    deleteFiles: async (keys: string[]) => {
        const { credentials } = useAuthStore.getState();
        if (!credentials) throw new Error("No credentials");

        const client = getClient(credentials);

        await client.send(new DeleteObjectsCommand({
            Bucket: credentials.bucketName,
            Delete: {
                Objects: keys.map(key => ({ Key: key })),
                Quiet: true
            }
        }));
    },

    deleteFile: async (key: string) => {
        return s3Service.deleteFiles([key]);
    },

    downloadFiles: async (keys: string[]) => {
        const { credentials } = useAuthStore.getState();
        if (!credentials) throw new Error("No credentials");

        if (keys.length === 1) {
            const url = await s3Service.getPresignedUrl(keys[0]);
            const link = document.createElement('a');
            link.href = url;
            link.download = keys[0].split('/').pop() || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        const client = getClient(credentials);

        await Promise.all(keys.map(async (key) => {
            const command = new GetObjectCommand({
                Bucket: credentials.bucketName,
                Key: key,
            });
            const response = await client.send(command);
            const blob = await response.Body?.transformToByteArray();
            if (blob) {
                zip.file(key.split('/').pop()!, blob);
            }
        }));

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = "files.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    copyFile: async (sourceKey: string, destinationKey: string) => {
        const { credentials } = useAuthStore.getState();
        if (!credentials) throw new Error("No credentials");

        const client = getClient(credentials);
        await client.send(new CopyObjectCommand({
            Bucket: credentials.bucketName,
            CopySource: `${credentials.bucketName}/${sourceKey}`,
            Key: destinationKey,
        }));
    },

    getPresignedUrl: async (key: string, expiresIn = 900, contentType?: string, disposition: 'inline' | 'attachment' = 'inline') => {
        const { credentials } = useAuthStore.getState();
        if (!credentials) throw new Error("No credentials");

        const client = getClient(credentials);
        const filename = key.split('/').pop() || 'file';

        const command = new GetObjectCommand({
            Bucket: credentials.bucketName,
            Key: key,
            ResponseContentDisposition: `${disposition}; filename="${filename}"`,
            ...(contentType && { ResponseContentType: contentType }),
        });

        return await getSignedUrl(client, command, { expiresIn });
    },

    getFileContent: async (key: string) => {
        const { credentials } = useAuthStore.getState();
        if (!credentials) throw new Error("No credentials");

        const client = getClient(credentials);
        const command = new GetObjectCommand({
            Bucket: credentials.bucketName,
            Key: key
        });

        const response = await client.send(command);
        return await response.Body?.transformToString();
    }
};

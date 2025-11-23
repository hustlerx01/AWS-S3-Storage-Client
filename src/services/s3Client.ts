import { S3Client, ListObjectsV2Command, DeleteObjectCommand, CopyObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
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
    });
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

    uploadFile: async (file: File, prefix: string, onProgress?: (progress: number) => void) => {
        const { credentials } = useAuthStore.getState();
        if (!credentials) throw new Error("No credentials");

        const client = getClient(credentials);
        const key = `${prefix}${file.name}`;

        const parallelUploads3 = new Upload({
            client,
            params: {
                Bucket: credentials.bucketName,
                Key: key,
                Body: file,
                ContentType: file.type,
            },
        });

        parallelUploads3.on("httpUploadProgress", (progress) => {
            if (progress.loaded && progress.total && onProgress) {
                onProgress(Math.round((progress.loaded / progress.total) * 100));
            }
        });

        await parallelUploads3.done();
        return key;
    },

    deleteFile: async (key: string) => {
        const { credentials } = useAuthStore.getState();
        if (!credentials) throw new Error("No credentials");

        const client = getClient(credentials);
        await client.send(new DeleteObjectCommand({
            Bucket: credentials.bucketName,
            Key: key,
        }));
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

    getPresignedUrl: async (key: string, expiresIn = 900) => {
        const { credentials } = useAuthStore.getState();
        if (!credentials) throw new Error("No credentials");

        const client = getClient(credentials);
        const command = new GetObjectCommand({
            Bucket: credentials.bucketName,
            Key: key,
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

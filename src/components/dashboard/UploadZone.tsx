import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileStore } from '../../stores/useFileStore';
import { s3Service } from '../../services/s3Client';
import { toast } from 'sonner';
import { UploadCloud } from 'lucide-react';

export const UploadZone = () => {
    const { currentPrefix, fetchFiles } = useFileStore();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const uploadPromises = acceptedFiles.map(async (file) => {
            try {
                toast.loading(`Uploading ${file.name}...`, { id: file.name });
                await s3Service.uploadFile(file, currentPrefix, () => {
                    // We could update toast with progress here if sonner supports it easily
                    // or use a separate progress store. For now, just loading.
                });
                toast.success(`Uploaded ${file.name}`, { id: file.name });
            } catch (error) {
                console.error(error);
                toast.error(`Failed to upload ${file.name}`, { id: file.name });
            }
        });

        await Promise.all(uploadPromises);
        fetchFiles();
    }, [currentPrefix, fetchFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}
      `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="w-10 h-10 mb-2" />
                {isDragActive ? (
                    <p>Drop the files here ...</p>
                ) : (
                    <p>Drag & drop files here, or click to select files</p>
                )}
            </div>
        </div>
    );
};

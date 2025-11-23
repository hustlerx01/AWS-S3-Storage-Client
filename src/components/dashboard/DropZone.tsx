import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileStore } from '../../stores/useFileStore';
import { s3Service } from '../../services/s3Client';
import { toast } from 'sonner';
import { UploadCloud } from 'lucide-react';

export const DropZone = () => {
    const { currentPrefix, fetchFiles } = useFileStore();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const uploadPromises = acceptedFiles.map(async (file) => {
            try {
                toast.loading(`Uploading ${file.name}...`, { id: file.name });
                await s3Service.uploadFile(file, currentPrefix, () => {
                    // Progress handling could be added here
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
            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 w-full h-48
                ${isDragActive
                    ? 'border-orange-500 bg-orange-500/5 scale-[1.01]'
                    : 'border-zinc-700 hover:border-orange-500 hover:bg-orange-500/5'
                }
            `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3 text-zinc-400">
                <div className={`p-4 rounded-full bg-zinc-800/50 ${isDragActive ? 'text-orange-500' : 'text-zinc-500'}`}>
                    <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-medium text-zinc-200">
                        {isDragActive ? 'Drop files now' : 'Drop files here or click to upload'}
                    </p>
                    <p className="text-sm text-zinc-400">
                        Support for images, videos, audio, and documents
                    </p>
                </div>
            </div>
        </div>
    );
};

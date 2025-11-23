import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface DropZoneProps {
    onFilesDropped: (files: File[]) => void;
}

export const DropZone = ({ onFilesDropped }: DropZoneProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFilesDropped(acceptedFiles);
        }
    }, [onFilesDropped]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div
            {...getRootProps()}
            className={`border border-dashed rounded-xl flex flex-row items-center justify-center px-6 transition-all duration-300 ease-in-out w-full h-20 active:scale-95 cursor-pointer
                ${isDragActive
                    ? 'border-orange-500 bg-orange-500/10 scale-[1.02]'
                    : 'border-zinc-800 bg-transparent opacity-70 hover:border-orange-500 hover:bg-orange-500/5 hover:opacity-100'
                }
            `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-row items-center gap-3">
                <UploadCloud className={`w-6 h-6 transition-colors ${isDragActive ? 'text-orange-500' : 'text-zinc-400'}`} />
                <p className="text-sm font-medium text-zinc-300">
                    {isDragActive ? 'Drop files now' : 'Drop files here or click to upload'}
                </p>
            </div>
        </div>
    );
};

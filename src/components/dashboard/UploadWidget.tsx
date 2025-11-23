import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface UploadProgress {
    fileName: string;
    progress: number;
    speed: string;
    eta: string;
}

interface UploadWidgetProps {
    uploads: UploadProgress[];
    onCancel?: (fileName: string) => void;
}

export const UploadWidget = ({ uploads, onCancel }: UploadWidgetProps) => {
    if (uploads.length === 0) return null;

    return (
        <div className="space-y-3 mb-4">
            {uploads.map((upload) => (
                <div
                    key={upload.fileName}
                    className="bg-zinc-900 border border-orange-500/30 rounded-lg p-4 shadow-lg shadow-orange-500/5 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-zinc-100 font-medium truncate flex-1 pr-4">
                            Uploading {upload.fileName}...
                        </p>
                        {onCancel && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-red-500/10"
                                onClick={() => onCancel(upload.fileName)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${upload.progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">
                            {upload.progress}% uploaded
                        </span>
                        <span className="text-zinc-400">
                            {upload.speed} • {upload.eta}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

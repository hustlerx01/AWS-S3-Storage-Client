import { X } from 'lucide-react';

interface UploadProgress {
    fileName: string;
    progress: number;
    speed: string;
    eta: string;
}

interface UploadProgressWidgetProps {
    uploads: UploadProgress[];
    onCancel?: (fileName: string) => void;
}

export const UploadProgressWidget = ({ uploads, onCancel }: UploadProgressWidgetProps) => {
    if (uploads.length === 0) return null;

    return (
        <div className="w-full space-y-3 mb-4">
            {uploads.map((upload) => (
                <div
                    key={upload.fileName}
                    className="w-full bg-zinc-900 border border-orange-500/30 rounded-lg p-4 shadow-lg shadow-orange-500/5"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-zinc-100 font-medium truncate flex-1 pr-4">
                            Uploading {upload.fileName}
                        </p>
                        {onCancel && (
                            <button
                                onClick={() => onCancel(upload.fileName)}
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 animate-pulse"
                            style={{ width: `${upload.progress}%` }}
                        />
                    </div>

                    {/* Metrics */}
                    <div className="flex justify-between text-xs text-zinc-400 mt-2">
                        <span>{upload.progress}% • {upload.speed}</span>
                        <span>{upload.eta} remaining</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

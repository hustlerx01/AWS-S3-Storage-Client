import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { s3Service } from '../../services/s3Client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Loader2, Download, FileIcon } from 'lucide-react';
import { toast } from 'sonner';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileKey: string | null;
}

export const PreviewModal = ({ isOpen, onClose, fileKey }: PreviewModalProps) => {
    const [content, setContent] = useState<string | null>(null);
    const [url, setUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fileType, setFileType] = useState<'image' | 'video' | 'audio' | 'pdf' | 'code' | 'other'>('other');

    useEffect(() => {
        if (!isOpen || !fileKey) {
            setContent(null);
            setUrl(null);
            return;
        }

        const loadPreview = async () => {
            setIsLoading(true);
            try {
                const ext = fileKey.split('.').pop()?.toLowerCase() || '';

                // Image files
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
                    setFileType('image');
                    const signedUrl = await s3Service.getPresignedUrl(fileKey);
                    setUrl(signedUrl);
                }
                // Video files
                else if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'].includes(ext)) {
                    setFileType('video');
                    // Force video content type to ensure streaming works
                    const signedUrl = await s3Service.getPresignedUrl(fileKey, 900, 'video/mp4');
                    setUrl(signedUrl);
                }
                // Audio files
                else if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext)) {
                    setFileType('audio');
                    const signedUrl = await s3Service.getPresignedUrl(fileKey);
                    setUrl(signedUrl);
                }
                // PDF files
                else if (ext === 'pdf') {
                    setFileType('pdf');
                    // Force application/pdf to ensure browser renders it
                    const signedUrl = await s3Service.getPresignedUrl(fileKey, 900, 'application/pdf');
                    setUrl(signedUrl);
                }
                // Code/Text files
                else if (['json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html', 'md', 'txt', 'yml', 'yaml', 'xml', 'sh', 'py', 'java', 'go', 'rs'].includes(ext)) {
                    setFileType('code');
                    const text = await s3Service.getFileContent(fileKey);
                    setContent(text || '');
                }
                // Unsupported files
                else {
                    setFileType('other');
                    // Still generate URL for download
                    const signedUrl = await s3Service.getPresignedUrl(fileKey);
                    setUrl(signedUrl);
                }
            } catch (error) {
                console.error("Failed to load preview", error);
                toast.error("Failed to load file preview");
            } finally {
                setIsLoading(false);
            }
        };

        loadPreview();
    }, [isOpen, fileKey]);

    const handleDownload = async () => {
        if (!fileKey || !url) return;

        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = fileKey.split('/').pop() || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Download started");
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Failed to download file");
        }
    };

    const getLanguage = (fileName: string): string => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        const langMap: Record<string, string> = {
            js: 'javascript',
            ts: 'typescript',
            tsx: 'tsx',
            jsx: 'jsx',
            json: 'json',
            py: 'python',
            java: 'java',
            go: 'go',
            rs: 'rust',
            css: 'css',
            html: 'html',
            xml: 'xml',
            md: 'markdown',
            sh: 'bash',
            yml: 'yaml',
            yaml: 'yaml'
        };
        return langMap[ext] || 'text';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] h-[90vh] flex flex-col p-0 gap-0 bg-zinc-900 border-zinc-800">
                <DialogHeader className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                    <DialogTitle className="truncate text-zinc-100">{fileKey?.split('/').pop()}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex items-center justify-center bg-zinc-950 relative">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                            <p className="text-sm text-zinc-400">Loading preview...</p>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-0">
                            {/* Image Preview */}
                            {fileType === 'image' && url && (
                                <img
                                    src={url}
                                    alt="Preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            )}

                            {/* Video Preview */}
                            {fileType === 'video' && url && (
                                <video
                                    controls
                                    autoPlay
                                    preload="metadata"
                                    className="max-w-full max-h-full"
                                    src={url}
                                    onError={(e) => {
                                        console.error("Video playback error", e);
                                        toast.error("Failed to play video. Try downloading it.");
                                    }}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            )}

                            {/* Audio Preview */}
                            {fileType === 'audio' && url && (
                                <div className="flex flex-col items-center justify-center p-8 gap-4">
                                    <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                                        <FileIcon className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <audio controls className="w-full max-w-md" src={url}>
                                        Your browser does not support the audio tag.
                                    </audio>
                                </div>
                            )}

                            {/* PDF Preview */}
                            {fileType === 'pdf' && url && (
                                <iframe
                                    src={url}
                                    className="w-full h-full border-none"
                                    title="PDF Preview"
                                />
                            )}

                            {/* Code Preview */}
                            {fileType === 'code' && content !== null && (
                                <div className="w-full h-full overflow-auto bg-[#1e1e1e]">
                                    <SyntaxHighlighter
                                        language={getLanguage(fileKey || '')}
                                        style={vscDarkPlus}
                                        customStyle={{
                                            margin: 0,
                                            padding: '1rem',
                                            background: '#1e1e1e',
                                            fontSize: '0.875rem',
                                            height: '100%'
                                        }}
                                        showLineNumbers={true}
                                    >
                                        {content}
                                    </SyntaxHighlighter>
                                </div>
                            )}

                            {/* Unsupported File Type */}
                            {fileType === 'other' && (
                                <div className="flex flex-col items-center justify-center p-12 text-zinc-400 gap-4">
                                    <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <FileIcon className="w-10 h-10 text-zinc-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-medium text-zinc-300 mb-2">
                                            Preview not available
                                        </p>
                                        <p className="text-sm text-zinc-500">
                                            This file type cannot be previewed in the browser
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="mt-4 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-orange-500"
                                        onClick={handleDownload}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download to view
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

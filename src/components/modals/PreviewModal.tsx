import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { s3Service } from '../../services/s3Client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Loader2 } from 'lucide-react';

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

                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
                    setFileType('image');
                    const signedUrl = await s3Service.getPresignedUrl(fileKey);
                    setUrl(signedUrl);
                } else if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
                    setFileType('video');
                    const signedUrl = await s3Service.getPresignedUrl(fileKey);
                    setUrl(signedUrl);
                } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
                    setFileType('audio');
                    const signedUrl = await s3Service.getPresignedUrl(fileKey);
                    setUrl(signedUrl);
                } else if (ext === 'pdf') {
                    setFileType('pdf');
                    const signedUrl = await s3Service.getPresignedUrl(fileKey);
                    setUrl(signedUrl);
                } else if (['json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html', 'md', 'txt', 'yml', 'yaml'].includes(ext)) {
                    setFileType('code');
                    const text = await s3Service.getFileContent(fileKey);
                    setContent(text || '');
                } else {
                    setFileType('other');
                }
            } catch (error) {
                console.error("Failed to load preview", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPreview();
    }, [isOpen, fileKey]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[85vh] h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="truncate">{fileKey?.split('/').pop()}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex items-center justify-center bg-muted/10 relative">
                    {isLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-4">
                            {fileType === 'image' && url && (
                                <img src={url} alt="Preview" className="max-w-full max-h-full object-contain" />
                            )}

                            {fileType === 'video' && url && (
                                <video controls className="max-w-full max-h-full" src={url}>
                                    Your browser does not support the video tag.
                                </video>
                            )}

                            {fileType === 'audio' && url && (
                                <audio controls className="w-full max-w-md" src={url}>
                                    Your browser does not support the audio tag.
                                </audio>
                            )}

                            {fileType === 'pdf' && url && (
                                <iframe
                                    src={url}
                                    className="w-full h-full rounded-md border-none"
                                    title="PDF Preview"
                                />
                            )}

                            {fileType === 'code' && content !== null && (
                                <div className="w-full h-full overflow-auto text-sm bg-[#1e1e1e] p-4 rounded-md">
                                    <SyntaxHighlighter
                                        language="javascript"
                                        style={vscDarkPlus}
                                        customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                                        showLineNumbers={true}
                                    >
                                        {content}
                                    </SyntaxHighlighter>
                                </div>
                            )}

                            {fileType === 'other' && (
                                <div className="text-center text-muted-foreground">
                                    <p className="mb-2">Preview not available for this file type.</p>
                                    <p className="text-sm">Download the file to view it.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

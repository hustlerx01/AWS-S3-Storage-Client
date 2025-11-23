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
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fileType, setFileType] = useState<'image' | 'code' | 'other'>('other');

    useEffect(() => {
        if (!isOpen || !fileKey) {
            setContent(null);
            setImageUrl(null);
            return;
        }

        const loadPreview = async () => {
            setIsLoading(true);
            try {
                const ext = fileKey.split('.').pop()?.toLowerCase();

                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
                    setFileType('image');
                    const url = await s3Service.getPresignedUrl(fileKey);
                    setImageUrl(url);
                } else if (['json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html', 'md', 'txt', 'yml', 'yaml'].includes(ext || '')) {
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
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="truncate">{fileKey?.split('/').pop()}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto min-h-[200px] flex items-center justify-center bg-muted/10 rounded-md p-4">
                    {isLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                        <>
                            {fileType === 'image' && imageUrl && (
                                <img src={imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                            )}

                            {fileType === 'code' && content !== null && (
                                <div className="w-full h-full overflow-auto text-sm">
                                    <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: '0.5rem' }}>
                                        {content}
                                    </SyntaxHighlighter>
                                </div>
                            )}

                            {fileType === 'other' && (
                                <div className="text-center text-muted-foreground">
                                    Preview not available for this file type.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

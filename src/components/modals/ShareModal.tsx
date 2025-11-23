import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { s3Service } from '../../services/s3Client';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileKeys: string[];
}

interface FileUrl {
    key: string;
    url: string;
    copied: boolean;
}

export const ShareModal = ({ isOpen, onClose, fileKeys }: ShareModalProps) => {
    const [fileUrls, setFileUrls] = useState<FileUrl[]>([]);
    const [allCopied, setAllCopied] = useState(false);
    const [duration, setDuration] = useState('900');
    const [customDuration, setCustomDuration] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const generateUrls = async () => {
            if (isOpen && fileKeys.length > 0) {
                setIsGenerating(true);
                const seconds = duration === 'custom' ? parseInt(customDuration) || 900 : parseInt(duration);
                try {
                    const urlPromises = fileKeys.map(async (key) => {
                        const url = await s3Service.getPresignedUrl(key, seconds);
                        return { key, url, copied: false };
                    });
                    const urls = await Promise.all(urlPromises);
                    setFileUrls(urls);
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to generate links");
                }
                setIsGenerating(false);
            } else {
                setFileUrls([]);
                setAllCopied(false);
            }
        };
        generateUrls();
    }, [isOpen, fileKeys, duration, customDuration]);

    const handleCopy = (index: number) => {
        navigator.clipboard.writeText(fileUrls[index].url);
        const updated = [...fileUrls];
        updated[index].copied = true;
        setFileUrls(updated);
        toast.success("Link copied to clipboard");
        setTimeout(() => {
            const reset = [...fileUrls];
            reset[index].copied = false;
            setFileUrls(reset);
        }, 2000);
    };

    const handleCopyAll = () => {
        const allLinks = fileUrls.map(f => `${f.key.split('/').pop()}: ${f.url}`).join('\n\n');
        navigator.clipboard.writeText(allLinks);
        setAllCopied(true);
        toast.success(`Copied ${fileUrls.length} links to clipboard`);
        setTimeout(() => setAllCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Share {fileKeys.length === 1 ? 'File' : `${fileKeys.length} Files`}</DialogTitle>
                    <DialogDescription>
                        Generate pre-signed URLs for sharing.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 overflow-y-auto flex-1">
                    <div className="space-y-2">
                        <Label>Expiration Duration</Label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: '5m', value: '300' },
                                { label: '15m', value: '900' },
                                { label: '1h', value: '3600' },
                                { label: '24h', value: '86400' },
                                { label: 'Custom', value: 'custom' },
                            ].map((opt) => (
                                <Button
                                    key={opt.value}
                                    variant={duration === opt.value ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setDuration(opt.value)}
                                    className={duration === opt.value
                                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                                        : "bg-transparent text-zinc-400 border border-zinc-700 hover:bg-zinc-800 hover:text-white hover:border-orange-500"
                                    }
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                        {duration === 'custom' && (
                            <div className="flex items-center gap-2 mt-2">
                                <Input
                                    type="number"
                                    placeholder="Seconds"
                                    value={customDuration}
                                    onChange={(e) => setCustomDuration(e.target.value)}
                                    className="bg-black border-zinc-800 text-zinc-100"
                                />
                                <span className="text-sm text-zinc-400">seconds</span>
                            </div>
                        )}
                    </div>

                    {isGenerating ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {fileUrls.map((fileUrl, index) => (
                                <div key={fileUrl.key} className="space-y-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                    <Label className="text-zinc-300 font-medium">{fileUrl.key.split('/').pop()}</Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            value={fileUrl.url}
                                            readOnly
                                            className="bg-black border-zinc-800 text-zinc-100 text-xs"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="px-3 bg-zinc-800 hover:bg-zinc-700"
                                            onClick={() => handleCopy(index)}
                                        >
                                            {fileUrl.copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {fileUrls.length > 1 && !isGenerating && (
                    <div className="pt-4 border-t border-zinc-800">
                        <Button
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white font-bold"
                            onClick={handleCopyAll}
                        >
                            {allCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            Copy All Links
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

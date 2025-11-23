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
    fileKey: string | null;
}

export const ShareModal = ({ isOpen, onClose, fileKey }: ShareModalProps) => {
    const [url, setUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [duration, setDuration] = useState('900');
    const [customDuration, setCustomDuration] = useState('');

    useEffect(() => {
        const generateUrl = async () => {
            if (isOpen && fileKey) {
                const seconds = duration === 'custom' ? parseInt(customDuration) || 900 : parseInt(duration);
                try {
                    const newUrl = await s3Service.getPresignedUrl(fileKey, seconds);
                    setUrl(newUrl);
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to generate link");
                }
            } else {
                setUrl('');
                setCopied(false);
            }
        };
        generateUrl();
    }, [isOpen, fileKey, duration, customDuration]);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share File</DialogTitle>
                    <DialogDescription>
                        Generate a pre-signed URL for <strong>{fileKey?.split('/').pop()}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
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
                                    variant={duration === opt.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setDuration(opt.value)}
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
                                />
                                <span className="text-sm text-muted-foreground">seconds</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">Link</Label>
                            <Input id="link" value={url} readOnly />
                        </div>
                        <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            <span className="sr-only">Copy</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

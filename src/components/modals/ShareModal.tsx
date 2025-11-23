import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
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
    const [expiresIn] = useState(900); // 15 mins

    useEffect(() => {
        if (isOpen && fileKey) {
            s3Service.getPresignedUrl(fileKey, expiresIn).then(setUrl).catch(console.error);
        } else {
            setUrl('');
            setCopied(false);
        }
    }, [isOpen, fileKey, expiresIn]);

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
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                            Link
                        </Label>
                        <Input
                            id="link"
                            defaultValue={url}
                            readOnly
                        />
                    </div>
                    <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="sr-only">Copy</span>
                    </Button>
                </div>
                <DialogFooter className="sm:justify-start">
                    <div className="text-xs text-muted-foreground">
                        Link expires in 15 minutes.
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { s3Service } from '../../services/s3Client';
import { toast } from 'sonner';
import { useFileStore } from '../../stores/useFileStore';

interface RenameModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileKey: string | null;
}

export const RenameModal = ({ isOpen, onClose, fileKey }: RenameModalProps) => {
    const [newName, setNewName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { fetchFiles, currentPrefix } = useFileStore();

    useEffect(() => {
        if (isOpen && fileKey) {
            setNewName(fileKey.split('/').pop() || '');
        }
    }, [isOpen, fileKey]);

    const handleRename = async () => {
        if (!fileKey || !newName) return;

        setIsLoading(true);
        try {
            const newKey = currentPrefix + newName;
            // S3 doesn't support rename, so we copy then delete
            await s3Service.copyFile(fileKey, newKey);
            await s3Service.deleteFile(fileKey);
            toast.success("File renamed successfully");
            fetchFiles();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to rename file");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rename File</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleRename} disabled={isLoading}>
                        {isLoading ? "Renaming..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

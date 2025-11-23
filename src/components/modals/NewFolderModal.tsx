import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { s3Service } from '../../services/s3Client';
import { useFileStore } from '../../stores/useFileStore';
import { toast } from 'sonner';

interface NewFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NewFolderModal = ({ isOpen, onClose }: NewFolderModalProps) => {
    const [folderName, setFolderName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { currentPrefix, fetchFiles } = useFileStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!folderName.trim()) return;

        setIsLoading(true);
        try {
            const fullPath = currentPrefix + folderName.trim();
            await s3Service.createFolder(fullPath);
            toast.success("Folder created successfully");
            await fetchFiles();
            setFolderName('');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create folder");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-zinc-400">Folder Name</Label>
                        <Input
                            id="name"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            placeholder="e.g., Documents"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} className="bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800 border-none">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !folderName.trim()}>
                            {isLoading ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { s3Service } from '../../services/s3Client';
import { toast } from 'sonner';
import { useFileStore } from '../../stores/useFileStore';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileKey: string | null;
}

export const DeleteModal = ({ isOpen, onClose, fileKey }: DeleteModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const { fetchFiles } = useFileStore();

    const handleDelete = async () => {
        if (!fileKey) return;

        setIsLoading(true);
        try {
            await s3Service.deleteFile(fileKey);
            toast.success("File deleted successfully");
            fetchFiles();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete file");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete File</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{fileKey?.split('/').pop()}</strong>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="bg-transparent text-zinc-400 border border-zinc-700 hover:bg-zinc-800 hover:text-white hover:border-zinc-600"
                    >
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

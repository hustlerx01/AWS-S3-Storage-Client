import { Download, Trash2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useFileStore } from '../../stores/useFileStore';
import { s3Service } from '../../services/s3Client';
import { toast } from 'sonner';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

export const ActionBar = () => {
    const { selectedFiles, clearSelection, fetchFiles } = useFileStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (selectedFiles.size === 0) return null;

    const handleDownload = async () => {
        try {
            toast.info("Preparing download...");
            await s3Service.downloadFiles(Array.from(selectedFiles));
            toast.success("Download started");
            clearSelection();
        } catch (error) {
            console.error(error);
            toast.error("Failed to download files");
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await s3Service.deleteFiles(Array.from(selectedFiles));
            toast.success(`Deleted ${selectedFiles.size} files`);
            clearSelection();
            await fetchFiles();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete files");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full shadow-lg flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4">
                <span className="font-medium">{selectedFiles.size} selected</span>
                <div className="h-4 w-px bg-background/20" />
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-background hover:bg-background/20 hover:text-background"
                    onClick={handleDownload}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-400/20 hover:text-red-300"
                    onClick={() => setShowDeleteConfirm(true)}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-6 w-6 rounded-full hover:bg-background/20 text-background"
                    onClick={clearSelection}
                >
                    <X className="w-3 h-3" />
                </Button>
            </div>

            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete {selectedFiles.size} items?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. These files will be permanently deleted from your bucket.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

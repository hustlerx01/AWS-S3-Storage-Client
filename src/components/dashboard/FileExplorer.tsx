import { useEffect, useState } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { FileGrid } from './FileGrid';
import { FileList } from './FileList';
import { FilterBar } from './FilterBar';
import { Breadcrumbs } from './Breadcrumbs';
import { UploadZone } from './UploadZone';
import { PreviewModal } from '../modals/PreviewModal';
import { ShareModal } from '../modals/ShareModal';
import { RenameModal } from '../modals/RenameModal';
import { DeleteModal } from '../modals/DeleteModal';
import { CorsHelpModal } from '../modals/CorsHelpModal';
import { Button } from '../ui/button';
import { LayoutGrid, List as ListIcon, RefreshCw, Upload as UploadIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { s3Service } from '../../services/s3Client';
import { toast } from 'sonner';

export const FileExplorer = () => {
    const {
        files,
        folders,
        isLoading,
        error,
        viewMode,
        setViewMode,
        fetchFiles,
        currentPrefix,
        clearError
    } = useFileStore();

    const [previewFile, setPreviewFile] = useState<string | null>(null);
    const [shareFile, setShareFile] = useState<string | null>(null);
    const [renameFile, setRenameFile] = useState<string | null>(null);
    const [deleteFile, setDeleteFile] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, [currentPrefix, fetchFiles]);

    const handleDownload = async (key: string) => {
        try {
            const url = await s3Service.getPresignedUrl(key);
            const link = document.createElement('a');
            link.href = url;
            link.download = key.split('/').pop() || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error(error);
            toast.error("Failed to download file");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Breadcrumbs />

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => fetchFiles()} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <div className="border-l h-6 mx-1" />
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                    >
                        <ListIcon className="w-4 h-4" />
                    </Button>
                    <div className="border-l h-6 mx-1" />
                    <Dialog open={showUpload} onOpenChange={setShowUpload}>
                        <DialogTrigger asChild>
                            <Button>
                                <UploadIcon className="w-4 h-4 mr-2" />
                                Upload
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <UploadZone />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <FilterBar />

            <div className="min-h-[400px] border rounded-lg p-4 bg-card relative">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <FileGrid
                                files={files}
                                folders={folders}
                                onPreview={setPreviewFile}
                                onShare={setShareFile}
                                onRename={setRenameFile}
                                onDelete={setDeleteFile}
                                onDownload={handleDownload}
                            />
                        ) : (
                            <FileList
                                files={files}
                                folders={folders}
                                onPreview={setPreviewFile}
                                onShare={setShareFile}
                                onRename={setRenameFile}
                                onDelete={setDeleteFile}
                                onDownload={handleDownload}
                            />
                        )}

                        {!isLoading && files.length === 0 && folders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <p>This folder is empty.</p>
                                <Button variant="link" onClick={() => setShowUpload(true)}>Upload a file</Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <PreviewModal
                isOpen={!!previewFile}
                fileKey={previewFile}
                onClose={() => setPreviewFile(null)}
            />
            <ShareModal
                isOpen={!!shareFile}
                fileKey={shareFile}
                onClose={() => setShareFile(null)}
            />
            <RenameModal
                isOpen={!!renameFile}
                fileKey={renameFile}
                onClose={() => setRenameFile(null)}
            />
            <DeleteModal
                isOpen={!!deleteFile}
                fileKey={deleteFile}
                onClose={() => setDeleteFile(null)}
            />
            <CorsHelpModal
                isOpen={!!error}
                onClose={clearError}
            />
        </div>
    );
};

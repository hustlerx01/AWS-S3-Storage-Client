import { useEffect, useState, useCallback } from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { FileGrid } from './FileGrid';
import { FileList } from './FileList';
import { Toolbar } from './Toolbar';
import { ActionBar } from './ActionBar';
import { DropZone } from './DropZone';
import { PreviewModal } from '../modals/PreviewModal';
import { ShareModal } from '../modals/ShareModal';
import { RenameModal } from '../modals/RenameModal';
import { DeleteModal } from '../modals/DeleteModal';
import { CorsHelpModal } from '../modals/CorsHelpModal';
import { UploadProgressWidget } from './UploadProgressWidget';
import { Button } from '../ui/button';
import { LayoutGrid, List as ListIcon, RefreshCw, Download, Trash2, Share2 } from 'lucide-react';

import { s3Service } from '../../services/s3Client';
import { toast } from 'sonner';
import { S3File } from '../../stores/useFileStore';

interface UploadState {
    fileName: string;
    progress: number;
    speed: string;
    eta: string;
    startTime: number;
    totalBytes: number;
    loadedBytes: number;
}

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
        clearError,
        filterType,
        searchQuery,
        selectedFiles
    } = useFileStore();

    const [previewFile, setPreviewFile] = useState<string | null>(null);
    const [shareFiles, setShareFiles] = useState<string[]>([]);
    const [renameFile, setRenameFile] = useState<string | null>(null);
    const [deleteFile, setDeleteFile] = useState<string | null>(null);

    // Upload State
    const [uploads, setUploads] = useState<UploadState[]>([]);


    useEffect(() => {
        fetchFiles();
    }, [currentPrefix, fetchFiles]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTime = (seconds: number) => {
        if (!isFinite(seconds) || seconds < 0) return 'Calculating...';
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    };

    const handleFilesDropped = useCallback(async (droppedFiles: File[]) => {
        const newUploads = droppedFiles.map(file => ({
            fileName: file.name,
            progress: 0,
            speed: '0 MB/s',
            eta: 'Calculating...',
            startTime: Date.now(),
            totalBytes: file.size,
            loadedBytes: 0
        }));

        setUploads(prev => [...prev, ...newUploads]);

        droppedFiles.forEach(async (file) => {
            try {
                await s3Service.uploadFile(file, currentPrefix, (progressData) => {
                    setUploads(prev => prev.map(u => {
                        if (u.fileName !== file.name) return u;

                        const now = Date.now();
                        const timeElapsed = (now - u.startTime) / 1000; // seconds

                        const currentLoaded = progressData.loaded;
                        const total = progressData.total;
                        const progressPercent = Math.round((currentLoaded / total) * 100);

                        const bytesPerSecond = timeElapsed > 0 ? currentLoaded / timeElapsed : 0;

                        const remainingBytes = total - currentLoaded;
                        const secondsRemaining = bytesPerSecond > 0 ? remainingBytes / bytesPerSecond : 0;

                        return {
                            ...u,
                            progress: progressPercent,
                            loadedBytes: currentLoaded,
                            speed: `${formatBytes(bytesPerSecond)}/s`,
                            eta: formatTime(secondsRemaining)
                        };
                    }));
                });

                toast.success(`Uploaded ${file.name}`);

                // Remove from uploads list after a short delay
                setTimeout(() => {
                    setUploads(prev => prev.filter(u => u.fileName !== file.name));
                    fetchFiles();
                }, 1000);

            } catch (error) {
                console.error(`Failed to upload ${file.name}`, error);
                toast.error(`Failed to upload ${file.name}`);
                setUploads(prev => prev.filter(u => u.fileName !== file.name));
            }
        });
    }, [currentPrefix, fetchFiles]);

    const handleCancelUpload = (fileName: string) => {
        setUploads(prev => prev.filter(u => u.fileName !== fileName));
        toast.info(`Cancelled upload for ${fileName}`);
    };

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

    const handlePreview = (file: string) => {
        setPreviewFile(file);
    };

    const handleView = async (key: string) => {
        try {
            const url = await s3Service.getPresignedUrl(key, 3600, 'inline');
            window.open(url, '_blank');
        } catch (error) {
            console.error("Failed to open file", error);
            toast.error("Failed to open file");
        }
    };

    const filteredFiles = files.filter(file => {
        const name = file.key.split('/').pop()?.toLowerCase() || '';
        const matchesSearch = name.includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filterType === 'all') return true;
        const ext = name.split('.').pop();
        if (filterType === 'image') return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
        if (filterType === 'video') return ['mp4', 'webm', 'mov', 'avi'].includes(ext || '');
        if (filterType === 'audio') return ['mp3', 'wav', 'ogg'].includes(ext || '');
        if (filterType === 'doc') return ['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext || '');
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div className="flex flex-col gap-6">
                <Toolbar />
                <DropZone onFilesDropped={handleFilesDropped} />
                <UploadProgressWidget uploads={uploads} onCancel={handleCancelUpload} />
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => fetchFiles()} disabled={isLoading} className="border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-orange-500">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <div className="border-l border-zinc-800 h-6 mx-1" />
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                        className={viewMode === 'grid' ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                        className={viewMode === 'list' ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}
                    >
                        <ListIcon className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="min-h-[400px] bg-transparent relative">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <FileGrid
                                files={filteredFiles}
                                folders={folders}
                                onPreview={setPreviewFile}
                                onView={handleView}
                                onShare={(key) => setShareFiles([key])}
                                onRename={setRenameFile}
                                onDelete={setDeleteFile}
                                onDownload={handleDownload}
                                onFolderClick={(folder) => {
                                    useFileStore.getState().setCurrentPrefix(folder);
                                }}
                                currentPrefix={currentPrefix}
                            />
                        ) : (
                            <FileList
                                files={filteredFiles}
                                folders={folders}
                                onPreview={setPreviewFile}
                                onView={handleView}
                                onShare={(key) => setShareFiles([key])}
                                onRename={setRenameFile}
                                onDelete={setDeleteFile}
                                onDownload={handleDownload}
                                onFolderClick={(folder) => {
                                    useFileStore.getState().setCurrentPrefix(folder);
                                }}
                                currentPrefix={currentPrefix}
                            />
                        )}

                        {!isLoading && filteredFiles.length === 0 && folders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <p>This folder is empty.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedFiles.size > 0 && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg p-4 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <span className="text-zinc-200 font-medium">{selectedFiles.size} selected</span>
                    <div className="h-6 w-px bg-zinc-800" />
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => {
                        toast.info("Bulk download coming soon");
                    }}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                    <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10" onClick={() => {
                        setShareFiles(Array.from(selectedFiles));
                    }}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => {
                        toast.info("Bulk delete coming soon");
                    }}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                    <div className="h-6 w-px bg-zinc-800" />
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => useFileStore.getState().clearSelection()}>
                        Cancel
                    </Button>
                </div>
            )}

            <ActionBar />

            <PreviewModal
                isOpen={!!previewFile}
                fileKey={previewFile}
                onClose={() => setPreviewFile(null)}
            />
            <ShareModal
                isOpen={shareFiles.length > 0}
                fileKeys={shareFiles}
                onClose={() => setShareFiles([])}
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
        </div >
    );
};

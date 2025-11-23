import { type S3File, useFileStore } from '../../stores/useFileStore';
import { Card, CardContent, CardFooter } from '../ui/card';
import { MoreVertical, Download, Trash2, Copy, Share2 } from 'lucide-react';
import { FileIcon } from '../ui/FileIcon';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { formatBytes } from '../../lib/utils';
import DOMPurify from 'dompurify';
import { useState, useEffect } from 'react';
import { s3Service } from '../../services/s3Client';

interface FileGridProps {
    files: S3File[];
    folders: string[];
    onPreview: (key: string) => void;
    onShare: (key: string) => void;
    onRename: (key: string) => void;
    onDelete: (key: string) => void;
    onDownload: (key: string) => void;
}

const FileThumbnail = ({ fileKey, fileName }: { fileKey: string, fileName: string }) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchUrl = async () => {
            try {
                const signedUrl = await s3Service.getPresignedUrl(fileKey);
                if (mounted) setUrl(signedUrl);
            } catch (error) {
                console.error("Failed to load thumbnail", error);
            }
        };
        fetchUrl();
        return () => { mounted = false; };
    }, [fileKey]);

    if (!url) return <div className="w-full h-full bg-muted/20 animate-pulse" />;

    return (
        <img
            src={url}
            alt={fileName}
            className="w-full h-full object-cover"
            loading="lazy"
        />
    );
};

export const FileGrid = ({ files, folders, onPreview, onShare, onRename, onDelete, onDownload }: FileGridProps) => {
    const { setPrefix, currentPrefix, selectedFiles, toggleSelection, clearSelection } = useFileStore();

    const handleFolderClick = (folder: string) => {
        setPrefix(folder);
        clearSelection();
    };

    const sanitize = (name: string) => DOMPurify.sanitize(name);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {folders.map((folder) => {
                const relativeName = folder.replace(currentPrefix, '').replace('/', '');

                return (
                    <Card
                        key={folder}
                        className="bg-zinc-900 hover:bg-zinc-800/80 cursor-pointer transition-all duration-200 border-zinc-800 hover:border-orange-500/50 hover:shadow-sm group active:scale-95"
                        onClick={() => handleFolderClick(folder)}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                            <div className="p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                                <FileIcon fileName="folder" isFolder={true} className="w-8 h-8" />
                            </div>
                            <span className="font-medium text-sm truncate w-full text-center text-zinc-100 group-hover:text-white" title={relativeName}>
                                {sanitize(relativeName)}
                            </span>
                        </CardContent>
                    </Card>
                );
            })}

            {files.map((file) => {
                const fileName = file.key.replace(currentPrefix, '');
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                const isSelected = selectedFiles.has(file.key);

                return (
                    <Card
                        key={file.key}
                        className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg bg-zinc-900 border border-zinc-800 rounded-xl active:scale-95 ${isSelected ? 'ring-2 ring-orange-500 border-orange-500 bg-zinc-800' : 'hover:border-orange-500 hover:shadow-orange-500/10'
                            }`}
                        onClick={() => toggleSelection(file.key)}
                    >
                        <div className="absolute top-2 left-2 z-10">
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSelection(file.key)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <CardContent className="p-0 h-48 flex items-center justify-center bg-zinc-950/50 group-hover:bg-zinc-950/70 transition-colors" onClick={() => onPreview(file.key)}>
                            {isImage ? (
                                <FileThumbnail fileKey={file.key} fileName={fileName} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <FileIcon fileName={fileName} className="w-12 h-12" />
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-3 flex justify-between items-center bg-transparent border-t border-zinc-800">
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate w-24 text-zinc-100" title={fileName}>
                                    {sanitize(fileName)}
                                </span>
                                <span className="text-xs text-zinc-500">
                                    {formatBytes(file.size)}
                                </span>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-orange-500 active:scale-95 transition-all duration-100" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem onClick={() => onDownload(file.key)}>
                                        <Download className="w-4 h-4 mr-2" /> Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onShare(file.key)}>
                                        <Share2 className="w-4 h-4 mr-2" /> Share Link
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onRename(file.key)}>
                                        <Copy className="w-4 h-4 mr-2" /> Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => onDelete(file.key)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
};

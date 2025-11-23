
import { type S3File, useFileStore } from '../../stores/useFileStore';
import { Card, CardContent, CardFooter } from '../ui/card';
import { FileIcon, FolderIcon, MoreVertical, Download, Trash2, Copy, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { formatBytes } from '../../lib/utils';
import DOMPurify from 'dompurify';

interface FileGridProps {
    files: S3File[];
    folders: string[];
    onPreview: (key: string) => void;
    onShare: (key: string) => void;
    onRename: (key: string) => void;
    onDelete: (key: string) => void;
    onDownload: (key: string) => void;
}

export const FileGrid = ({ files, folders, onPreview, onShare, onRename, onDelete, onDownload }: FileGridProps) => {
    const { setPrefix, currentPrefix } = useFileStore();

    const handleFolderClick = (folder: string) => {
        setPrefix(folder);
    };

    const sanitize = (name: string) => DOMPurify.sanitize(name);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {folders.map((folder) => {
                const relativeName = folder.replace(currentPrefix, '').replace('/', '');

                return (
                    <Card
                        key={folder}
                        className="hover:bg-accent/50 cursor-pointer transition-colors border-border/60"
                        onClick={() => handleFolderClick(folder)}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                            <FolderIcon className="w-12 h-12 text-blue-400 fill-blue-400/20" />
                            <span className="font-medium text-sm truncate w-full text-center" title={relativeName}>
                                {sanitize(relativeName)}
                            </span>
                        </CardContent>
                    </Card>
                );
            })}

            {files.map((file) => {
                const fileName = file.key.replace(currentPrefix, '');
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

                return (
                    <Card
                        key={file.key}
                        className="group relative overflow-hidden border-border/60 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => onPreview(file.key)}
                    >
                        <CardContent className="p-0 aspect-square flex items-center justify-center bg-muted/20">
                            {isImage ? (
                                <FileIcon className="w-10 h-10 text-muted-foreground" />
                            ) : (
                                <FileIcon className="w-10 h-10 text-muted-foreground" />
                            )}
                        </CardContent>
                        <CardFooter className="p-3 flex justify-between items-center bg-card border-t">
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate w-24" title={fileName}>
                                    {sanitize(fileName)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatBytes(file.size)}
                                </span>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
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

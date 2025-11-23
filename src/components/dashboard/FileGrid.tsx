import { type S3File, useFileStore } from '../../stores/useFileStore';
import { Card, CardContent, CardFooter } from '../ui/card';
import { FileIcon, FolderIcon, MoreVertical, Download, Trash2, Copy, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
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
                        className="hover:bg-accent/50 cursor-pointer transition-all duration-200 border-border/60 hover:border-primary/50 hover:shadow-sm group"
                        onClick={() => handleFolderClick(folder)}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                            <div className="p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                                <FolderIcon className="w-8 h-8 text-blue-500 fill-blue-500/20" />
                            </div>
                            <span className="font-medium text-sm truncate w-full text-center text-foreground/80 group-hover:text-foreground" title={relativeName}>
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
                        className={`group relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50'
                            }`}
                        onClick={() => toggleSelection(file.key)}
                    >
                        <div className={`absolute top-2 left-2 z-10 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSelection(file.key)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <CardContent className="p-0 aspect-square flex items-center justify-center bg-muted/20 group-hover:bg-muted/30 transition-colors" onClick={() => onPreview(file.key)}>
                            {isImage ? (
                                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                    <FileIcon className="w-12 h-12 text-muted-foreground/50" />
                                </div>
                            ) : (
                                <FileIcon className="w-12 h-12 text-muted-foreground/50" />
                            )}
                        </CardContent>
                        <CardFooter className="p-3 flex justify-between items-center bg-card border-t">
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate w-24 text-foreground/90" title={fileName}>
                                    {sanitize(fileName)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatBytes(file.size)}
                                </span>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
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

import { type S3File, useFileStore } from '../../stores/useFileStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { FileIcon, FolderIcon, MoreVertical, Download, Trash2, Copy, Share2, FileText, FileType2, Sheet, Video, Music, Archive } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { formatBytes } from '../../lib/utils';
import DOMPurify from 'dompurify';

interface FileListProps {
    files: S3File[];
    folders: string[];
    onPreview: (key: string) => void;
    onShare: (key: string) => void;
    onRename: (key: string) => void;
    onDelete: (key: string) => void;
    onDownload: (key: string) => void;
}

const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return <FileText className="w-4 h-4 text-red-500" />;
    if (['doc', 'docx'].includes(ext || '')) return <FileType2 className="w-4 h-4 text-blue-500" />;
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <Sheet className="w-4 h-4 text-green-500" />;
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) return <Video className="w-4 h-4 text-purple-500" />;
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return <Music className="w-4 h-4 text-yellow-500" />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return <Archive className="w-4 h-4 text-orange-500" />;
    return <FileIcon className="w-4 h-4 text-muted-foreground" />;
};

export const FileList = ({ files, folders, onPreview, onShare, onRename, onDelete, onDownload }: FileListProps) => {
    const { setPrefix, currentPrefix } = useFileStore();

    const handleFolderClick = (folder: string) => {
        setPrefix(folder);
    };

    const sanitize = (name: string) => DOMPurify.sanitize(name);

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50%]">Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {folders.map((folder) => {
                        const relativeName = folder.replace(currentPrefix, '').replace('/', '');
                        return (
                            <TableRow
                                key={folder}
                                className="cursor-pointer hover:bg-accent/50"
                                onClick={() => handleFolderClick(folder)}
                            >
                                <TableCell className="font-medium flex items-center gap-2">
                                    <FolderIcon className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                                    {sanitize(relativeName)}
                                </TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        );
                    })}

                    {files.map((file) => {
                        const fileName = file.key.replace(currentPrefix, '');
                        return (
                            <TableRow
                                key={file.key}
                                className="cursor-pointer hover:bg-accent/50"
                                onClick={() => onPreview(file.key)}
                            >
                                <TableCell className="flex items-center gap-2">
                                    {getFileIcon(fileName)}
                                    {sanitize(fileName)}
                                </TableCell>
                                <TableCell>{formatBytes(file.size)}</TableCell>
                                <TableCell>{file.lastModified.toLocaleDateString()}</TableCell>
                                <TableCell>
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
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

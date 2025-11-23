import { type S3File, useFileStore } from '../../stores/useFileStore';
import { TableCell, TableRow } from '../ui/table';
import { Eye, Download, Share2, Edit2, Trash2 } from 'lucide-react';
import { FileIcon } from '../ui/FileIcon';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { formatBytes } from '../../lib/utils';
import DOMPurify from 'dompurify';
import { Badge } from '../ui/badge';

interface FileRowProps {
    file: S3File;
    currentPrefix: string;
    onPreview: (key: string) => void;
    onShare: (key: string) => void;
    onRename: (key: string) => void;
    onDelete: (key: string) => void;
    onDownload: (key: string) => void;
}

const getFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return { type: 'Image', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return { type: 'Video', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    if (['mp3', 'wav', 'ogg'].includes(ext)) return { type: 'Audio', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    if (['pdf'].includes(ext)) return { type: 'PDF', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (['doc', 'docx'].includes(ext)) return { type: 'Document', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    if (['xls', 'xlsx', 'csv'].includes(ext)) return { type: 'Spreadsheet', color: 'bg-green-500/10 text-green-400 border-green-500/20' };
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return { type: 'Archive', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    return { type: 'File', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
};

export const FileRow = ({ file, currentPrefix, onPreview, onShare, onRename, onDelete, onDownload }: FileRowProps) => {
    const { selectedFiles, toggleSelection } = useFileStore();
    const fileName = file.key.replace(currentPrefix, '');
    const sanitize = (name: string) => DOMPurify.sanitize(name);
    const { type, color } = getFileType(fileName);

    return (
        <TableRow className="group bg-black hover:bg-orange-950/30 border-zinc-800 transition-all border-l-2 border-l-transparent hover:border-l-orange-500 active:scale-95 duration-100">
            <TableCell className="w-[50px]">
                <Checkbox
                    checked={selectedFiles.has(file.key)}
                    onCheckedChange={() => toggleSelection(file.key)}
                    onClick={(e) => e.stopPropagation()}
                />
            </TableCell>
            <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                    <FileIcon fileName={fileName} />
                    <span className="text-zinc-200 group-hover:text-white transition-colors">
                        {sanitize(fileName)}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className={`${color} border`}>
                    {type}
                </Badge>
            </TableCell>
            <TableCell className="text-zinc-400">
                {formatBytes(file.size)}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10 active:scale-95 transition-all duration-100" onClick={() => onPreview(file.key)} title="Preview">
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-green-400 hover:bg-green-400/10 active:scale-95 transition-all duration-100" onClick={() => onDownload(file.key)} title="Download">
                        <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-orange-400 hover:bg-orange-400/10 active:scale-95 transition-all duration-100" onClick={() => onShare(file.key)} title="Share">
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-yellow-400 hover:bg-yellow-400/10 active:scale-95 transition-all duration-100" onClick={() => onRename(file.key)} title="Rename">
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all duration-100" onClick={() => onDelete(file.key)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
};

import { type S3File, useFileStore } from '../../stores/useFileStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { FolderIcon } from 'lucide-react';
import DOMPurify from 'dompurify';
import { FileRow } from './FileRow';

interface FileListProps {
    files: S3File[];
    folders: string[];
    onPreview: (key: string) => void;
    onShare: (key: string) => void;
    onRename: (key: string) => void;
    onDelete: (key: string) => void;
    onDownload: (key: string) => void;
}

export const FileList = ({ files, folders, onPreview, onShare, onRename, onDelete, onDownload }: FileListProps) => {
    const { setPrefix, currentPrefix } = useFileStore();

    const handleFolderClick = (folder: string) => {
        setPrefix(folder);
    };

    const sanitize = (name: string) => DOMPurify.sanitize(name);

    return (
        <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50">
            <Table>
                <TableHeader className="bg-zinc-900/50">
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="w-[40%] text-zinc-400">Name</TableHead>
                        <TableHead className="w-[20%] text-zinc-400">Type</TableHead>
                        <TableHead className="w-[15%] text-zinc-400">Size</TableHead>
                        <TableHead className="text-right text-zinc-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {folders.map((folder) => {
                        const relativeName = folder.replace(currentPrefix, '').replace('/', '');
                        return (
                            <TableRow
                                key={folder}
                                className="cursor-pointer hover:bg-zinc-900/50 border-zinc-800 transition-colors"
                                onClick={() => handleFolderClick(folder)}
                            >
                                <TableCell className="font-medium flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <FolderIcon className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                                    </div>
                                    <span className="text-zinc-200">{sanitize(relativeName)}</span>
                                </TableCell>
                                <TableCell className="text-zinc-500">Folder</TableCell>
                                <TableCell className="text-zinc-500">-</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        );
                    })}

                    {files.map((file) => (
                        <FileRow
                            key={file.key}
                            file={file}
                            currentPrefix={currentPrefix}
                            onPreview={onPreview}
                            onShare={onShare}
                            onRename={onRename}
                            onDelete={onDelete}
                            onDownload={onDownload}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

import { type S3File, useFileStore } from '../../stores/useFileStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import DOMPurify from 'dompurify';
import { FileRow } from './FileRow';
import { FileIcon } from '../ui/FileIcon';
import { Checkbox } from '../ui/checkbox';

interface FileListProps {
    files: S3File[];
    folders: string[];
    onPreview: (key: string) => void;
    onView: (key: string) => void;
    onShare: (key: string) => void;
    onRename: (key: string) => void;
    onDelete: (key: string) => void;
    onDownload: (key: string) => void;
    onFolderClick: (folder: string) => void;
    currentPrefix: string;
}

export const FileList = ({ files, folders, onPreview, onView, onShare, onRename, onDelete, onDownload, onFolderClick, currentPrefix }: FileListProps) => {
    const { selectedFiles, selectAll, clearSelection } = useFileStore();

    const handleFolderClick = (folder: string) => {
        onFolderClick(folder);
    };

    const sanitize = (name: string) => DOMPurify.sanitize(name);

    return (
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-black">
            <Table>
                <TableHeader className="bg-zinc-900/50 border-b border-zinc-800">
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="w-[50px]">
                            <Checkbox
                                checked={files.length > 0 && selectedFiles.size === files.length}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        selectAll(files.map(f => f.key));
                                    } else {
                                        clearSelection();
                                    }
                                }}
                            />
                        </TableHead>
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
                                className="cursor-pointer bg-black hover:bg-orange-950/30 border-zinc-800 transition-all border-l-2 border-l-transparent hover:border-l-orange-500"
                                onClick={() => handleFolderClick(folder)}
                            >
                                <TableCell></TableCell>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <FileIcon fileName={relativeName} isFolder={true} />
                                    <span className="text-zinc-200 group-hover:text-white">{sanitize(relativeName)}</span>
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
                            onView={onView}
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

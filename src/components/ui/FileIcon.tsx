import { FileIcon as DefaultIcon, FileText, FileType2, Sheet, Video, Music, Archive, Folder } from 'lucide-react';

interface FileIconProps {
    fileName: string;
    className?: string;
    isFolder?: boolean;
}

export const FileIcon = ({ fileName, className = "w-5 h-5", isFolder = false }: FileIconProps) => {
    if (isFolder) {
        return <Folder className={`${className} fill-orange-500 text-orange-500`} />;
    }

    const ext = fileName.split('.').pop()?.toLowerCase();

    if (['pdf'].includes(ext || '')) return <FileText className={`${className} text-red-500`} />;
    if (['doc', 'docx'].includes(ext || '')) return <FileType2 className={`${className} text-blue-500`} />;
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <Sheet className={`${className} text-green-500`} />;
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) return <Video className={`${className} text-purple-500`} />;
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return <Music className={`${className} text-yellow-500`} />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return <Archive className={`${className} text-orange-500`} />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return <DefaultIcon className={`${className} text-blue-400`} />;

    return <DefaultIcon className={`${className} text-zinc-500`} />;
};

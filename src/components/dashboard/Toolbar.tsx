import { Search, FolderPlus, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useFileStore } from '../../stores/useFileStore';
import { useState } from 'react';
import { NewFolderModal } from '../modals/NewFolderModal';
import { Breadcrumbs } from './Breadcrumbs';

export const Toolbar = () => {
    const {
        filterType,
        setFilterType,
        searchQuery,
        setSearchQuery
    } = useFileStore();

    const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
                <Breadcrumbs />
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsNewFolderOpen(true)}
                        className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-orange-500 hover:border-orange-500/50 h-9"
                    >
                        <FolderPlus className="w-4 h-4 mr-2 text-orange-500" />
                        New Folder
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-orange-500/50"
                    />
                </div>

                <div className="relative hidden md:block">
                    <Filter className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="h-10 pl-9 pr-4 rounded-md bg-zinc-800 border-none text-sm text-zinc-200 focus:ring-2 focus:ring-orange-500/50 outline-none cursor-pointer appearance-none min-w-[140px]"
                    >
                        <option value="all">All Files</option>
                        <option value="image">Images</option>
                        <option value="video">Videos</option>
                        <option value="audio">Audio</option>
                        <option value="doc">Documents</option>
                        <option value="other">Others</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => setIsNewFolderOpen(true)}
                    className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-orange-500 hover:border-orange-500/50"
                >
                    <FolderPlus className="w-4 h-4 mr-2 text-orange-500" />
                    New Folder
                </Button>
            </div>

            <NewFolderModal
                isOpen={isNewFolderOpen}
                onClose={() => setIsNewFolderOpen(false)}
            />
        </div>
    );
};

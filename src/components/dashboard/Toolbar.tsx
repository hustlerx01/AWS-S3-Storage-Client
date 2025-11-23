import { Search, FolderPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { useFileStore } from '../../stores/useFileStore';
import { useState } from 'react';
import { NewFolderModal } from '../modals/NewFolderModal';

export const Toolbar = () => {
    const {
        filterType,
        setFilterType,
        searchQuery,
        setSearchQuery
    } = useFileStore();

    const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 bg-card border rounded-lg shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)} className="hidden md:block">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="image">Images</TabsTrigger>
                        <TabsTrigger value="video">Videos</TabsTrigger>
                        <TabsTrigger value="audio">Audio</TabsTrigger>
                        <TabsTrigger value="doc">Docs</TabsTrigger>
                        <TabsTrigger value="other">Other</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={() => setIsNewFolderOpen(true)}>
                    <FolderPlus className="w-4 h-4 mr-2" />
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

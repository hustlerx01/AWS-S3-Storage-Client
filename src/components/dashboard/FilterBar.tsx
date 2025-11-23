
import { useFileStore } from '../../stores/useFileStore';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Image, FileVideo, FileText, Code, Layers } from 'lucide-react';

export const FilterBar = () => {
    const { filterType, setFilterType } = useFileStore();

    return (
        <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-5 max-w-[600px]">
                <TabsTrigger value="all" className="flex gap-2">
                    <Layers className="w-4 h-4" />
                    <span className="hidden sm:inline">All</span>
                </TabsTrigger>
                <TabsTrigger value="image" className="flex gap-2">
                    <Image className="w-4 h-4" />
                    <span className="hidden sm:inline">Images</span>
                </TabsTrigger>
                <TabsTrigger value="video" className="flex gap-2">
                    <FileVideo className="w-4 h-4" />
                    <span className="hidden sm:inline">Videos</span>
                </TabsTrigger>
                <TabsTrigger value="doc" className="flex gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Docs</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="flex gap-2">
                    <Code className="w-4 h-4" />
                    <span className="hidden sm:inline">Code</span>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
};

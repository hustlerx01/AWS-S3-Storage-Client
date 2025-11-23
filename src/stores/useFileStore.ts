import { create } from 'zustand';
import { s3Service } from '../services/s3Client';

export interface S3File {
    key: string;
    lastModified: Date;
    size: number;
}


interface FileState {
    currentPrefix: string;
    files: S3File[];
    folders: string[];
    isLoading: boolean;
    error: string | null;
    viewMode: 'grid' | 'list';
    selectedFiles: Set<string>;
    searchQuery: string;
    filterType: 'all' | 'image' | 'video' | 'audio' | 'doc' | 'other';

    setPrefix: (prefix: string) => void;
    setViewMode: (mode: 'grid' | 'list') => void;
    setFilterType: (type: 'all' | 'image' | 'video' | 'audio' | 'doc' | 'other') => void;
    setSearchQuery: (query: string) => void;
    toggleSelection: (key: string) => void;
    selectAll: (keys: string[]) => void;
    clearSelection: () => void;
    fetchFiles: () => Promise<void>;
    clearError: () => void;
}

export const useFileStore = create<FileState>((set, get) => ({
    currentPrefix: '',
    files: [],
    folders: [],
    isLoading: false,
    error: null,
    viewMode: 'grid',
    filterType: 'all',
    selectedFiles: new Set(),
    searchQuery: '',

    setPrefix: (prefix) => {
        set({ currentPrefix: prefix, selectedFiles: new Set() });
        get().fetchFiles();
    },

    setViewMode: (mode) => set({ viewMode: mode }),
    setFilterType: (type) => set({ filterType: type }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    toggleSelection: (key) => {
        set((state) => {
            const newSelection = new Set(state.selectedFiles);
            if (newSelection.has(key)) {
                newSelection.delete(key);
            } else {
                newSelection.add(key);
            }
            return { selectedFiles: newSelection };
        });
    },

    selectAll: (keys) => {
        set((state) => {
            const newSelection = new Set(state.selectedFiles);
            keys.forEach(key => newSelection.add(key));
            return { selectedFiles: newSelection };
        });
    },

    clearSelection: () => set({ selectedFiles: new Set() }),
    clearError: () => set({ error: null }),

    fetchFiles: async () => {
        set({ isLoading: true, error: null });
        try {
            const { currentPrefix } = get();
            const { files, folders } = await s3Service.listFiles(currentPrefix);
            set({ files, folders, isLoading: false });
        } catch (error: any) {
            console.error("Failed to fetch files", error);
            set({ isLoading: false, error: error.message || "Unknown error" });
        }
    },
}));

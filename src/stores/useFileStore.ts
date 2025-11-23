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
    filterType: 'all' | 'image' | 'video' | 'doc' | 'code';

    setPrefix: (prefix: string) => void;
    setViewMode: (mode: 'grid' | 'list') => void;
    setFilterType: (type: 'all' | 'image' | 'video' | 'doc' | 'code') => void;
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

    setPrefix: (prefix) => {
        set({ currentPrefix: prefix });
        get().fetchFiles();
    },

    setViewMode: (mode) => set({ viewMode: mode }),
    setFilterType: (type) => set({ filterType: type }),
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

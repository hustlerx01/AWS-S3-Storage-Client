import { create } from 'zustand';
import { encrypt, decrypt } from '../services/cryptoUtils';

export interface Credentials {
    bucketName: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
}

interface AuthState {
    credentials: Credentials | null;
    isAuthenticated: boolean;
    rememberMe: boolean;
    login: (creds: Credentials, remember: boolean) => void;
    disconnect: () => void;
    loadFromStorage: () => void;
}

const STORAGE_KEY = 'aerovault_creds';

export const useAuthStore = create<AuthState>((set) => ({
    credentials: null,
    isAuthenticated: false,
    rememberMe: false,

    login: (creds, remember) => {
        set({ credentials: creds, isAuthenticated: true, rememberMe: remember });

        if (remember) {
            const data = JSON.stringify(creds);
            const encrypted = encrypt(data);
            localStorage.setItem(STORAGE_KEY, encrypted);
        } else {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(creds)); // Store in session for refresh persistence if desired, or just state.
            // Requirement: "If unchecked, store in session memory only."
            // This usually means SessionStorage so it survives refreshes, or just React state.
            // Let's use SessionStorage for better UX.
            const data = JSON.stringify(creds);
            // We don't necessarily need to encrypt for session storage but consistency is good.
            sessionStorage.setItem(STORAGE_KEY, encrypt(data));
        }
    },

    disconnect: () => {
        set({ credentials: null, isAuthenticated: false, rememberMe: false });
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
    },

    loadFromStorage: () => {
        // Check LocalStorage first
        let encrypted = localStorage.getItem(STORAGE_KEY);
        let remember = true;

        if (!encrypted) {
            encrypted = sessionStorage.getItem(STORAGE_KEY);
            remember = false;
        }

        if (encrypted) {
            try {
                const decrypted = decrypt(encrypted);
                const creds = JSON.parse(decrypted) as Credentials;
                set({ credentials: creds, isAuthenticated: true, rememberMe: remember });
            } catch (e) {
                console.error("Failed to load credentials", e);
                localStorage.removeItem(STORAGE_KEY);
                sessionStorage.removeItem(STORAGE_KEY);
            }
        }
    }
}));

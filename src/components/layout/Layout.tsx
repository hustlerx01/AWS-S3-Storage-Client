import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

import { Logo } from '../ui/Logo';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const disconnect = useAuthStore((state) => state.disconnect);
    const credentials = useAuthStore((state) => state.credentials);

    return (
        <div className="min-h-screen flex flex-col bg-black text-zinc-100 w-full">
            <header className="border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-50">
                <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
                    <Logo />

                    <div className="flex items-center gap-4">
                        {credentials && (
                            <div className="hidden md:flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-2 px-3 py-1 bg-black rounded-full border border-zinc-800 text-zinc-400">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    {credentials.bucketName}
                                </span>
                                <span className="flex items-center gap-2 px-3 py-1 bg-black rounded-full border border-zinc-800 text-zinc-400">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    {credentials.region}
                                </span>
                            </div>
                        )}

                        <Button variant="ghost" size="sm" onClick={disconnect} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <LogOut className="w-4 h-4 mr-2" />
                            Disconnect
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto max-w-screen-2xl p-4 md:p-8">
                {children}
            </main>
        </div>
    );
};

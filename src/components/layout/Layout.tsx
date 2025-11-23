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
        <div className="min-h-screen flex flex-col bg-background">
            <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
                    <Logo />

                    <div className="flex items-center gap-4">
                        {credentials && (
                            <div className="hidden md:flex items-center text-sm text-muted-foreground">
                                <span className="px-2 py-1 bg-muted rounded-md border border-border">
                                    {credentials.bucketName}
                                </span>
                                <span className="mx-2 text-muted-foreground/50">/</span>
                                <span className="px-2 py-1 bg-muted rounded-md border border-border">
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

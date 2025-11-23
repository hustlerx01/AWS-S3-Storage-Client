import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '../ui/Logo';

export const ConnectionForm = () => {
    const login = useAuthStore((state) => state.login);
    const [bucketName, setBucketName] = useState('');
    const [region, setRegion] = useState('us-east-1');
    const [accessKeyId, setAccessKeyId] = useState('');
    const [secretAccessKey, setSecretAccessKey] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
            toast.error("Please fill in all fields");
            return;
        }

        // Basic validation
        if (!/^[a-z0-9.-]+$/.test(bucketName)) {
            toast.error("Invalid bucket name format");
            return;
        }

        login({ bucketName, region, accessKeyId, secretAccessKey }, rememberMe);
        toast.success("Credentials saved. Connecting...");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black p-4">
            <Card className="w-full max-w-md shadow-2xl shadow-black border-zinc-800 bg-zinc-900">
                <CardHeader className="space-y-1 flex flex-col items-center text-center pb-6">
                    <div className="mb-2">
                        <Logo />
                    </div>
                    <CardDescription className="text-zinc-400">
                        Securely manage your S3 buckets directly from your browser.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bucket" className="text-zinc-400">Bucket Name</Label>
                            <Input
                                id="bucket"
                                placeholder="my-awesome-bucket"
                                value={bucketName}
                                onChange={(e) => setBucketName(e.target.value)}
                                className="bg-black border-zinc-800 text-zinc-100 focus-visible:ring-orange-500 placeholder:text-zinc-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="region" className="text-zinc-400">Region</Label>
                            <Input
                                id="region"
                                placeholder="us-east-1"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="bg-black border-zinc-800 text-zinc-100 focus-visible:ring-orange-500 placeholder:text-zinc-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accessKey" className="text-zinc-400">Access Key ID</Label>
                            <Input
                                id="accessKey"
                                type="password"
                                placeholder="AKIA..."
                                value={accessKeyId}
                                onChange={(e) => setAccessKeyId(e.target.value)}
                                className="bg-black border-zinc-800 text-zinc-100 focus-visible:ring-orange-500 placeholder:text-zinc-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secretKey" className="text-zinc-400">Secret Access Key</Label>
                            <Input
                                id="secretKey"
                                type="password"
                                placeholder="wJalr..."
                                value={secretAccessKey}
                                onChange={(e) => setSecretAccessKey(e.target.value)}
                                className="bg-black border-zinc-800 text-zinc-100 focus-visible:ring-orange-500 placeholder:text-zinc-600"
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onCheckedChange={(c) => setRememberMe(!!c)}
                                className="border-zinc-700 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                            />
                            <Label htmlFor="remember" className="text-sm font-normal text-zinc-400">
                                Remember credentials on this device
                            </Label>
                        </div>
                    </form>

                    <div className="mt-6 p-3 bg-yellow-950/30 border border-yellow-900/50 rounded-md flex gap-3 items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-500">
                            <strong>Security Warning:</strong> Your keys are stored locally in your browser.
                            Do not use this on public computers. Always disconnect when done.
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 text-white font-bold border-none"
                        onClick={handleSubmit}
                    >
                        Connect to S3
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

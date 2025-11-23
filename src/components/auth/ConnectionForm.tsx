import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

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
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md shadow-lg border-border/50">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">AeroVault</CardTitle>
                    </div>
                    <CardDescription>
                        Securely manage your S3 buckets directly from your browser.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bucket">Bucket Name</Label>
                            <Input
                                id="bucket"
                                placeholder="my-awesome-bucket"
                                value={bucketName}
                                onChange={(e) => setBucketName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="region">Region</Label>
                            <Input
                                id="region"
                                placeholder="us-east-1"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accessKey">Access Key ID</Label>
                            <Input
                                id="accessKey"
                                type="password"
                                placeholder="AKIA..."
                                value={accessKeyId}
                                onChange={(e) => setAccessKeyId(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secretKey">Secret Access Key</Label>
                            <Input
                                id="secretKey"
                                type="password"
                                placeholder="wJalr..."
                                value={secretAccessKey}
                                onChange={(e) => setSecretAccessKey(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onCheckedChange={(c) => setRememberMe(!!c)}
                            />
                            <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                                Remember credentials on this device
                            </Label>
                        </div>
                    </form>

                    <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md flex gap-3 items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-700 dark:text-yellow-400">
                            <strong>Security Warning:</strong> Your keys are stored locally in your browser.
                            Do not use this on public computers. Always disconnect when done.
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleSubmit}>Connect to S3</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

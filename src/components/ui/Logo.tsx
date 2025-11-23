import { Cloud, Shield } from 'lucide-react';

export const Logo = () => {
    return (
        <div className="flex items-center gap-2 select-none">
            <div className="relative flex items-center justify-center w-8 h-8">
                <Cloud className="w-8 h-8 text-blue-500 absolute" />
                <Shield className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AeroVault
            </span>
        </div>
    );
};

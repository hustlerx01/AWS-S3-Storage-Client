import React from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import { Home } from 'lucide-react';

export const Breadcrumbs = () => {
    const { currentPrefix, setPrefix } = useFileStore();

    // Split prefix into parts, removing empty strings
    const parts = currentPrefix.split('/').filter(Boolean);

    const handleNavigate = (index: number) => {
        // Reconstruct prefix up to index
        const newPrefix = parts.slice(0, index + 1).join('/') + '/';
        setPrefix(newPrefix);
    };

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink
                        className="cursor-pointer flex items-center gap-1 hover:text-orange-500 transition-colors"
                        onClick={() => setPrefix('')}
                    >
                        <Home className="w-4 h-4" />
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {parts.map((part, index) => {
                    const isLast = index === parts.length - 1;
                    return (
                        <React.Fragment key={index}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{part}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink
                                        className="cursor-pointer hover:text-orange-500 transition-colors"
                                        onClick={() => handleNavigate(index)}
                                    >
                                        {part}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

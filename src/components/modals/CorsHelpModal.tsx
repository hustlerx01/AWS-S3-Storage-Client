
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CorsHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CorsHelpModal = ({ isOpen, onClose }: CorsHelpModalProps) => {
    const corsConfig = `[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedOrigins": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>CORS Configuration Required</DialogTitle>
                    <DialogDescription>
                        To use AeroVault, you must configure Cross-Origin Resource Sharing (CORS) on your S3 bucket.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Go to your S3 Bucket &gt; Permissions &gt; Cross-origin resource sharing (CORS) and paste the following JSON:
                    </p>
                    <div className="rounded-md overflow-hidden">
                        <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ margin: 0 }}>
                            {corsConfig}
                        </SyntaxHighlighter>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Note: You can replace <code>"*"</code> in <code>AllowedOrigins</code> with your specific domain for better security.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

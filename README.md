# AeroVault - Secure Serverless S3 Manager

AeroVault is a modern, secure, and serverless React application for managing your AWS S3 buckets directly from the browser. It provides a user-friendly interface for uploading, downloading, organizing, and sharing files without the need for a backend server.

## Features

*   **Serverless Architecture:** Connects directly to AWS S3 using the AWS SDK for JavaScript v3.
*   **Local credentials:** AWS credentials stay in the browser (localStorage if you choose "remember me", otherwise sessionStorage) and are only sent to AWS. They are obfuscated with AES using a key built into the app, which is not real protection (see Security note).
*   **File Management:** Upload, download, rename, delete, and copy files and folders.
*   **Drag & Drop Upload:** Easy file uploading with progress tracking.
*   **File Previews:** Preview images and code files (with syntax highlighting) directly in the app.
*   **Sharing:** Generate pre-signed URLs to share files securely with a configurable expiration time.
*   **Search & Filter:** Quickly find files by name or type (Image, Video, Document, Code).
*   **Dark Mode:** Sleek and modern UI built with ShadCN UI and Tailwind CSS.

## Prerequisites

*   Node.js (v18 or higher)
*   An AWS Account with an S3 Bucket

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/hustlerx01/AWS-S3-Storage-Client.git
    cd AWS-S3-Storage-Client
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

## Configuration

To use AeroVault, you need to configure your AWS S3 bucket to allow access from the application.

### 1. IAM Policy

Create an IAM user with the following policy (replace `YOUR_BUCKET_NAME` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

### 2. CORS Configuration

You must enable Cross-Origin Resource Sharing (CORS) on your bucket to allow the browser to interact with S3. Go to your Bucket > Permissions > CORS and paste:

```json
[
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
]
```
*Note: For production, replace `*` in `AllowedOrigins` with your application's domain.*

## Usage

1.  Open the application in your browser.
2.  Enter your **Bucket Name**, **Region**, **Access Key ID**, and **Secret Access Key**.
3.  Click **Connect**.
4.  You can now manage your files!

## Security note

AeroVault stores your AWS credentials in the browser's localStorage or sessionStorage, AES-encrypted with CryptoJS using a static key that ships in the JavaScript bundle (`src/services/cryptoUtils.ts`). Anyone who can read the page's storage and the bundle can decrypt them, so treat this as obfuscation, not encryption.

- Use an IAM user scoped to one bucket (policy above). Never use root or admin keys.
- Prefer short-lived credentials, and delete the access key when you're done.
- **Do not use this app on public or shared computers.** Click Disconnect when you're finished; it clears both storages.

### Security limitations
- **Static encryption key (known demo limitation).** `SECRET_KEY` in `src/services/cryptoUtils.ts` is hard-coded and public in this repo and in every built bundle. It is a demo shortcut, not a secret. A real deployment should not keep long-lived AWS keys in the browser at all: use short-lived credentials (Cognito identity pool or STS), and keep any server-side key in AWS KMS or an environment secret, never in source.

## Build check
```bash
npm ci
npm run build    # tsc -b && vite build; passes (Vite warns that one chunk is over 500 kB)
```

## Limitations
- No automated tests yet. `npm run build` (type check plus bundle) is the only check.
- `npm run lint` currently reports 6 errors (4 `no-explicit-any`, 2 `react-refresh/only-export-components`). They are style rules and do not break the build.
- `AllowedOrigins: ["*"]` in the sample CORS config is for local testing only.
- The sample IAM policy includes `s3:PutObjectAcl`, but the app code never sets ACLs, so you can drop it.
- Large uploads go straight from the browser. There's no server-side size or type check.

## Technologies Used

*   React 18
*   Vite
*   AWS SDK for JavaScript v3
*   Tailwind CSS
*   ShadCN UI
*   Zustand (State Management)
*   React Router DOM
*   Lucide React (Icons)

## License

MIT, see [LICENSE](LICENSE).

# AeroVault - Secure Serverless S3 Manager

AeroVault is a modern, secure, and serverless React application for managing your AWS S3 buckets directly from the browser. It provides a user-friendly interface for uploading, downloading, organizing, and sharing files without the need for a backend server.

## Features

*   **Serverless Architecture:** Connects directly to AWS S3 using the AWS SDK for JavaScript v3.
*   **Secure Authentication:** Stores AWS credentials locally (encrypted) and never sends them to a third-party server.
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
    git clone https://github.com/yourusername/aerovault.git
    cd aerovault
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

## Security Note

AeroVault stores your AWS credentials in your browser's LocalStorage or SessionStorage (encrypted with a basic algorithm). **Do not use this application on public or shared computers.** Always disconnect when you are finished.

## Technologies Used

*   React 18
*   Vite
*   AWS SDK for JavaScript v3
*   Tailwind CSS
*   ShadCN UI
*   Zustand (State Management)
*   React Router DOM
*   Lucide React (Icons)

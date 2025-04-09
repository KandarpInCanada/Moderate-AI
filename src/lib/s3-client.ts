import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Check if AWS credentials are configured
const isConfigured = () => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_BUCKET_NAME
  );
};

/**
 * Generate a pre-signed POST URL for direct browser uploads to S3
 * @param file File metadata for the upload
 * @param userIdentifier User email or ID to create user-specific folders
 * @returns Pre-signed POST URL and fields
 */
export async function getPresignedPostUrl(
  file: { name: string; type: string; size: number },
  userIdentifier: string
) {
  if (!isConfigured()) {
    throw new Error('AWS S3 is not properly configured');
  }

  // Sanitize user identifier for use in S3 path
  const sanitizedUserIdentifier = userIdentifier.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  
  // Generate a unique filename to prevent collisions
  const fileExtension = file.name.split('.').pop();
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;
  
  // Create a folder structure: users/{sanitized_email}/{uuid}.{extension}
  const key = `users/${sanitizedUserIdentifier}/${uniqueFileName}`;

  try {
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: key,
      Conditions: [
        ['content-length-range', 0, 10485760], // up to 10 MB
        ['starts-with', '$Content-Type', file.type],
      ],
      Fields: {
        acl: 'public-read',
        'Content-Type': file.type,
      },
      Expires: 600, // 10 minutes
    });

    return {
      url,
      fields,
      key,
      fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw error;
  }
}

/**
 * Client-side function to upload a file using the pre-signed URL
 * @param file The file to upload
 * @param presignedData The pre-signed URL data
 * @param onProgress Progress callback
 * @returns The URL of the uploaded file
 */
export async function uploadFileWithPresignedUrl(
  file: File,
  presignedData: { url: string; fields: Record<string, string>; fileUrl: string },
  onProgress?: (progress: number) => void
): Promise<string> {
  const formData = new FormData();
  
  // Add all the fields from the pre-signed URL
  Object.entries(presignedData.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  // Add the file as the last field
  formData.append('file', file);

  // Use XMLHttpRequest to track upload progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Set up progress tracking
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }
    
    // Handle completion
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(presignedData.fileUrl);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    
    // Handle errors
    xhr.onerror = () => {
      reject(new Error('Network error occurred during upload'));
    };
    
    // Send the request
    xhr.open('POST', presignedData.url, true);
    xhr.send(formData);
  });
}

export async function uploadToS3(file: File, onProgress?: (progress: number) => void): Promise<string> {
  // This is a placeholder for the actual S3 upload implementation
  // In a real application, you would:
  // 1. Get a pre-signed URL from your backend
  // 2. Upload the file directly to S3 using the pre-signed URL
  // 3. Return the URL of the uploaded file

  // Simulate upload with progress
  return new Promise((resolve) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      if (onProgress) onProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        // Return a fake S3 URL
        resolve(`https://your-bucket.s3.amazonaws.com/${file.name}`)
      }
    }, 300)
  })
}

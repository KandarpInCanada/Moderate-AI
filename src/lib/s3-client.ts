import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { S3Client } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || "",
  },
})

// Check if AWS credentials are configured
const isConfigured = () => {
  return !!(
    process.env.NEXT_AWS_ACCESS_KEY_ID &&
    process.env.NEXT_AWS_SECRET_ACCESS_KEY &&
    process.env.NEXT_AWS_REGION &&
    process.env.NEXT_AWS_BUCKET_NAME
  )
}

/**
 * Generate a pre-signed POST URL for direct browser uploads to S3
 * @param file File metadata for the upload
 * @param userIdentifier User email or ID to create user-specific folders
 * @returns Pre-signed POST URL and fields
 */
export async function getPresignedPostUrl(file: { name: string; type: string; size: number }, userIdentifier: string) {
  if (!isConfigured()) {
    throw new Error("AWS S3 is not properly configured")
  }

  // Sanitize user identifier for use in S3 path
  const sanitizedUserIdentifier = userIdentifier.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()

  // Generate a unique filename to prevent collisions
  const fileExtension = file.name.split(".").pop()
  const uniqueFileName = `${uuidv4()}.${fileExtension}`

  // Create a folder structure: users/{sanitized_email}/{uuid}.{extension}
  const key = `users/${sanitizedUserIdentifier}/${uniqueFileName}`

  try {
    // Create the presigned post with minimal conditions
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.NEXT_AWS_BUCKET_NAME || "",
      Key: key,
      Conditions: [
        // Only include essential conditions
        ["content-length-range", 0, 20971520], // up to 20 MB
      ],
      Fields: {
        // IMPORTANT: Removed the ACL field that was causing the error
        // Include the content type to ensure proper file handling
        "Content-Type": file.type,
      },
      Expires: 600, // 10 minutes
    })

    return {
      url,
      fields,
      key,
      fileUrl: `https://${process.env.NEXT_AWS_BUCKET_NAME}.s3.${process.env.NEXT_AWS_REGION}.amazonaws.com/${key}`,
    }
  } catch (error) {
    console.error("Error generating pre-signed URL:", error)
    throw error
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
  onProgress?: (progress: number) => void,
): Promise<string> {
  // Create a new FormData instance
  const formData = new FormData()

  // IMPORTANT: Add all fields from the presigned URL first
  Object.entries(presignedData.fields).forEach(([key, value]) => {
    formData.append(key, value)
  })

  // IMPORTANT: Add the file LAST - S3 requires the file to be the last field
  formData.append("file", file)

  // Use fetch instead of XMLHttpRequest for simpler error handling
  try {
    const response = await fetch(presignedData.url, {
      method: "POST",
      body: formData,
    })

    // S3 returns 204 No Content on successful upload
    if (response.ok) {
      if (onProgress) onProgress(100)
      return presignedData.fileUrl
    }

    // If not successful, try to get error details
    const errorText = await response.text()
    console.error("S3 error response:", errorText)
    throw new Error(`Upload failed with status ${response.status}: ${errorText}`)
  } catch (error) {
    console.error("Error during S3 upload:", error)
    throw error
  }
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

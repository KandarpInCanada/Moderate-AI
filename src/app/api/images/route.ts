import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { listUserImages, refreshImageUrl } from "@/lib/s3-client"
import { docClient } from "@/lib/dynamo-client"
import { ScanCommand } from "@aws-sdk/lib-dynamodb"

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 })
    }

    // Extract the token
    const token = authHeader.split(" ")[1]

    // Verify the token and get user info
    const supabase = createAdminClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // Get user identifier (email or ID)
    const userIdentifier = user.email || user.id
    console.log(`Fetching images for user: ${userIdentifier}`)

    // First, try to fetch image metadata from DynamoDB
    const dynamoImages = await fetchImageMetadataFromDynamoDB(userIdentifier)

    // If we have DynamoDB data, use it
    if (dynamoImages.length > 0) {
      console.log(`Retrieved ${dynamoImages.length} images from DynamoDB`)

      // Log a sample image for debugging
      if (dynamoImages.length > 0) {
        const sampleImage = { ...dynamoImages[0] }
        console.log("Sample DynamoDB image:", JSON.stringify(sampleImage, null, 2))
      }

      return NextResponse.json({ images: dynamoImages })
    }

    // Fallback to listing images from S3 if no DynamoDB data
    console.log("No DynamoDB data found, falling back to S3 listing")
    const s3Images = await listUserImages(userIdentifier)
    console.log(`Retrieved ${s3Images.length} images from S3`)

    // Log a sample image for debugging
    if (s3Images.length > 0) {
      const sampleImage = { ...s3Images[0] }
      if (sampleImage.url) sampleImage.url = sampleImage.url.substring(0, 100) + "..." // Truncate URL for logging
      console.log("Sample S3 image:", JSON.stringify(sampleImage, null, 2))
    }

    return NextResponse.json({ images: s3Images })
  } catch (error: any) {
    console.error("Error fetching images:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// Function to fetch image metadata from DynamoDB
async function fetchImageMetadataFromDynamoDB(userIdentifier: string) {
  try {
    console.log("Starting DynamoDB image metadata fetch...")

    // Sanitize user identifier for use in S3 path (same as in S3 client)
    const sanitizedUserIdentifier = userIdentifier.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()

    // Create the prefix for the user's folder
    const prefix = `users/${sanitizedUserIdentifier}/`
    console.log(`Using prefix for DynamoDB query: ${prefix}`)

    // Get the table name from environment variables
    const tableName = process.env.NEXT_PUBLIC_IMAGE_METADATA_DYNAMODB_TABLE_NAME || "ImageMetadata"
    console.log(`Using DynamoDB table: ${tableName}`)

    // Query DynamoDB for images with the user's prefix
    // Note: This assumes there's a GSI on the 'key' attribute or we're doing a scan with a filter
    // In a production environment, you might want to use a more efficient query method
    const command = new ScanCommand({
      TableName: tableName,
      FilterExpression: "begins_with(#key, :prefix)",
      ExpressionAttributeNames: {
        "#key": "key",
      },
      ExpressionAttributeValues: {
        ":prefix": prefix,
      },
    })

    console.log("Executing DynamoDB scan command...")
    const response = await docClient.send(command)
    console.log(`DynamoDB scan complete. Found ${response.Items?.length || 0} items.`)

    // Log the first item for debugging (redacting sensitive info)
    if (response.Items && response.Items.length > 0) {
      const sampleItem = { ...response.Items[0] }
      // Redact any potentially sensitive information
      if (sampleItem.url) sampleItem.url = "[REDACTED URL]"
      console.log("Sample DynamoDB item:", JSON.stringify(sampleItem, null, 2))
    }

    // Refresh any expired URLs for images
    if (response.Items && response.Items.length > 0) {
      for (const item of response.Items) {
        if (item.key && typeof item.key === "string") {
          try {
            // Refresh the URL to ensure it's valid
            const refreshedUrl = await refreshImageUrl(item.key)
            item.url = refreshedUrl
          } catch (error) {
            console.error(`Failed to refresh URL for ${item.key}:`, error)
            // Keep the existing URL if refresh fails
          }
        }
      }
    }

    return response.Items || []
  } catch (error) {
    console.error("Error fetching image metadata from DynamoDB:", error)
    // Return empty array on error to fall back to S3
    return []
  }
}

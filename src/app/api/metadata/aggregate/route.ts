import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { docClient } from "@/lib/dynamo-client"
import { ScanCommand } from "@aws-sdk/lib-dynamodb"
import { cache } from "react"

// Cache the metadata aggregation for 15 minutes
const cachedAggregateMetadata = cache(async () => {
  try {
    console.log("Starting metadata aggregation...")

    // Get the table name from environment variables
    const tableName = process.env.NEXT_PUBLIC_IMAGE_METADATA_DYNAMODB_TABLE_NAME || "ImageMetadata"
    console.log(`Using DynamoDB table: ${tableName}`)

    // Scan DynamoDB for all image metadata
    const command = new ScanCommand({
      TableName: tableName,
    })

    console.log("Executing DynamoDB scan command...")
    const response = await docClient.send(command)
    console.log(`DynamoDB scan complete. Found ${response.Items?.length || 0} items.`)

    // Aggregate metadata
    const aggregatedData = {
      labels: new Set<string>(),
      locations: new Set<string>(),
      faceCount: 0,
      textCount: 0,
      totalImages: response.Items?.length || 0,
    }

    // Process each item
    response.Items?.forEach((item) => {
      // Collect labels
      if (item.labels && Array.isArray(item.labels)) {
        item.labels.forEach((label: string) => aggregatedData.labels.add(label))
      }

      // Collect locations
      if (item.location && typeof item.location === "string" && item.location.trim() !== "") {
        aggregatedData.locations.add(item.location)
      }

      // Count faces
      if (item.faces && typeof item.faces === "number" && item.faces > 0) {
        aggregatedData.faceCount++
      }

      // Count text
      if (
        item.rekognitionDetails?.text &&
        Array.isArray(item.rekognitionDetails.text) &&
        item.rekognitionDetails.text.length > 0
      ) {
        aggregatedData.textCount++
      }
    })

    // Convert Sets to Arrays for JSON serialization
    return {
      labels: Array.from(aggregatedData.labels),
      locations: Array.from(aggregatedData.locations),
      faceCount: aggregatedData.faceCount,
      textCount: aggregatedData.textCount,
      totalImages: aggregatedData.totalImages,
    }
  } catch (error) {
    console.error("Error aggregating metadata:", error)
    throw error
  }
})

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

    // Get aggregated metadata
    const metadata = await cachedAggregateMetadata()

    return NextResponse.json(metadata)
  } catch (error: any) {
    console.error("Error fetching aggregated metadata:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

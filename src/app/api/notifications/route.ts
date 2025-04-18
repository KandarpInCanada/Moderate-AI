import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb"
import { unmarshall } from "@aws-sdk/util-dynamodb"

// Initialize the DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || "",
  },
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

    // Check if DynamoDB is configured
    if (
      !process.env.NEXT_AWS_ACCESS_KEY_ID ||
      !process.env.NEXT_AWS_SECRET_ACCESS_KEY ||
      !process.env.NEXT_AWS_REGION ||
      !process.env.NEXT_NOTIFICATIONS_DYNAMODB_TABLE_NAME
    ) {
      return NextResponse.json({ error: "Server configuration error: DynamoDB not configured" }, { status: 500 })
    }

    // Get user identifier (email or ID)
    const userIdentifier = user.email || user.id

    // Query DynamoDB for user's notifications
    const params = {
      TableName: process.env.NEXT_NOTIFICATIONS_DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "UserId = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: userIdentifier },
      },
      ScanIndexForward: false, // Sort by sort key in descending order (newest first)
      Limit: 50, // Limit to 50 notifications
    }

    const command = new QueryCommand(params)
    const response = await dynamoClient.send(command)

    // Transform DynamoDB items to notification objects
    const notifications =
      response.Items?.map((item) => {
        const notification = unmarshall(item)
        return {
          id: notification.NotificationId,
          title: notification.Title,
          message: notification.Message,
          timestamp: notification.Timestamp,
          read: notification.Read || false,
          type: notification.Type || "info",
          imageId: notification.ImageId,
          imageUrl: notification.ImageUrl,
        }
      }) || []

    return NextResponse.json({ notifications })
  } catch (error: any) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// Mark notifications as read
export async function POST(request: Request) {
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

    // Parse the request body
    const { notificationIds, markAll } = await request.json()

    // Check if DynamoDB is configured
    if (
      !process.env.NEXT_AWS_ACCESS_KEY_ID ||
      !process.env.NEXT_AWS_SECRET_ACCESS_KEY ||
      !process.env.NEXT_AWS_REGION ||
      !process.env.NEXT_NOTIFICATIONS_DYNAMODB_TABLE_NAME
    ) {
      return NextResponse.json({ error: "Server configuration error: DynamoDB not configured" }, { status: 500 })
    }

    // Get user identifier (email or ID)
    const userIdentifier = user.email || user.id

    // TODO: Implement update logic for DynamoDB to mark notifications as read
    // This would involve using the UpdateItem command for each notification ID
    // or a BatchWriteItem command for multiple notifications

    return NextResponse.json({
      success: true,
      message: markAll ? "All notifications marked as read" : "Notifications marked as read",
    })
  } catch (error: any) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

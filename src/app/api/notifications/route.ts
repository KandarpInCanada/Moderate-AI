import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { docClient } from "@/lib/dynamo-client"
import { QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb"

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

    try {
      console.log(`Fetching notifications for user: ${userIdentifier}`)

      // Get notifications from DynamoDB
      const dynamoNotifications = await fetchDynamoDBNotifications(userIdentifier)
      console.log(`Retrieved ${dynamoNotifications.length} notifications from DynamoDB`)

      return NextResponse.json({
        notifications: dynamoNotifications,
        webhookUrl: `/api/webhooks/${userIdentifier.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`,
      })
    } catch (error: any) {
      console.error("Error fetching notifications:", error)
      return NextResponse.json({
        error: error.message || "Failed to fetch notifications",
        notifications: [],
      })
    }
  } catch (error: any) {
    console.error("Error handling notifications request:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// Fetch notifications from DynamoDB
async function fetchDynamoDBNotifications(userIdentifier: string) {
  try {
    // Check if the notifications table name is configured
    const tableName = process.env.NEXT_PUBLIC_NOTIFICATIONS_DYNAMODB_TABLE_NAME || "PhotoSense-Notifications"

    // Query DynamoDB for notifications for this user
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "UserId = :userId",
      ExpressionAttributeValues: {
        ":userId": userIdentifier,
      },
      ScanIndexForward: false, // Sort in descending order (newest first)
      Limit: 50, // Limit to 50 most recent notifications
    })

    const response = await docClient.send(command)

    // Map DynamoDB items to notification format
    return (response.Items || []).map((item) => ({
      id: item.NotificationId,
      title: item.Title,
      message: item.Message,
      type: item.Type || "info",
      timestamp: item.Timestamp,
      imageId: item.ImageId,
      imageUrl: item.ImageUrl,
      read: item.Read || false,
      source: "dynamodb",
    }))
  } catch (error) {
    console.error("Error fetching notifications from DynamoDB:", error)
    return [] // Return empty array on error
  }
}

// Delete a notification from DynamoDB
export async function DELETE(request: Request) {
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
    const { notificationId, source } = await request.json()

    // Get user identifier (email or ID)
    const userIdentifier = user.email || user.id

    if (source === "dynamodb" && notificationId) {
      // Delete the notification from DynamoDB
      const tableName = process.env.NEXT_PUBLIC_NOTIFICATIONS_DYNAMODB_TABLE_NAME || "PhotoSense-Notifications"

      await docClient.send(
        new DeleteCommand({
          TableName: tableName,
          Key: {
            UserId: userIdentifier,
            NotificationId: notificationId,
          },
        }),
      )
    } else {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

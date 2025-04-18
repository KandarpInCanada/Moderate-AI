import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { receiveMessagesFromQueue, deleteMessageFromQueue, getUserQueueUrl } from "@/lib/sqs-client"
import { docClient } from "@/lib/dynamo-client"
import { QueryCommand } from "@aws-sdk/lib-dynamodb"

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

      // Poll for messages from SQS
      const messages = await receiveMessagesFromQueue(userIdentifier, 10)
      console.log(`Received ${messages.length} messages from SQS`)

      // Process SQS messages into a more usable format
      const sqsNotifications = messages.map((message) => {
        try {
          const body = JSON.parse(message.Body || "{}")
          return {
            id: message.MessageId,
            receiptHandle: message.ReceiptHandle,
            title: body.title || "Notification",
            message: body.message || "You have a new notification",
            type: body.type || "info",
            timestamp: body.timestamp || new Date().toISOString(),
            imageId: body.imageId,
            imageUrl: body.imageUrl,
            source: "sqs",
          }
        } catch (e) {
          // If parsing fails, return a basic notification
          return {
            id: message.MessageId,
            receiptHandle: message.ReceiptHandle,
            title: "New Notification",
            message: message.Body || "You have a new notification",
            type: "info",
            timestamp: new Date().toISOString(),
            source: "sqs",
          }
        }
      })

      // Combine notifications from both sources and sort by timestamp (newest first)
      const allNotifications = [...dynamoNotifications, ...sqsNotifications].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })

      return NextResponse.json({
        notifications: allNotifications,
        queueUrl: getUserQueueUrl(userIdentifier),
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

// Delete a notification (message) from the queue
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
    const { receiptHandle, notificationId, source } = await request.json()

    // Get user identifier (email or ID)
    const userIdentifier = user.email || user.id

    if (source === "sqs" && receiptHandle) {
      // Delete the message from the SQS queue
      await deleteMessageFromQueue(userIdentifier, receiptHandle)
    } else if (source === "dynamodb" && notificationId) {
      // Mark the notification as deleted in DynamoDB
      // This would be implemented if we want to actually delete from DynamoDB
      // For now, we'll just return success
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

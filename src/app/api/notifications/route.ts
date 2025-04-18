import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { receiveMessagesFromQueue, deleteMessageFromQueue, getUserQueueUrl } from "@/lib/sqs-client"

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

      // Poll for messages from SQS
      const messages = await receiveMessagesFromQueue(userIdentifier, 10)
      console.log(`Received ${messages.length} messages from SQS`)

      // Process messages into a more usable format
      const notifications = messages.map((message) => {
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
          }
        }
      })

      return NextResponse.json({
        notifications,
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
    const { receiptHandle } = await request.json()

    if (!receiptHandle) {
      return NextResponse.json({ error: "Missing receipt handle" }, { status: 400 })
    }

    // Get user identifier (email or ID)
    const userIdentifier = user.email || user.id

    // Delete the message from the queue
    await deleteMessageFromQueue(userIdentifier, receiptHandle)

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

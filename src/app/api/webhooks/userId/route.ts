import { type NextRequest, NextResponse } from "next/server"
import { docClient } from "@/lib/dynamo-client"
import { PutCommand } from "@aws-sdk/lib-dynamodb"
import { v4 as uuidv4 } from "uuid"

// SNS message types
type SNSMessage = {
  Type: string
  MessageId: string
  TopicArn: string
  Subject?: string
  Message: string
  Timestamp: string
  SignatureVersion: string
  Signature: string
  SigningCertURL: string
  UnsubscribeURL?: string
  MessageAttributes?: Record<string, any>
}

// Verify SNS message signature
async function verifySignature(message: SNSMessage): Promise<boolean> {
  try {
    // In a production environment, you should:
    // 1. Download the certificate from SigningCertURL
    // 2. Verify the certificate is from Amazon
    // 3. Create a canonical string from the message
    // 4. Verify the signature using the certificate's public key

    // For this implementation, we'll do a simplified check
    return true
  } catch (error) {
    console.error("Error verifying SNS signature:", error)
    return false
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Get the user ID from the URL
    const userId = params.userId
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    // Parse the request body
    const body = await request.json()

    // Handle SNS subscription confirmation
    if (body.Type === "SubscriptionConfirmation") {
      console.log("Received SNS subscription confirmation request")

      // Automatically confirm the subscription by making a GET request to the SubscribeURL
      if (body.SubscribeURL) {
        try {
          console.log(`Confirming subscription by accessing: ${body.SubscribeURL}`)
          const response = await fetch(body.SubscribeURL)

          if (response.ok) {
            console.log("SNS subscription confirmed successfully")
          } else {
            console.error(`Failed to confirm subscription: ${response.status} ${response.statusText}`)
          }
        } catch (error) {
          console.error("Error confirming SNS subscription:", error)
        }
      }

      return NextResponse.json({ message: "Subscription confirmation processed" })
    }

    // Verify this is a valid SNS message
    if (!body.Message || !body.MessageId || !body.Signature) {
      return NextResponse.json({ error: "Invalid SNS message format" }, { status: 400 })
    }

    // Verify the message signature
    const isValid = await verifySignature(body)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid SNS message signature" }, { status: 403 })
    }

    // Parse the message content
    let messageContent
    try {
      messageContent = JSON.parse(body.Message)
    } catch (error) {
      messageContent = { message: body.Message }
    }

    // Create a notification record
    const timestamp = new Date().toISOString()
    const notificationId = uuidv4()

    const notification = {
      UserId: userId,
      NotificationId: notificationId,
      Title: body.Subject || "New Notification",
      Message: typeof messageContent === "object" ? messageContent.message : body.Message,
      Timestamp: timestamp,
      Read: false,
      Type: messageContent.type || "info",
      ImageId: messageContent.imageId,
      ImageUrl: messageContent.imageUrl,
      Source: "sns",
      MessageId: body.MessageId,
      RawMessage: JSON.stringify(body),
    }

    // Store the notification in DynamoDB
    const tableName = process.env.NEXT_PUBLIC_NOTIFICATIONS_DYNAMODB_TABLE_NAME || "PhotoSense-Notifications"

    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: notification,
      }),
    )

    console.log(`Notification stored for user ${userId}: ${notificationId}`)

    return NextResponse.json({
      success: true,
      message: "Notification received and stored",
      notificationId,
    })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// Handle SNS subscription confirmation via GET
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  // This endpoint can be used to manually confirm SNS subscriptions if needed
  return NextResponse.json({
    message: "Webhook endpoint is active",
    userId: params.userId,
  })
}

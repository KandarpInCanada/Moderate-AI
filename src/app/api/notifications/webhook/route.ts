import { NextResponse } from "next/server"
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { marshall } from "@aws-sdk/util-dynamodb"
import { v4 as uuidv4 } from "uuid"

// Initialize the DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || "",
  },
})

// This endpoint receives SNS notifications and stores them in DynamoDB
export async function POST(request: Request) {
  try {
    // Parse the SNS message
    const body = await request.json()

    // SNS sends different types of messages
    if (body.Type === "SubscriptionConfirmation") {
      // This is a subscription confirmation message
      // In a production environment, you would confirm the subscription
      // by making a GET request to the SubscribeURL
      console.log("Received subscription confirmation:", body.SubscribeURL)

      // For security, in a real application, you should verify the TopicArn
      // before confirming the subscription

      // Automatically confirm the subscription
      try {
        await fetch(body.SubscribeURL)
        console.log("Subscription confirmed")
      } catch (error) {
        console.error("Error confirming subscription:", error)
      }

      return NextResponse.json({ success: true, message: "Subscription confirmation received" })
    } else if (body.Type === "Notification") {
      // This is an actual notification
      console.log("Received notification:", body.Message)

      try {
        // Parse the message (assuming it's JSON)
        const message = JSON.parse(body.Message)

        // Extract user ID from the topic ARN
        // Format: arn:aws:sns:region:account-id:user-notify-user_identifier
        const topicArnParts = body.TopicArn.split(":")
        const topicName = topicArnParts[topicArnParts.length - 1]
        const userIdentifier = topicName.replace("user-notify-", "")

        // Store the notification in DynamoDB
        if (process.env.NEXT_NOTIFICATIONS_DYNAMODB_TABLE_NAME) {
          const notificationId = uuidv4()
          const timestamp = new Date().toISOString()

          // Create a notification object
          const notification = {
            UserId: userIdentifier,
            NotificationId: notificationId,
            Title: message.title || "New Notification",
            Message: message.message || body.Message,
            Timestamp: timestamp,
            Read: false,
            Type: message.type || "info",
            ImageId: message.imageId,
            ImageUrl: message.imageUrl,
            // Add any other fields from the message
            ...message,
          }

          // Store in DynamoDB
          const params = {
            TableName: process.env.NEXT_NOTIFICATIONS_DYNAMODB_TABLE_NAME,
            Item: marshall(notification),
          }

          await dynamoClient.send(new PutItemCommand(params))
          console.log("Notification stored in DynamoDB:", notificationId)
        }

        return NextResponse.json({ success: true, message: "Notification processed" })
      } catch (error) {
        console.error("Error processing notification:", error)
        return NextResponse.json({ error: "Error processing notification" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: "Message received" })
  } catch (error: any) {
    console.error("Error handling SNS webhook:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

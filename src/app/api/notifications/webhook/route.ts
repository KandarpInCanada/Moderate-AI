// Simplify this file to just handle SNS subscription confirmation
import { NextResponse } from "next/server"

// This endpoint receives SNS notifications but doesn't store them in DynamoDB
export async function POST(request: Request) {
  try {
    // Parse the SNS message
    const body = await request.json()

    // SNS sends different types of messages
    if (body.Type === "SubscriptionConfirmation") {
      // This is a subscription confirmation message
      console.log("Received subscription confirmation:", body.SubscribeURL)

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

      // We're not storing in DynamoDB anymore, just log the notification
      return NextResponse.json({ success: true, message: "Notification received" })
    }

    return NextResponse.json({ success: true, message: "Message received" })
  } catch (error: any) {
    console.error("Error handling SNS webhook:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

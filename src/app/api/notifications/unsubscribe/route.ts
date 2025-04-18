import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import AWS from "aws-sdk"

// Initialize the SNS client
const sns = new AWS.SNS({
  region: process.env.NEXT_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || "",
  },
})

const SNS_TOPIC_PREFIX = process.env.NEXT_SNS_TOPIC_PREFIX || "user-notify-"

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
    const { subscriptionArn } = await request.json()

    if (!subscriptionArn) {
      return NextResponse.json({ error: "Missing subscription ARN" }, { status: 400 })
    }

    // Unsubscribe from the topic
    await sns
      .unsubscribe({
        SubscriptionArn: subscriptionArn,
      })
      .promise()

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed",
    })
  } catch (error: any) {
    console.error("Error unsubscribing from SNS topic:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

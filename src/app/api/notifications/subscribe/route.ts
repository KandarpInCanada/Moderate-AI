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
    const { subscriptionType, endpoint } = await request.json()

    if (!subscriptionType || !endpoint) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Sanitize email for topic name (same logic as in Lambda)
    const sanitizedEmail = user.email?.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || user.id

    // Get or create the SNS topic
    const topicName = `${SNS_TOPIC_PREFIX}${sanitizedEmail}`

    // List topics to find the ARN
    const listTopicsResponse = await sns.listTopics().promise()
    let topicArn = null

    for (const topic of listTopicsResponse.Topics || []) {
      if (topic.TopicArn && topic.TopicArn.includes(topicName)) {
        topicArn = topic.TopicArn
        break
      }
    }

    // If topic doesn't exist, create it
    if (!topicArn) {
      const createTopicResponse = await sns.createTopic({ Name: topicName }).promise()
      topicArn = createTopicResponse.TopicArn
    }

    if (!topicArn) {
      return NextResponse.json({ error: "Failed to get or create SNS topic" }, { status: 500 })
    }

    // Subscribe to the topic
    let subscriptionResponse

    if (subscriptionType === "email") {
      // Email subscription
      subscriptionResponse = await sns
        .subscribe({
          TopicArn: topicArn,
          Protocol: "email",
          Endpoint: endpoint,
        })
        .promise()
    } else if (subscriptionType === "sms") {
      // SMS subscription
      subscriptionResponse = await sns
        .subscribe({
          TopicArn: topicArn,
          Protocol: "sms",
          Endpoint: endpoint,
        })
        .promise()
    } else {
      return NextResponse.json({ error: "Unsupported subscription type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Subscription request sent successfully",
      subscriptionArn: subscriptionResponse.SubscriptionArn,
      pendingConfirmation: subscriptionResponse.SubscriptionArn === "PendingConfirmation",
    })
  } catch (error: any) {
    console.error("Error subscribing to SNS topic:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// Get subscription status
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

    // Sanitize email for topic name (same logic as in Lambda)
    const sanitizedEmail = user.email?.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || user.id

    // Get the SNS topic
    const topicName = `${SNS_TOPIC_PREFIX}${sanitizedEmail}`

    // List topics to find the ARN
    const listTopicsResponse = await sns.listTopics().promise()
    let topicArn = null

    for (const topic of listTopicsResponse.Topics || []) {
      if (topic.TopicArn && topic.TopicArn.includes(topicName)) {
        topicArn = topic.TopicArn
        break
      }
    }

    if (!topicArn) {
      return NextResponse.json({
        success: true,
        hasSubscription: false,
        message: "No topic found for this user",
      })
    }

    // List subscriptions for this topic
    const subscriptionsResponse = await sns
      .listSubscriptionsByTopic({
        TopicArn: topicArn,
      })
      .promise()

    const subscriptions = subscriptionsResponse.Subscriptions || []

    return NextResponse.json({
      success: true,
      hasSubscription: subscriptions.length > 0,
      subscriptions: subscriptions.map((sub) => ({
        endpoint: sub.Endpoint,
        protocol: sub.Protocol,
        status: sub.SubscriptionArn === "PendingConfirmation" ? "pending" : "confirmed",
      })),
    })
  } catch (error: any) {
    console.error("Error checking SNS subscriptions:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

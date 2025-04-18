import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { subscribeToUserTopic, getUserTopicArn, isEndpointSubscribed, validateEndpoint } from "@/lib/sns-client"

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
    const { endpoint, protocol } = await request.json()

    console.log(`Subscribe request received - Endpoint: ${endpoint}, Protocol: ${protocol}`)

    if (!endpoint || !protocol) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate endpoint format
    if (!validateEndpoint(endpoint, protocol)) {
      return NextResponse.json(
        {
          error: `Invalid endpoint format for protocol ${protocol}`,
          details: `For ${protocol} protocol, endpoint must be a valid ${protocol} URL`,
        },
        { status: 400 },
      )
    }

    // Check if AWS SNS environment variables are present
    const missingVars = [
      !process.env.NEXT_AWS_ACCESS_KEY_ID ? "NEXT_AWS_ACCESS_KEY_ID" : null,
      !process.env.NEXT_AWS_SECRET_ACCESS_KEY ? "NEXT_AWS_SECRET_ACCESS_KEY" : null,
      !process.env.NEXT_PUBLIC_AWS_REGION ? "NEXT_PUBLIC_AWS_REGION" : null,
      !process.env.NEXT_PUBLIC_AWS_ACCOUNT_ID ? "NEXT_PUBLIC_AWS_ACCOUNT_ID" : null,
    ].filter(Boolean)

    if (missingVars.length > 0) {
      console.log("Missing environment variables:", missingVars)
      return NextResponse.json(
        {
          error: "Server configuration error: SNS not configured",
          missingVariables: missingVars,
        },
        { status: 500 },
      )
    }

    // Get user identifier (email or ID)
    const userIdentifier = user.email || user.id
    console.log(`Using user identifier: ${userIdentifier}`)

    // Check if the endpoint is already subscribed
    const topicArn = getUserTopicArn(userIdentifier)
    console.log(`Topic ARN: ${topicArn}`)

    const isSubscribed = await isEndpointSubscribed(topicArn, endpoint)

    if (isSubscribed) {
      console.log("Endpoint already subscribed")
      return NextResponse.json({
        success: true,
        message: "Endpoint already subscribed",
        topicArn,
      })
    }

    // Subscribe the endpoint to the user's SNS topic
    console.log("Attempting to subscribe endpoint to topic...")
    const subscriptionArn = await subscribeToUserTopic(
      userIdentifier,
      endpoint,
      protocol as "email" | "http" | "https" | "sms" | "application",
    )

    console.log(`Subscription successful, ARN: ${subscriptionArn}`)
    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to notifications",
      subscriptionArn,
      topicArn,
    })
  } catch (error: any) {
    console.error("Error in subscribe API route:", error)
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

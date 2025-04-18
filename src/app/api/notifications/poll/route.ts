import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { receiveMessagesFromQueue, getUserQueueUrl, isSqsConfigured } from "@/lib/sqs-client"

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

    console.log(`Poll request received from user: ${user.email || user.id}`)

    // Check if AWS SQS environment variables are present
    if (!isSqsConfigured()) {
      const missingVars = [
        !process.env.NEXT_AWS_ACCESS_KEY_ID ? "NEXT_AWS_ACCESS_KEY_ID" : null,
        !process.env.NEXT_AWS_SECRET_ACCESS_KEY ? "NEXT_AWS_SECRET_ACCESS_KEY" : null,
        !process.env.NEXT_PUBLIC_AWS_REGION ? "NEXT_PUBLIC_AWS_REGION" : null,
        !process.env.NEXT_PUBLIC_AWS_ACCOUNT_ID ? "NEXT_PUBLIC_AWS_ACCOUNT_ID" : null,
      ].filter(Boolean)

      console.log("Missing environment variables:", missingVars)
      return NextResponse.json(
        {
          error: "Server configuration error: SQS not configured",
          missingVariables: missingVars,
        },
        { status: 500 },
      )
    }

    // Get user identifier (email or ID)
    const userIdentifier = user.email || user.id
    console.log(`Using user identifier: ${userIdentifier}`)

    // Get the queue URL
    const queueUrl = getUserQueueUrl(userIdentifier)
    console.log(`Queue URL: ${queueUrl}`)

    // Poll for messages
    console.log("Attempting to poll for messages...")
    const messages = await receiveMessagesFromQueue(userIdentifier, 5)

    console.log(`Received ${messages.length} messages`)
    return NextResponse.json({
      success: true,
      message: "Successfully polled for notifications",
      queueUrl,
      messages,
    })
  } catch (error: any) {
    console.error("Error in poll API route:", error)
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

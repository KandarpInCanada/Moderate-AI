import { NextResponse } from "next/server"
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"
import { marshall } from "@aws-sdk/util-dynamodb"
import { createAdminClient } from "@/lib/supabase-client"

// Initialize the DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || "",
  },
})

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

    // Parse the request body for any additional user details
    const additionalDetails = await request.json()

    // Extract user metadata from Supabase user object
    const { id, email, user_metadata, created_at, updated_at } = user

    // Extract name parts from Google user data
    let firstName = ""
    let lastName = ""

    if (user_metadata?.name) {
      const nameParts = user_metadata.name.split(" ")
      firstName = nameParts[0] || ""
      lastName = nameParts.slice(1).join(" ") || ""
    }

    // Prepare user data for DynamoDB
    const userData = {
      UserId: id,
      Email: email,
      FirstName: firstName,
      LastName: lastName,
      ProfilePicture: user_metadata?.avatar_url || user_metadata?.picture || "",
      Provider: user_metadata?.provider || "google",
      LastLogin: new Date().toISOString(),
      CreatedAt: created_at,
      UpdatedAt: updated_at || new Date().toISOString(),
      ...additionalDetails, // Include any additional details passed in the request
    }

    // Store user data in DynamoDB
    const params = {
      TableName: process.env.NEXT_PUBLIC_USER_DETAILS_DYNAMODB_TABLE_NAME || "UserDetails",
      Item: marshall(userData),
    }

    await dynamoClient.send(new PutItemCommand(params))

    return NextResponse.json({ success: true, message: "User details stored successfully" })
  } catch (error: any) {
    console.error("Error storing user details:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// Get user details by ID
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

    // Get user ID from URL or use authenticated user's ID
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId") || user.id

    // TODO: Implement GetItem from DynamoDB to retrieve user details
    // For now, return a success message
    return NextResponse.json({ success: true, message: "User details API endpoint working" })
  } catch (error: any) {
    console.error("Error retrieving user details:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

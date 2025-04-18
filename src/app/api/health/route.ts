import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"
import dynamoClient from "@/lib/dynamo-client"
import { DescribeTableCommand } from "@aws-sdk/client-dynamodb"

export async function GET() {
  try {
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV,
    }
    let databaseStatus = "unknown"
    try {
      // Use a more reliable way to check Supabase connection
      const { data, error } = await supabase.auth.getSession()

      // We're just checking if the connection works, not if there's a session
      databaseStatus = error ? "error" : "connected"

      // Add error details if available
      if (error) {
        console.error("Supabase connection error:", error.message)
      }
    } catch (dbError) {
      console.error("Database health check failed:", dbError)
      databaseStatus = "error"
    }

    // Check DynamoDB connection
    let dynamoStatus = "unknown"
    try {
      if (
        process.env.NEXT_AWS_ACCESS_KEY_ID &&
        process.env.NEXT_AWS_SECRET_ACCESS_KEY &&
        process.env.NEXT_USER_DETAILS_DYNAMODB_TABLE_NAME
      ) {
        // Try to describe the UserDetails table
        const command = new DescribeTableCommand({
          TableName: process.env.NEXT_USER_DETAILS_DYNAMODB_TABLE_NAME,
        })
        await dynamoClient.send(command)
        dynamoStatus = "connected"
      } else {
        dynamoStatus = "not_configured"
      }
    } catch (dynamoError) {
      console.error("DynamoDB health check failed:", dynamoError)
      dynamoStatus = "error"
    }

    // Determine overall status based on dependencies
    const isHealthy = databaseStatus !== "error" && (dynamoStatus === "connected" || dynamoStatus === "not_configured")

    // Return health check response
    return NextResponse.json({
      ...healthData,
      status: isHealthy ? "healthy" : "degraded",
      dependencies: {
        database: databaseStatus,
        dynamodb: dynamoStatus,
        // Add other dependencies here as needed (e.g., AWS S3, etc.)
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)

    // Return error response with 500 status code
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Internal server error during health check",
      },
      { status: 500 },
    )
  }
}

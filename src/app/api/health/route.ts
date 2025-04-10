import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function GET() {
  try {
    // Basic health check information
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV,
    }

    // Check Supabase connection
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

    // Determine overall status based on dependencies
    const isHealthy = databaseStatus !== "error"

    // Return health check response
    return NextResponse.json({
      ...healthData,
      status: isHealthy ? "healthy" : "degraded",
      dependencies: {
        database: databaseStatus,
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

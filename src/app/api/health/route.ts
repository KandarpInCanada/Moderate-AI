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
      // Simple query to check if Supabase is responsive
      const { error } = await supabase.from("health_check").select("count").limit(1).single()

      // If the table doesn't exist, that's okay - we just want to check the connection
      databaseStatus = error && error.code !== "PGRST116" ? "error" : "connected"
    } catch (dbError) {
      console.error("Database health check failed:", dbError)
      databaseStatus = "error"
    }

    // Add dependency statuses to the response
    const dependencies = {
      database: databaseStatus,
      // Add other dependencies here as needed (e.g., AWS S3, etc.)
    }

    // Return health check response
    return NextResponse.json({
      ...healthData,
      dependencies,
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

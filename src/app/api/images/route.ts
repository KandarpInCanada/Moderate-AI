import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"
import { listUserImages } from "@/lib/s3-client"

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

    // Get user identifier (email or ID)
    const userIdentifier = user.email || user.id

    // List images from the user's S3 folder
    const images = await listUserImages(userIdentifier)

    return NextResponse.json({ images })
  } catch (error: any) {
    console.error("Error fetching images:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

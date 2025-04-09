import { NextResponse } from "next/server"
import { getPresignedPostUrl } from "@/lib/s3-client"
import { createAdminClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 })
    }

    // Extract the token
    const token = authHeader.split(" ")[1]

    try {
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
      const { filename, contentType, fileSize } = await request.json()

      if (!filename || !contentType) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      // Check if AWS S3 is configured
      if (
        !process.env.NEXT_AWS_ACCESS_KEY_ID ||
        !process.env.NEXT_AWS_SECRET_ACCESS_KEY ||
        !process.env.NEXT_AWS_REGION ||
        !process.env.NEXT_AWS_BUCKET_NAME
      ) {
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
      }

      // Generate pre-signed URL
      const presignedData = await getPresignedPostUrl(
        { name: filename, type: contentType, size: fileSize },
        user.email || user.id,
      )

      return NextResponse.json(presignedData)
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Server error" }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

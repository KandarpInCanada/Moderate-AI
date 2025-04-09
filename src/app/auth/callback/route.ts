import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize the Supabase client directly in the route handler
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    console.log("Auth callback triggered. Full URL:", requestUrl.toString())

    // Log all parameters for debugging
    const params = Object.fromEntries(requestUrl.searchParams.entries())
    console.log("All search params:", params)

    // Check if this is a direct access to the callback URL without going through OAuth
    if (Object.keys(params).length === 0) {
      console.warn("Callback URL accessed directly without OAuth parameters")
      return NextResponse.redirect(`${requestUrl.origin}/login?error=direct_access`)
    }

    const code = requestUrl.searchParams.get("code")
    const origin = requestUrl.origin
    const error = requestUrl.searchParams.get("error")
    const errorDescription = requestUrl.searchParams.get("error_description")

    // Check for OAuth error parameters
    if (error) {
      console.error(`OAuth error: ${error}`, errorDescription)
      return NextResponse.redirect(
        `${origin}/auth/error?reason=oauth_error&message=${encodeURIComponent(errorDescription || error)}`,
      )
    }

    // Handle case where code is missing
    if (!code) {
      console.error("No code provided in callback")
      return NextResponse.redirect(
        `${origin}/auth/error?reason=missing_code&message=No authorization code was provided in the callback`,
      )
    }

    // Create a Supabase client for this request
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Exchange the code for a session
    console.log("Exchanging code for session...")
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error("Error exchanging code for session:", sessionError.message)
      return NextResponse.redirect(
        `${origin}/auth/error?reason=exchange_failed&message=${encodeURIComponent(sessionError.message)}`,
      )
    }

    if (!data.session) {
      console.error("No session returned after code exchange")
      return NextResponse.redirect(
        `${origin}/auth/error?reason=no_session&message=Authentication succeeded but no session was created`,
      )
    }

    console.log("Session exchange successful, user ID:", data.session.user.id)

    // Successful authentication, redirect to home page
    return NextResponse.redirect(`${origin}/`)
  } catch (error: any) {
    console.error("Unexpected error in auth callback:", error)
    const errorMessage = error?.message || "An unexpected error occurred during authentication"
    return NextResponse.redirect(
      `${origin}/auth/error?reason=unexpected_error&message=${encodeURIComponent(errorMessage)}`,
    )
  }
}

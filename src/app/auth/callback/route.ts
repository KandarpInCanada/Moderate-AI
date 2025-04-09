import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const params = Object.fromEntries(requestUrl.searchParams.entries())

    if (Object.keys(params).length === 0) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=direct_access`)
    }

    const code = requestUrl.searchParams.get("code")
    const origin = requestUrl.origin
    const error = requestUrl.searchParams.get("error")
    const errorDescription = requestUrl.searchParams.get("error_description")

    if (error) {
      return NextResponse.redirect(
        `${origin}/auth/error?reason=oauth_error&message=${encodeURIComponent(errorDescription || error)}`,
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${origin}/auth/error?reason=missing_code&message=No authorization code was provided in the callback`,
      )
    }

    const supabase = createAdminClient()
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      return NextResponse.redirect(
        `${origin}/auth/error?reason=exchange_failed&message=${encodeURIComponent(sessionError.message)}`,
      )
    }

    if (!data.session) {
      return NextResponse.redirect(
        `${origin}/auth/error?reason=no_session&message=Authentication succeeded but no session was created`,
      )
    }

    return NextResponse.redirect(`${origin}/`)
  } catch (error: any) {
    const errorMessage = error?.message || "An unexpected error occurred during authentication"
    const origin = new URL(request.url).origin
    return NextResponse.redirect(
      `${origin}/auth/error?reason=unexpected_error&message=${encodeURIComponent(errorMessage)}`,
    )
  }
}

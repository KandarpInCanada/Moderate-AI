import { createClient } from "@supabase/supabase-js"

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Log configuration for debugging
console.log("Supabase URL configured:", !!supabaseUrl)
console.log("Supabase Anon Key configured:", !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Don't specify flowType to use Supabase's default
  },
})

// Test the client
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Supabase auth event:", event, "Session exists:", !!session)
})

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

supabase.auth.onAuthStateChange((event, session) => {
  // Auth state changed
})

export const createAdminClient = () => {
  const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || ""
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase admin credentials")
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

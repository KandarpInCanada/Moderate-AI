terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

provider "supabase" {
  access_token = var.supabase_access_token
}

resource "supabase_settings" "auth" {
  project_ref = var.project_id

  auth = jsonencode({
    site_url      = var.site_url
    redirect_urls = var.additional_redirect_urls
  })
}

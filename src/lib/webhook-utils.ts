/**
 * Generates a webhook URL for a specific user
 * @param userId The user identifier (email or ID)
 * @param baseUrl The base URL of the application
 * @returns The webhook URL
 */
export function getUserWebhookUrl(userId: string, baseUrl?: string): string {
  // Sanitize the user identifier to make it URL-safe
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()

  // Use the provided base URL or default to the environment variable
  const appBaseUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://photosense.vercel.app"

  // Construct the webhook URL
  return `${appBaseUrl}/api/webhooks/${sanitizedUserId}`
}

/**
 * Generates a unique token for webhook authentication
 * @param userId The user identifier
 * @returns A unique token
 */
export function generateWebhookToken(userId: string): string {
  // In a production environment, you would use a more secure method
  // This is a simple implementation for demonstration purposes
  const secret = process.env.WEBHOOK_SECRET || "photosense-webhook-secret"
  return Buffer.from(`${userId}:${secret}:${Date.now()}`).toString("base64")
}

import { SNSClient, SubscribeCommand, ListSubscriptionsByTopicCommand, UnsubscribeCommand } from "@aws-sdk/client-sns"

// Initialize the SNS client
const snsClient = new SNSClient({
  region: process.env.NEXT_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || "",
  },
})

// Check if AWS credentials are configured
export const isConfigured = () => {
  return !!(process.env.NEXT_AWS_ACCESS_KEY_ID && process.env.NEXT_AWS_SECRET_ACCESS_KEY && process.env.NEXT_AWS_REGION)
}

/**
 * Get or create an SNS topic for a user
 * @param userIdentifier User email or ID
 * @returns Topic ARN
 */
export const getUserTopicArn = (userIdentifier: string) => {
  const sanitizedIdentifier = userIdentifier.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
  const topicName = `user-notify-${sanitizedIdentifier}`
  return `arn:aws:sns:${process.env.NEXT_AWS_REGION}:${process.env.NEXT_AWS_ACCOUNT_ID}:${topicName}`
}

/**
 * Subscribe a user's endpoint to their SNS topic
 * @param userIdentifier User email or ID
 * @param endpoint Endpoint to subscribe (email, HTTP/S, SMS, etc.)
 * @param protocol Protocol for the endpoint (email, http, https, sms, etc.)
 * @returns Subscription ARN
 */
export const subscribeToUserTopic = async (
  userIdentifier: string,
  endpoint: string,
  protocol: "email" | "http" | "https" | "sms" | "application",
) => {
  if (!isConfigured()) {
    throw new Error("AWS SNS is not properly configured")
  }

  const topicArn = getUserTopicArn(userIdentifier)

  try {
    const command = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: protocol,
      Endpoint: endpoint,
      ReturnSubscriptionArn: true,
    })

    const response = await snsClient.send(command)
    return response.SubscriptionArn
  } catch (error) {
    console.error("Error subscribing to SNS topic:", error)
    throw error
  }
}

/**
 * Check if an endpoint is already subscribed to a topic
 * @param topicArn Topic ARN
 * @param endpoint Endpoint to check
 * @returns Boolean indicating if the endpoint is subscribed
 */
export const isEndpointSubscribed = async (topicArn: string, endpoint: string) => {
  try {
    const command = new ListSubscriptionsByTopicCommand({
      TopicArn: topicArn,
    })

    const response = await snsClient.send(command)

    return (
      response.Subscriptions?.some(
        (subscription) => subscription.Endpoint === endpoint && subscription.SubscriptionArn !== "PendingConfirmation",
      ) || false
    )
  } catch (error) {
    console.error("Error checking subscription status:", error)
    return false
  }
}

/**
 * Unsubscribe from an SNS topic
 * @param subscriptionArn Subscription ARN
 */
export const unsubscribeFromTopic = async (subscriptionArn: string) => {
  try {
    const command = new UnsubscribeCommand({
      SubscriptionArn: subscriptionArn,
    })

    await snsClient.send(command)
  } catch (error) {
    console.error("Error unsubscribing from SNS topic:", error)
    throw error
  }
}

export default snsClient

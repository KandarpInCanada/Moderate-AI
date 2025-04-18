import { SNSClient, SubscribeCommand, ListSubscriptionsByTopicCommand, UnsubscribeCommand } from "@aws-sdk/client-sns"

// Initialize the SNS client
const snsClient = new SNSClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || "",
  },
})

/**
 * Get or create an SNS topic for a user
 * @param userIdentifier User email or ID
 * @returns Topic ARN
 */
export const getUserTopicArn = (userIdentifier: string) => {
  const sanitizedIdentifier = userIdentifier.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
  const topicName = `user-notify-${sanitizedIdentifier}`
  const region = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1"
  const accountId = process.env.NEXT_PUBLIC_AWS_ACCOUNT_ID || "000000000000"

  console.log(`Creating topic ARN with region: ${region}, accountId: ${accountId}, topicName: ${topicName}`)

  return `arn:aws:sns:${region}:${accountId}:${topicName}`
}

/**
 * Validate endpoint format based on protocol
 * @param endpoint Endpoint to validate
 * @param protocol Protocol for the endpoint
 * @returns Boolean indicating if the endpoint is valid
 */
export const validateEndpoint = (endpoint: string, protocol: string): boolean => {
  switch (protocol) {
    case "http":
    case "https":
      try {
        const url = new URL(endpoint)
        return url.protocol === `${protocol}:`
      } catch (e) {
        return false
      }
    case "email":
      // Simple email validation
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(endpoint)
    case "sms":
      // Simple phone number validation (E.164 format)
      return /^\+[1-9]\d{1,14}$/.test(endpoint)
    default:
      return true
  }
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
  console.log(`Attempting to subscribe endpoint: ${endpoint} with protocol: ${protocol}`)

  // Validate endpoint format
  if (!validateEndpoint(endpoint, protocol)) {
    const errorMsg = `Invalid endpoint format for protocol ${protocol}: ${endpoint}`
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  const topicArn = getUserTopicArn(userIdentifier)
  console.log(`Using topic ARN: ${topicArn}`)

  try {
    console.log(`Creating SubscribeCommand with:`, {
      TopicArn: topicArn,
      Protocol: protocol,
      Endpoint: endpoint,
      ReturnSubscriptionArn: true,
    })

    const command = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: protocol,
      Endpoint: endpoint,
      ReturnSubscriptionArn: true,
    })

    console.log("Sending subscription request to AWS SNS...")
    const response = await snsClient.send(command)
    console.log("Subscription response received:", JSON.stringify(response, null, 2))

    return response.SubscriptionArn
  } catch (error: any) {
    console.error("Error subscribing to SNS topic:", error)

    // Enhanced error logging
    if (error.$metadata) {
      console.error("Error metadata:", {
        requestId: error.$metadata.requestId,
        httpStatusCode: error.$metadata.httpStatusCode,
        attempts: error.$metadata.attempts,
        totalRetryDelay: error.$metadata.totalRetryDelay,
      })
    }

    if (error.message) {
      console.error("Error message:", error.message)
    }

    // Provide a more helpful error message
    let errorMessage = "Failed to subscribe to SNS topic"

    if (error.name === "InvalidParameterException" && error.message.includes("Endpoint must match")) {
      errorMessage = `Invalid endpoint format: ${endpoint} does not match protocol ${protocol}. For HTTPS endpoints, ensure the URL starts with 'https://'`
    } else if (error.message) {
      errorMessage = `SNS Error: ${error.message}`
    }

    throw new Error(errorMessage)
  }
}

/**
 * Check if an endpoint is already subscribed to a topic
 * @param topicArn Topic ARN
 * @param endpoint Endpoint to check
 * @returns Boolean indicating if the endpoint is subscribed
 */
export const isEndpointSubscribed = async (topicArn: string, endpoint: string) => {
  console.log(`Checking if endpoint ${endpoint} is subscribed to topic ${topicArn}`)

  try {
    const command = new ListSubscriptionsByTopicCommand({
      TopicArn: topicArn,
    })

    console.log("Sending ListSubscriptionsByTopic request...")
    const response = await snsClient.send(command)
    console.log(`Found ${response.Subscriptions?.length || 0} subscriptions for topic`)

    const isSubscribed =
      response.Subscriptions?.some((subscription) => {
        const match = subscription.Endpoint === endpoint && subscription.SubscriptionArn !== "PendingConfirmation"
        if (subscription.Endpoint === endpoint) {
          console.log(
            `Found matching endpoint: ${subscription.Endpoint}, Status: ${subscription.SubscriptionArn === "PendingConfirmation" ? "Pending" : "Confirmed"}`,
          )
        }
        return match
      }) || false

    console.log(`Endpoint is ${isSubscribed ? "already" : "not"} subscribed`)
    return isSubscribed
  } catch (error: any) {
    console.error("Error checking subscription status:", error)

    // Enhanced error logging
    if (error.$metadata) {
      console.error("Error metadata:", {
        requestId: error.$metadata.requestId,
        httpStatusCode: error.$metadata.httpStatusCode,
      })
    }

    return false
  }
}

/**
 * Unsubscribe from an SNS topic
 * @param subscriptionArn Subscription ARN
 */
export const unsubscribeFromTopic = async (subscriptionArn: string) => {
  console.log(`Attempting to unsubscribe from subscription ARN: ${subscriptionArn}`)

  try {
    const command = new UnsubscribeCommand({
      SubscriptionArn: subscriptionArn,
    })

    console.log("Sending unsubscribe request...")
    await snsClient.send(command)
    console.log("Successfully unsubscribed")
  } catch (error: any) {
    console.error("Error unsubscribing from SNS topic:", error)

    // Enhanced error logging
    if (error.$metadata) {
      console.error("Error metadata:", {
        requestId: error.$metadata.requestId,
        httpStatusCode: error.$metadata.httpStatusCode,
      })
    }

    throw new Error(`Failed to unsubscribe: ${error.message || "Unknown error"}`)
  }
}

export default snsClient

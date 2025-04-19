import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs"

// Initialize the SQS client
const sqsClient = new SQSClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || "",
  },
})

/**
 * Get the SQS queue URL for a user
 * @param userIdentifier User email or ID
 * @returns Queue URL
 */
export const getUserQueueUrl = (userIdentifier: string) => {
  const sanitizedIdentifier = userIdentifier.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()
  const queueName = `user-notify-${sanitizedIdentifier}`
  const region = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1"
  const accountId = process.env.NEXT_PUBLIC_AWS_ACCOUNT_ID || "000000000000"

  console.log(`Creating queue URL with region: ${region}, accountId: ${accountId}, queueName: ${queueName}`)

  return `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`
}

/**
 * Send a message to a user's SQS queue
 * @param userIdentifier User email or ID
 * @param message Message to send
 * @returns Message ID
 */
export const sendMessageToUserQueue = async (userIdentifier: string, message: any) => {
  console.log(`Attempting to send message to queue for user: ${userIdentifier}`)

  const queueUrl = getUserQueueUrl(userIdentifier)
  console.log(`Using queue URL: ${queueUrl}`)

  try {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
      // Optional: Add message attributes if needed
      MessageAttributes: {
        MessageType: {
          DataType: "String",
          StringValue: "Notification",
        },
      },
    })

    console.log("Sending message to SQS...")
    const response = await sqsClient.send(command)
    console.log("Message sent successfully:", response.MessageId)

    return response.MessageId
  } catch (error: any) {
    console.error("Error sending message to SQS queue:", error)

    // Enhanced error logging
    if (error.$metadata) {
      console.error("Error metadata:", {
        requestId: error.$metadata.requestId,
        httpStatusCode: error.$metadata.httpStatusCode,
        attempts: error.$metadata.attempts,
        totalRetryDelay: error.$metadata.totalRetryDelay,
      })
    }

    throw new Error(`Failed to send message to SQS: ${error.message || "Unknown error"}`)
  }
}

/**
 * Receive messages from a user's SQS queue
 * @param userIdentifier User email or ID
 * @param maxMessages Maximum number of messages to receive (1-10)
 * @returns Array of messages
 */
export const receiveMessagesFromQueue = async (userIdentifier: string, maxMessages = 10) => {
  console.log(`Attempting to receive messages from queue for user: ${userIdentifier}`)

  const queueUrl = getUserQueueUrl(userIdentifier)
  console.log(`Using queue URL: ${queueUrl}`)

  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: Math.min(maxMessages, 10), // SQS allows max 10 messages at once
      WaitTimeSeconds: 2, // Long polling to reduce costs, but don't wait too long
      VisibilityTimeout: 30, // Hide message for 30 seconds while processing
      MessageAttributeNames: ["All"],
      AttributeNames: ["All"],
    })

    console.log("Receiving messages from SQS...")
    const response = await sqsClient.send(command)
    console.log(`Received ${response.Messages?.length || 0} messages`)

    return response.Messages || []
  } catch (error: any) {
    console.error("Error receiving messages from SQS queue:", error)

    // Enhanced error logging
    if (error.$metadata) {
      console.error("Error metadata:", {
        requestId: error.$metadata.requestId,
        httpStatusCode: error.$metadata.httpStatusCode,
      })
    }

    // If the queue doesn't exist, return an empty array instead of throwing
    if (error.name === "QueueDoesNotExist") {
      console.log("Queue does not exist, returning empty array")
      return []
    }

    throw new Error(`Failed to receive messages from SQS: ${error.message || "Unknown error"}`)
  }
}

/**
 * Delete a message from a user's SQS queue
 * @param userIdentifier User email or ID
 * @param receiptHandle Receipt handle of the message to delete
 */
export const deleteMessageFromQueue = async (userIdentifier: string, receiptHandle: string) => {
  console.log(`Attempting to delete message from queue for user: ${userIdentifier}`)

  const queueUrl = getUserQueueUrl(userIdentifier)
  console.log(`Using queue URL: ${queueUrl}`)

  try {
    const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    })

    console.log("Deleting message from SQS...")
    await sqsClient.send(command)
    console.log("Message deleted successfully")
  } catch (error: any) {
    console.error("Error deleting message from SQS queue:", error)

    // Enhanced error logging
    if (error.$metadata) {
      console.error("Error metadata:", {
        requestId: error.$metadata.requestId,
        httpStatusCode: error.$metadata.httpStatusCode,
      })
    }

    throw new Error(`Failed to delete message from SQS: ${error.message || "Unknown error"}`)
  }
}

/**
 * Check if SQS is properly configured
 * @returns Boolean indicating if SQS is configured
 */
export const isSqsConfigured = () => {
  return !!(
    process.env.NEXT_AWS_ACCESS_KEY_ID &&
    process.env.NEXT_AWS_SECRET_ACCESS_KEY &&
    process.env.NEXT_PUBLIC_AWS_REGION &&
    process.env.NEXT_PUBLIC_AWS_ACCOUNT_ID
  )
}

export default sqsClient

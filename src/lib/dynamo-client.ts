import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

// Initialize the DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || "",
  },
})

// Create a document client for easier interaction with DynamoDB
export const docClient = DynamoDBDocumentClient.from(dynamoClient)

// Check if AWS credentials are configured
export const isConfigured = () => {
  return !!(
    process.env.NEXT_AWS_ACCESS_KEY_ID &&
    process.env.NEXT_AWS_SECRET_ACCESS_KEY &&
    process.env.NEXT_AWS_REGION &&
    process.env.NEXT_USER_DETAILS_DYNAMODB_TABLE_NAME
  )
}

export default dynamoClient

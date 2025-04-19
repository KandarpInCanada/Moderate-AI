"use client";

import { useState } from "react";
import { useNotifications } from "@/context/notifications-context";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  Code,
  Terminal,
} from "lucide-react";

export default function WebhookDocumentation() {
  const { webhookUrl } = useNotifications();
  const [expanded, setExpanded] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopyCode = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(snippet);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Example AWS CLI command to create an SNS topic and subscribe the webhook
  const awsCliExample = `# Create an SNS topic
aws sns create-topic --name my-photosense-notifications

# Subscribe your webhook to the topic
aws sns subscribe \\
  --topic-arn arn:aws:sns:us-east-1:123456789012:my-photosense-notifications \\
  --protocol https \\
  --notification-endpoint ${
    webhookUrl || "https://photosense.vercel.app/api/webhooks/your_user_id"
  }`;

  // Example AWS SDK code to publish to the topic
  const awsSdkExample = `import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "us-east-1" });

async function sendNotification() {
  const params = {
    TopicArn: "arn:aws:sns:us-east-1:123456789012:my-photosense-notifications",
    Message: JSON.stringify({
      title: "New Photo Processed",
      message: "Your photo has been analyzed successfully",
      type: "success",
      imageId: "image123",
      imageUrl: "https://example.com/image.jpg",
      timestamp: new Date().toISOString()
    }),
    Subject: "Photo Processing Complete"
  };

  try {
    const command = new PublishCommand(params);
    const response = await snsClient.send(command);
    console.log("Message sent successfully:", response.MessageId);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}`;

  // Example webhook payload format
  const webhookPayloadExample = `{
  "Type": "Notification",
  "MessageId": "12345678-1234-1234-1234-123456789012",
  "TopicArn": "arn:aws:sns:us-east-1:123456789012:my-photosense-notifications",
  "Subject": "Photo Processing Complete",
  "Message": "{\"title\":\"New Photo Processed\",\"message\":\"Your photo has been analyzed successfully\",\"type\":\"success\",\"imageId\":\"image123\",\"imageUrl\":\"https://example.com/image.jpg\",\"timestamp\":\"2023-04-19T12:34:56.789Z\"}",
  "Timestamp": "2023-04-19T12:34:56.789Z",
  "SignatureVersion": "1",
  "Signature": "...",
  "SigningCertURL": "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-...",
  "UnsubscribeURL": "https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&..."
}`;

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 mt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Code className="h-5 w-5 mr-2 text-primary" />
          Webhook Integration Guide
        </h3>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-6 animate-fade-in">
          <p className="text-muted-foreground">
            Use this guide to integrate your webhook endpoint with AWS SNS for
            receiving real-time notifications.
          </p>

          <div>
            <h4 className="text-md font-medium text-foreground mb-2">
              Your Webhook URL
            </h4>
            <div className="bg-muted p-3 rounded-md flex items-center justify-between">
              <code className="text-sm font-mono text-foreground">
                {webhookUrl ||
                  "https://photosense.vercel.app/api/webhooks/your_user_id"}
              </code>
              <button
                onClick={() =>
                  handleCopyCode(
                    webhookUrl ||
                      "https://photosense.vercel.app/api/webhooks/your_user_id"
                  )
                }
                className="p-1.5 rounded-md hover:bg-background text-muted-foreground hover:text-foreground"
                title="Copy webhook URL"
              >
                {copiedSnippet ===
                (webhookUrl ||
                  "https://photosense.vercel.app/api/webhooks/your_user_id") ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-foreground mb-2">
              AWS CLI Example
            </h4>
            <div className="relative">
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-sm font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                  {awsCliExample}
                </pre>
              </div>
              <button
                onClick={() => handleCopyCode(awsCliExample)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground"
                title="Copy code"
              >
                {copiedSnippet === awsCliExample ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-foreground mb-2">
              AWS SDK Example
            </h4>
            <div className="relative">
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-sm font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                  {awsSdkExample}
                </pre>
              </div>
              <button
                onClick={() => handleCopyCode(awsSdkExample)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground"
                title="Copy code"
              >
                {copiedSnippet === awsSdkExample ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-foreground mb-2">
              Webhook Payload Format
            </h4>
            <div className="relative">
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-sm font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                  {webhookPayloadExample}
                </pre>
              </div>
              <button
                onClick={() => handleCopyCode(webhookPayloadExample)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground"
                title="Copy code"
              >
                {copiedSnippet === webhookPayloadExample ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2 flex items-center">
              <Terminal className="h-4 w-4 mr-2" />
              Testing Your Webhook
            </h4>
            <p className="text-blue-700 dark:text-blue-500 text-sm">
              You can test your webhook by sending a test message to your SNS
              topic. The webhook will receive the notification and display it in
              your notifications panel.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

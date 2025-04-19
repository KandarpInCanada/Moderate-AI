import boto3
import os
import json
import uuid
from datetime import datetime
from decimal import Decimal

rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

image_metadata_table_name = os.environ['DYNAMODB_TABLE_NAME']
notifications_table_name = os.environ['NOTIFICATIONS_TABLE_NAME']
sns_topic_prefix = os.environ['SNS_TOPIC_PREFIX']

image_metadata_table = dynamodb.Table(image_metadata_table_name)
notifications_table = dynamodb.Table(notifications_table_name)

def get_or_create_topic(sanitized_email):
    topic_name = f"{sns_topic_prefix}{sanitized_email}"
    
    # Check if topic already exists
    try:
        topics = sns.list_topics()
        for topic in topics.get('Topics', []):
            if topic_name in topic['TopicArn']:
                topic_arn = topic['TopicArn']
                print(f"Found existing SNS topic: {topic_arn}")
                return topic_arn
    except Exception as e:
        print(f"Error checking existing topics: {e}")
    
    # Create the topic if it doesn't exist
    try:
        response = sns.create_topic(Name=topic_name)
        topic_arn = response['TopicArn']
        print(f"Created new SNS topic: {topic_arn}")
        return topic_arn
    except Exception as e:
        print(f"Error creating SNS topic: {e}")
        raise e

# Helper function to convert floats to Decimals in a nested structure
def convert_floats_to_decimals(obj):
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: convert_floats_to_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_floats_to_decimals(i) for i in obj]
    else:
        return obj

def handler(event, context):
    print("Received event:")
    print(json.dumps(event))

    for record in event['Records']:
        try:
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']

            print(f"Processing file from S3 - Bucket: {bucket}, Key: {key}")

            # Extract user email part from key path: users/{sanitized_email}/...
            parts = key.split('/')
            if len(parts) < 3 or parts[0] != 'users':
                raise ValueError(f"Unexpected S3 key format: {key}")

            sanitized_email = parts[1]
            image_id = key
            filename = parts[-1]

            # Rekognition analysis
            labels_response = rekognition.detect_labels(
                Image={'S3Object': {'Bucket': bucket, 'Name': key}},
                MaxLabels=10,
                MinConfidence=70
            )

            # Detect faces
            faces_response = rekognition.detect_faces(
                Image={'S3Object': {'Bucket': bucket, 'Name': key}},
                Attributes=['ALL']
            )

            # Detect text
            text_response = rekognition.detect_text(
                Image={'S3Object': {'Bucket': bucket, 'Name': key}}
            )

            # Process results - Convert confidence values to Decimal
            labels = [{'name': label['Name'], 'confidence': Decimal(str(label['Confidence']))} 
                     for label in labels_response['Labels']]
            
            face_count = len(faces_response['FaceDetails'])
            
            detected_text = [text['DetectedText'] 
                            for text in text_response['TextDetections'] 
                            if text['Type'] == 'LINE']

            # Create metadata object
            timestamp = datetime.now().isoformat()
            metadata = {
                'ImageId': image_id,
                'key': key,
                'filename': filename,
                'url': f"https://{bucket}.s3.amazonaws.com/{key}",
                'labels': [label['name'] for label in labels],
                'faces': face_count,
                'location': next((label['name'] for label in labels if label['name'] in 
                                ['City', 'Town', 'Village', 'Beach', 'Mountain', 'Lake', 'Ocean', 'Park']), ''),
                'uploadDate': timestamp,
                'rekognitionDetails': {
                    'labels': labels,
                    'faces': face_count,
                    'text': detected_text,
                    'celebrities': [],
                    'analyzedAt': timestamp
                }
            }

            # Convert any remaining float values to Decimal
            metadata = convert_floats_to_decimals(metadata)

            # Store metadata to DynamoDB
            image_metadata_table.put_item(Item=metadata)
            print(f"Metadata successfully stored for {key}")

            # Create notification
            notification_id = str(uuid.uuid4())
            notification = {
                'UserId': sanitized_email,
                'NotificationId': notification_id,
                'Title': 'Image Analysis Complete',
                'Message': f"Your image '{filename}' has been analyzed. Found {face_count} faces and {len(labels)} objects.",
                'Timestamp': timestamp,
                'Read': False,
                'Type': 'success',
                'ImageId': image_id,
                'ImageUrl': f"https://{bucket}.s3.amazonaws.com/{key}"
            }

            # Store notification in DynamoDB
            notifications_table.put_item(Item=notification)
            print(f"Notification stored in DynamoDB: {notification_id}")

            # Get or create SNS topic, then publish message
            topic_arn = get_or_create_topic(sanitized_email)

            # Prepare message for SNS
            message = {
                'title': 'Image Analysis Complete',
                'message': f"Your image '{filename}' has been analyzed. Found {face_count} faces and {len(labels)} objects.",
                'type': 'success',
                'imageId': image_id,
                'imageUrl': f"https://{bucket}.s3.amazonaws.com/{key}",
                'timestamp': timestamp
            }

            # Create webhook URL for the user
            app_url = os.environ.get('APP_URL', 'https://photosense.vercel.app')
            # Ensure app_url has https:// prefix
            if not app_url.startswith('http'):
                app_url = f"https://{app_url}"

            # Create a properly sanitized webhook URL
            sanitized_endpoint = sanitized_email.replace('@', '_').replace('.', '_')
            webhook_url = f"{app_url}/api/webhooks/{sanitized_endpoint}"

            # Validate the webhook URL format
            if not webhook_url.startswith('https://'):
                print(f"Warning: Webhook URL {webhook_url} does not use HTTPS protocol, SNS requires HTTPS")
                # For development, you might want to skip subscription if not HTTPS
                # But for production, ensure your URL is HTTPS
            else:
                # Subscribe the webhook to the topic if not already subscribed
                try:
                    # Check if webhook is already subscribed
                    subscriptions = sns.list_subscriptions_by_topic(TopicArn=topic_arn)
                    webhook_already_subscribed = False
                    
                    for sub in subscriptions.get('Subscriptions', []):
                        if sub.get('Protocol') == 'https' and webhook_url in sub.get('Endpoint', ''):
                            webhook_already_subscribed = True
                            print(f"Webhook URL already subscribed: {webhook_url}")
                            break
                    
                    # Subscribe webhook if not already subscribed
                    if not webhook_already_subscribed:
                        print(f"Attempting to subscribe webhook URL to SNS topic: {webhook_url}")
                        subscription_response = sns.subscribe(
                            TopicArn=topic_arn,
                            Protocol='https',
                            Endpoint=webhook_url,
                            ReturnSubscriptionArn=True
                        )
                        print(f"Subscribed webhook URL to SNS topic: {webhook_url}, ARN: {subscription_response.get('SubscriptionArn')}")
                except Exception as e:
                    print(f"Error managing webhook subscription: {e}")
                    print(f"Failed webhook URL: {webhook_url}")

            # Send to SNS
            response = sns.publish(
                TopicArn=topic_arn,
                Message=json.dumps(message),
                Subject='Image Analysis Complete',
                MessageAttributes={
                    'MessageType': {
                        'DataType': 'String',
                        'StringValue': 'Notification'
                    }
                }
            )

            print(f"Message sent to SNS topic: {topic_arn}, MessageId: {response['MessageId']}")

        except Exception as e:
            print(f"Error processing file {record['s3']['object']['key']}: {e}")
            # Print the full stack trace for better debugging
            import traceback
            traceback.print_exc()

    return {
        "statusCode": 200,
        "body": json.dumps("Image processing complete and notifications sent to SNS.")
    }

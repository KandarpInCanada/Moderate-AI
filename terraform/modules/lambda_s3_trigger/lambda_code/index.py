import boto3
import os
import json
import uuid
from datetime import datetime
from decimal import Decimal

rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')
sqs = boto3.client('sqs')

image_metadata_table_name = os.environ['DYNAMODB_TABLE_NAME']
notifications_table_name = os.environ['NOTIFICATIONS_TABLE_NAME']
sqs_queue_prefix = os.environ['SQS_QUEUE_PREFIX']

image_metadata_table = dynamodb.Table(image_metadata_table_name)
notifications_table = dynamodb.Table(notifications_table_name)

def get_or_create_queue(sanitized_email):
    queue_name = f"{sqs_queue_prefix}{sanitized_email}"
    
    # Check if queue already exists
    try:
        response = sqs.get_queue_url(QueueName=queue_name)
        queue_url = response['QueueUrl']
        print(f"Found existing SQS queue: {queue_url}")
    except sqs.exceptions.QueueDoesNotExist:
        # Create the queue if it doesn't exist
        response = sqs.create_queue(
            QueueName=queue_name,
            Attributes={
                'MessageRetentionPeriod': '86400',  # 1 day retention
                'VisibilityTimeout': '60'  # 60 seconds
            }
        )
        queue_url = response['QueueUrl']
        print(f"Created new SQS queue: {queue_url}")
    
    return queue_url

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

            # Get or create SQS queue, then send message
            queue_url = get_or_create_queue(sanitized_email)

            # Prepare message for SQS
            message = {
                'title': 'Image Analysis Complete',
                'message': f"Your image '{filename}' has been analyzed. Found {face_count} faces and {len(labels)} objects.",
                'type': 'success',
                'imageId': image_id,
                'imageUrl': f"https://{bucket}.s3.amazonaws.com/{key}",
                'timestamp': timestamp
            }

            # Send to SQS
            response = sqs.send_message(
                QueueUrl=queue_url,
                MessageBody=json.dumps(message),
                MessageAttributes={
                    'MessageType': {
                        'DataType': 'String',
                        'StringValue': 'Notification'
                    }
                }
            )

            print(f"Message sent to SQS queue: {queue_url}, MessageId: {response['MessageId']}")

        except Exception as e:
            print(f"Error processing file {record['s3']['object']['key']}: {e}")
            # Print the full stack trace for better debugging
            import traceback
            traceback.print_exc()

    return {
        "statusCode": 200,
        "body": json.dumps("Image processing complete and notifications sent to SQS.")
    }

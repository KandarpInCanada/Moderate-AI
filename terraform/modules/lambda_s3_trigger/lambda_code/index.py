import boto3
import os
import json
import uuid
from datetime import datetime

rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

image_metadata_table_name = os.environ['DYNAMODB_TABLE_NAME']
notifications_table_name = os.environ.get('NOTIFICATIONS_TABLE_NAME', 'Notifications')
sns_topic_prefix = os.environ.get('SNS_TOPIC_PREFIX', 'user-notify-')

image_metadata_table = dynamodb.Table(image_metadata_table_name)
notifications_table = dynamodb.Table(notifications_table_name)

def get_or_create_topic(sanitized_email):
    topic_name = f"{sns_topic_prefix}{sanitized_email}"

    # Check if topic already exists
    response = sns.list_topics()
    topic_arn = None

    for topic in response.get('Topics', []):
        if topic_name in topic['TopicArn']:
            topic_arn = topic['TopicArn']
            break

    # If not found, create it
    if not topic_arn:
        create_response = sns.create_topic(Name=topic_name)
        topic_arn = create_response['TopicArn']
        print(f"Created SNS topic: {topic_arn}")

    return topic_arn

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

            # Process results
            labels = [{'name': label['Name'], 'confidence': label['Confidence']} 
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

            # Get or create SNS topic, then publish
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

            # Publish to SNS
            sns.publish(
                TopicArn=topic_arn,
                Message=json.dumps(message),
                Subject=f"Image processed: {filename}"
            )

            print(f"Notification sent to SNS topic: {topic_arn}")

        except Exception as e:
            print(f"Error processing file {record['s3']['object']['key']}: {e}")

    return {
        "statusCode": 200,
        "body": json.dumps("Image processing complete and notifications sent.")
    }

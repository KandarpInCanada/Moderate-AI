import boto3
import os
import json

rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

table_name = os.environ['DYNAMODB_TABLE_NAME']
sns_topic_prefix = os.environ.get('SNS_TOPIC_PREFIX', 'user-notify-')

table = dynamodb.Table(table_name)

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

            # Rekognition analysis
            response = rekognition.detect_labels(
                Image={'S3Object': {'Bucket': bucket, 'Name': key}},
                MaxLabels=5,
                MinConfidence=80
            )

            labels = [label['Name'] for label in response['Labels']]
            print(f"Detected labels for {key}: {labels}")

            # Store metadata to DynamoDB
            table.put_item(Item={
                'ImageId': image_id,
                'labels': labels
            })

            print(f"Metadata successfully stored for {key}")

            # Get or create SNS topic, then publish
            topic_arn = get_or_create_topic(sanitized_email)

            message = {
                "imageId": image_id,
                "labels": labels,
                "bucket": bucket
            }

            sns.publish(
                TopicArn=topic_arn,
                Message=json.dumps(message),
                Subject=f"Image processed for {sanitized_email}"
            )

            print(f"Notification sent to SNS topic: {topic_arn}")

        except Exception as e:
            print(f"Error processing file {record['s3']['object']['key']}: {e}")

    return {
        "statusCode": 200,
        "body": json.dumps("Metadata processed and notification sent.")
    }

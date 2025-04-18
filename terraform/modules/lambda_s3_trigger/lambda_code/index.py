import boto3
import os
import json

rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')
table_name = os.environ['DYNAMODB_TABLE_NAME']
table = dynamodb.Table(table_name)

def handler(event, context):
    print("Received event:")
    print(json.dumps(event))

    for record in event['Records']:
        try:
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']

            print(f"Processing file from S3 - Bucket: {bucket}, Key: {key}")

            response = rekognition.detect_labels(
                Image={'S3Object': {'Bucket': bucket, 'Name': key}},
                MaxLabels=5,
                MinConfidence=80
            )

            labels = [label['Name'] for label in response['Labels']]
            print(f"Detected labels for {key}: {labels}")

            table.put_item(Item={
                'image_key': key,
                'labels': labels
            })

            print(f"Metadata successfully stored for {key}")

        except Exception as e:
            print(f"Error processing file {record['s3']['object']['key']}: {e}")

    return {
        "statusCode": 200,
        "body": json.dumps("Metadata processed and stored in DynamoDB.")
    }

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

// Support DynamoDB Local for local development
const dynamoClientConfig = {};
if (process.env.AWS_ENDPOINT_URL) {
  dynamoClientConfig.endpoint = process.env.AWS_ENDPOINT_URL;
  dynamoClientConfig.region = 'local';
  dynamoClientConfig.credentials = {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  };
}

const dynamoClient = new DynamoDBClient(dynamoClientConfig);
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Annotation ID is required',
        }),
      };
    }

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        id,
      },
    });

    await docClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Annotation deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Error deleting annotation:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Failed to delete annotation',
        error: error.message,
      }),
    };
  }
};


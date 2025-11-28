import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const body = JSON.parse(event.body || '{}');
    const { x, y, z, text } = body;

    // Validate input
    if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Invalid coordinates. x, y, and z must be numbers',
        }),
      };
    }

    if (!text || typeof text !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Text is required and must be a string',
        }),
      };
    }

    // Validate text length (max 256 bytes)
    const textBytes = new TextEncoder().encode(text).length;
    if (textBytes > 256) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Text must be 256 bytes or less',
        }),
      };
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    const annotation = {
      id,
      x,
      y,
      z,
      text: text.substring(0, 256),
      created_at: now,
      updated_at: now,
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: annotation,
    });

    await docClient.send(command);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(annotation),
    };
  } catch (error) {
    console.error('Error creating annotation:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Failed to create annotation',
        error: error.message,
      }),
    };
  }
};


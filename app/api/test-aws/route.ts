import { NextResponse } from 'next/server';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

export async function GET() {
  // Collect all AWS-related environment variables
  const awsEnvVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('AWS')) {
      // Mask sensitive values but show they exist
      if (key === 'AWS_SECRET_ACCESS_KEY' || key === 'AWS_SESSION_TOKEN') {
        awsEnvVars[key] = value ? `${value.slice(0, 10)}...${value.slice(-4)} (${value.length} chars)` : 'NOT SET';
      } else if (key === 'AWS_ACCESS_KEY_ID') {
        awsEnvVars[key] = value ? `${value.slice(0, 8)}...` : 'NOT SET';
      } else {
        awsEnvVars[key] = value || 'NOT SET';
      }
    }
  }

  // Try to use S3 client with default credential chain
  let s3Result: string;
  try {
    const client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
    await client.send(new ListBucketsCommand({}));
    s3Result = 'SUCCESS';
  } catch (error: any) {
    s3Result = `ERROR: ${error.message}`;
  }

  return NextResponse.json({
    injectedAwsEnvVars: awsEnvVars,
    s3ClientResult: s3Result,
    note: 'If AWS_SESSION_TOKEN is present but you only set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, Vercel is injecting it from the Lambda runtime',
  });
}

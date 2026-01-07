import { NextResponse } from 'next/server';

export async function GET() {
  const awsEnvVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('AWS')) {
      if (key === 'AWS_SECRET_ACCESS_KEY' || key === 'AWS_SESSION_TOKEN') {
        awsEnvVars[key] = value ? `${value.slice(0, 10)}...${value.slice(-4)} (${value.length} chars)` : 'NOT SET';
      } else if (key === 'AWS_ACCESS_KEY_ID') {
        awsEnvVars[key] = value ? `${value.slice(0, 8)}...` : 'NOT SET';
      } else {
        awsEnvVars[key] = value || 'NOT SET';
      }
    }
  }
  return NextResponse.json(awsEnvVars);
}

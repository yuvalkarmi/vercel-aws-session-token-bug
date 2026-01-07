import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

export default async function Home() {
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

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '800px' }}>
      <h1>Vercel AWS_SESSION_TOKEN Injection Bug</h1>

      <h2>Injected AWS Environment Variables</h2>
      <pre style={{ background: '#f4f4f4', padding: '1rem', overflow: 'auto' }}>
        {JSON.stringify(awsEnvVars, null, 2)}
      </pre>

      <h2>S3 Client Result (using default credential chain)</h2>
      <pre style={{ background: s3Result.startsWith('ERROR') ? '#fee' : '#efe', padding: '1rem' }}>
        {s3Result}
      </pre>

      <h2>The Bug</h2>
      <p>
        When you set <code>AWS_ACCESS_KEY_ID</code> and <code>AWS_SECRET_ACCESS_KEY</code> as
        environment variables in Vercel, the serverless runtime also injects <code>AWS_SESSION_TOKEN</code>
        from the underlying Lambda execution environment.
      </p>
      <p>
        The AWS SDK sees all three variables and tries to use them together. But since user credentials
        are permanent IAM credentials (not temporary STS credentials), the combination is invalid,
        causing: <code>The security token included in the request is invalid</code>
      </p>

      <p style={{ marginTop: '2rem', color: '#666' }}>
        <strong>Note:</strong> If <code>AWS_SESSION_TOKEN</code> appears above but you only set
        <code>AWS_ACCESS_KEY_ID</code> and <code>AWS_SECRET_ACCESS_KEY</code>, Vercel is injecting it.
      </p>
    </main>
  );
}

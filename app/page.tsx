export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Vercel AWS_SESSION_TOKEN Injection Bug</h1>
      <p>
        Visit <a href="/api/test-aws">/api/test-aws</a> to see the injected AWS environment variables.
      </p>
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
    </main>
  );
}

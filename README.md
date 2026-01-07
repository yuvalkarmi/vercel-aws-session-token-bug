# Vercel AWS_SESSION_TOKEN Injection Bug

## The Problem

When deploying to Vercel with user-defined `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables, the serverless runtime injects `AWS_SESSION_TOKEN` from the underlying AWS Lambda execution environment.

The AWS SDK's default credential chain picks up all three variables, but since user credentials are permanent IAM credentials (not temporary STS credentials), the combination is invalid, resulting in:

```
The security token included in the request is invalid
```

## Timeline

- This started occurring around January 6-7, 2026
- No code changes, dependency updates, or configuration changes were made
- Production AWS integrations broke without warning

## To Reproduce

1. Deploy this repo to Vercel
2. Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables (use real IAM user credentials)
3. Visit `/api/test-aws`
4. Observe that `AWS_SESSION_TOKEN` is present even though you didn't set it
5. Observe the S3 client error

## Expected Behavior

Only user-defined AWS environment variables should be used. The Lambda runtime's `AWS_SESSION_TOKEN` should not be exposed or should be filtered out when users have their own AWS credentials configured.

## Workaround

Explicitly pass credentials to AWS SDK clients:

```typescript
const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
```

## Vercel Documentation Reference

From [Vercel's reserved environment variables docs](https://vercel.com/docs/projects/environment-variables/reserved-environment-variables):

> "These variables may appear in your Vercel Functions even if you don't set them in your project explicitly. These values do not grant any AWS permissions and are not usable as AWS credentials."

The problem is the AWS SDK doesn't know these credentials are "not usable" - it just sees them and tries to use them.

## Your focus: AWS Well-Architected review

Review only the AWS-related parts of this change (AWS SDK calls, Amazon Bedrock use,
infrastructure code, IAM, credentials and configuration) against the six pillars of
the AWS Well-Architected Framework:

- **Security**: how credentials reach the code (never hard-coded or shipped to the
  browser bundle), least-privilege IAM, data protection in transit and at rest,
  input passed to AWS services.
- **Reliability**: retries with backoff, timeouts, throttling handling, behaviour
  when the AWS call fails or the user is offline.
- **Performance efficiency**: request size, streaming versus blocking calls, model
  and region choice.
- **Cost optimization**: avoidable calls, unbounded token usage, missing limits.
- **Operational excellence**: errors surfaced to the user and logged usefully,
  configuration kept out of code.
- **Sustainability**: unnecessary repeated work.

Name the pillar in each finding's title, for example
`**src/services/X.ts:10 — [Security] ...**`. Ignore non-AWS code unless it directly
affects how AWS is used.

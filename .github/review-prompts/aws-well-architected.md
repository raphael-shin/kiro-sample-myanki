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

Use the AWS Knowledge MCP server (`aws-knowledge-mcp-server`) to ground each
finding in official guidance: `search_documentation` for the relevant
Well-Architected best practice or service documentation, and `read_documentation`
to confirm it. Cite the page you relied on with its URL at the end of the finding.
If that server's tools are not available in this session, say so in one line under
참고 and review from your own knowledge.

Name the pillar in each finding's title, for example
`**src/services/X.ts:10 — [Security] ...**`. Ignore non-AWS code unless it directly
affects how AWS is used.

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
For infrastructure code (for example under `infra/`), also use the AWS IaC MCP
server (`aws-iac-mcp-server`):

- For every CloudFormation template the PR adds or changes, pass its full content
  to `validate_cloudformation_template` and `check_cloudformation_template_compliance`.
  Report each error or violation they return as a finding, with the template path
  and line.
- For CDK code, use `cdk_best_practices` and `search_cdk_documentation` to check the
  constructs the PR adds or changes. CDK is not synthesized in this workflow, so
  review the source; do not claim a synthesized template was validated.
- Use `search_cloudformation_documentation` and `read_iac_documentation_page` to
  confirm resource properties.

You have no AWS credentials, so do not try to troubleshoot deployed stacks.

If a server's tools are not available in this session, say which one in the opening
summary line and review from your own knowledge.

Name the pillar on its own line in each finding, right after the quoted code, as
`Pillar: Security`. Cite the documentation page you relied on with its URL at the
end of the finding's `Fix:` line. Ignore non-AWS code unless it directly affects how
AWS is used.

#!/usr/bin/env bash
# Build the Lambdas, deploy the SAM stack, then health-check the deployed API.
# Usage: infra/deploy.sh [stack-name]   (default: thatblog)
set -euo pipefail

STACK_NAME="${1:-thatblog}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Resolve the region once and pass it to both sam and aws, so they can never
# target different regions (e.g. sam using the config default while aws uses env).
REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-$(aws configure get region 2>/dev/null || true)}}"
if [[ -z "$REGION" ]]; then
  echo "ERROR: no region set. Export AWS_REGION or set a default with 'aws configure'." >&2
  exit 1
fi
echo "==> Region: $REGION"

echo "==> Installing dependencies"
(cd "$ROOT" && bun install)

echo "==> Building backend-api"
(cd "$ROOT" && bun run build:api)

echo "==> Deploying stack: $STACK_NAME"
sam deploy \
  --template-file "$ROOT/infra/template.yaml" \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset

echo "==> Reading stack outputs"
API_URL="$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text)"

echo "==> Health check: ${API_URL}/health"
curl -fsS "${API_URL}/health"
echo
echo "==> Deployed. API: ${API_URL}"

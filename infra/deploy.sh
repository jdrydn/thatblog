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

echo "==> Building Lambdas (backend-api + frontend-site) + admin SPA"
(cd "$ROOT" && bun run build)

echo "==> Deploying stack: $STACK_NAME"
sam deploy \
  --template-file "$ROOT/infra/template.yaml" \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset

echo "==> Reading stack outputs"
outputs() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" \
    --output text
}
BASE_URL="$(outputs Url)"
CONTENT_BUCKET="$(outputs ContentBucketName)"

# Sync the shipped themes to the catalog prefix the site renders from (PLAN.md section 12). Per-blog
# theme copies (themes/{blogId}/) are a runtime op (0.1.6); v0.0.5 renders straight from _catalog.
echo "==> Syncing themes to s3://${CONTENT_BUCKET}/themes/_catalog/"
aws s3 sync "$ROOT/themes/" "s3://${CONTENT_BUCKET}/themes/_catalog/" \
  --region "$REGION" \
  --delete \
  --exclude '*/node_modules/*'

# Sync the admin SPA (one global build serves every blog) to the /admin prefix the HTTP API's S3
# proxy serves from (PLAN.md #17, section 12). --delete clears stale hashed assets from prior builds.
echo "==> Syncing admin SPA to s3://${CONTENT_BUCKET}/admin/"
aws s3 sync "$ROOT/components/frontend-admin/dist/" "s3://${CONTENT_BUCKET}/admin/" \
  --region "$REGION" \
  --delete

echo "==> Health check: ${BASE_URL}/api/health"
curl -fsS "${BASE_URL}/api/health"
echo
echo "==> Deployed. Site: ${BASE_URL}  API: ${BASE_URL}/api  Admin: ${BASE_URL}/admin"

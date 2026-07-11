#!/usr/bin/env bash
# Tear down the SAM stack. Empties the content bucket first (CloudFormation
# cannot delete a non-empty bucket), then deletes the stack.
# Usage: infra/teardown.sh [stack-name] [-y]   (default stack: thatblog)
#   -y / FORCE=1  skip the confirmation prompt
set -euo pipefail

STACK_NAME="thatblog"
FORCE="${FORCE:-0}"
for arg in "$@"; do
  case "$arg" in
    -y | --yes) FORCE=1 ;;
    *) STACK_NAME="$arg" ;;
  esac
done

REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-$(aws configure get region 2>/dev/null || true)}}"
if [[ -z "$REGION" ]]; then
  echo "ERROR: no region set. Export AWS_REGION or set a default with 'aws configure'." >&2
  exit 1
fi

echo "==> Region: $REGION"
echo "==> Stack:  $STACK_NAME"

if [[ "$FORCE" != "1" ]]; then
  read -r -p "This permanently deletes the stack and ALL its data. Type the stack name to confirm: " reply
  if [[ "$reply" != "$STACK_NAME" ]]; then
    echo "Aborted." >&2
    exit 1
  fi
fi

# Empty the content bucket so CloudFormation can delete it.
BUCKET="$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ContentBucketName'].OutputValue" \
  --output text 2>/dev/null || true)"

if [[ -n "$BUCKET" && "$BUCKET" != "None" ]]; then
  echo "==> Emptying content bucket: $BUCKET"
  aws s3 rm "s3://$BUCKET" --recursive --region "$REGION" || true
else
  echo "==> No content bucket found (already gone?), skipping empty"
fi

echo "==> Deleting stack: $STACK_NAME"
sam delete \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --no-prompts

echo "==> Torn down: $STACK_NAME"

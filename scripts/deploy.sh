#!/usr/bin/env bash
DIR="$( cd -- "$(dirname "$0")/../" >/dev/null 2>&1 ; pwd -P )"

ARG_STACKNAME="thatblog"
ARG_DESTROY=false
ARG_RENEW=false

while [ $# -gt 0 ]; do
  case "$1" in
    "--stack-name") ARG_STACKNAME="$2"; shift ;;
    "--aws-profile") export AWS_PROFILE="$2"; shift ;;
    "--aws-region") export AWS_REGION="$2"; shift ;;
    "--destroy") ARG_DESTROY=true ;;
    "--renew") ARG_DESTROY=true; ARG_RENEW=true ;;
  esac
  shift
done

throw_err() {
  if [ "$1" -ne "0" ]; then
    echo "[ERROR] $2" 1>&2
    exit "$1"
  fi
}

aws --version >/dev/null
throw_err "$?" "Missing CLI: aws"

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
throw_err "$?" "Failed to authenticate with AWS"

BUCKET_QUERY="Stacks[?StackName=='$ARG_STACKNAME'][].Outputs[?OutputKey=='BucketName'].OutputValue"

if [ "$ARG_DESTROY" = "true" ]; then
  BUCKET_NAME=$(aws cloudformation describe-stacks --query "$BUCKET_QUERY" --output text)
  throw_err "$?" "Failed to get S3 bucket name"
  throw_err "$([ -z "$BUCKET_NAME" ] && echo 1 || echo 0)" "Failed to get S3 bucket name"

  echo "[TASK] Clearing bucket: $BUCKET_NAME"
  aws s3 rm "s3://$BUCKET_NAME" --recursive
  throw_err "$?" "Failed to empty S3 bucket"

  cd $DIR/infrastructure
  npx cdk destroy -c stackName="$ARG_STACKNAME"
  throw_err "$?" "Failed: cdk destroy"

  # If we destroyed the stack, exit early
  if [ "$ARG_RENEW" = "false" ]; then
    exit 0
  fi

  printf "\n\n"
fi

cd $DIR/infrastructure
npx cdk deploy -c stackName="$ARG_STACKNAME"
throw_err "$?" "Failed: cdk deploy"

BUCKET_NAME=$(aws cloudformation describe-stacks --query "$BUCKET_QUERY" --output text)
throw_err "$?" "Failed to get S3 bucket name"
throw_err "$([ -z "$BUCKET_NAME" ] && echo 1 || echo 0)" "Failed to get S3 bucket name"

aws s3 sync ./dist/ s3://$BUCKET_NAME/ --delete
throw_err "$?" "Failed sync files to S3"

cd $DIR

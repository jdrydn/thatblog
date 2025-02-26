#!/usr/bin/env bash
DIR="$( cd -- "$(dirname "$0")/../" >/dev/null 2>&1 ; pwd -P )"

ARG_S3_BUCKET="thatblog"

while [ $# -gt 0 ]; do
  case "$1" in
    "--s3-bucket") ARG_S3_BUCKET="$2"; shift ;;
    "--aws-profile") export AWS_PROFILE="$2"; shift ;;
    "--aws-region") export AWS_REGION="$2"; shift ;;
  esac
  shift
done

npx nodemon --exec "aws s3 sync" $DIR/themes s3://$ARG_S3_BUCKET/themes/ --delete --ext '*' --watch ./ \
  --exclude ".envrc" --exclude "sync.sh"

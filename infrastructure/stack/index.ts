import path from 'path';
import * as cdk from 'aws-cdk-lib';

export default function createStack(app: cdk.App, stackName: string) {
  const stack = new cdk.Stack(app, 'Thatblog', {
    stackName,
  });

  const siteLambda = new cdk.aws_lambda.Function(stack, 'SiteLambda', {
    functionName: `${stackName}-site`,
    runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
    handler: 'app-min.handler',
    code: cdk.aws_lambda.Code.fromAsset(path.join(__dirname, '../../frontend-blog/dist')),
  });

  const suffix = cdk.Fn.select(4, cdk.Fn.split('-', cdk.Fn.select(2, cdk.Fn.split('/', cdk.Fn.ref('AWS::StackId')))));

  const bucket = new cdk.aws_s3.Bucket(stack, 'Files', {
    bucketName: cdk.Fn.join('-', [stackName, suffix]),
    encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
    publicReadAccess: false, // Optional: Only if you want the assets to be publicly accessible
    removalPolicy: cdk.RemovalPolicy.DESTROY, // Optional: Cleanup bucket on stack deletion
  });

  // Output the bucket name
  new cdk.CfnOutput(stack, 'SiteLambdaFunction', {
    description: 'Name of the Site Lambda function',
    value: siteLambda.functionName,
  });
  new cdk.CfnOutput(stack, 'BucketName', {
    description: 'Name of the S3 bucket',
    value: bucket.bucketName,
  });

  return stack.stackName;
}

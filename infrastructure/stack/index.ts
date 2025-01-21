import * as cdk from 'aws-cdk-lib';

export default function createStack(app: cdk.App, stackName: string) {
  const stack = new cdk.Stack(app, 'Thatblog', {
    stackName,
  });

  const suffix = cdk.Fn.select(4, cdk.Fn.split('-', cdk.Fn.select(2, cdk.Fn.split('/', cdk.Fn.ref('AWS::StackId')))));

  const bucket = new cdk.aws_s3.Bucket(stack, 'Files', {
    bucketName: cdk.Fn.join('-', [stackName, suffix]),
    encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
    publicReadAccess: false, // Optional: Only if you want the assets to be publicly accessible
    removalPolicy: cdk.RemovalPolicy.DESTROY, // Optional: Cleanup bucket on stack deletion
  });

  // Output the bucket name
  new cdk.CfnOutput(stack, 'BucketName', {
    value: bucket.bucketName,
    description: 'Name of the S3 bucket',
  });

  return stack.stackName;
}

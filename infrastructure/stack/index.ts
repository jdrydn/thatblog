import * as cdk from 'aws-cdk-lib';

export default function createStack(app: cdk.App, stackName: string) {
  const stack = new cdk.Stack(app, 'Stack', {
    stackName,
  });

  const bucket = new cdk.aws_s3.Bucket(stack, 'Files', {
    encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
    publicReadAccess: false, // Optional: Only if you want the assets to be publicly accessible
    removalPolicy: cdk.RemovalPolicy.DESTROY, // Optional: Cleanup bucket on stack deletion
    autoDeleteObjects: true, // Optional: Delete objects when stack is deleted
  });

  // Deploy static assets to the bucket
  new cdk.aws_s3_deployment.BucketDeployment(stack, 'DeployStaticAssets', {
    sources: [cdk.aws_s3_deployment.Source.asset('./dist')],
    destinationBucket: bucket,
    destinationKeyPrefix: 'frontend', // Deploy to the `/frontend` folder in the bucket
  });

  // Output the bucket name
  new cdk.CfnOutput(stack, 'BucketName', {
    value: bucket.bucketName,
    description: 'Name of the S3 bucket',
  });

  return stack.stackName;
}

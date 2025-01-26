import assert from 'assert';
import path from 'path';
import * as cdk from 'aws-cdk-lib';

export default function createStack(app: cdk.App, stackName: string) {
  const stack = new cdk.Stack(app, 'Thatblog', {
    stackName,
  });

  const api = new cdk.aws_apigatewayv2.HttpApi(stack, 'Thatblog', {
    apiName: stackName,
  });

  const suffix = cdk.Fn.select(4, cdk.Fn.split('-', cdk.Fn.select(2, cdk.Fn.split('/', cdk.Fn.ref('AWS::StackId')))));

  const bucket = new cdk.aws_s3.Bucket(stack, 'Files', {
    bucketName: cdk.Fn.join('-', [stackName, suffix]),
    encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
    publicReadAccess: true,
    blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ACLS,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    websiteIndexDocument: 'index.html',
  });

  const bucketIntegration = new cdk.aws_apigatewayv2_integrations.HttpUrlIntegration(
    'FilesIntegration',
    bucket.bucketWebsiteUrl,
    {
      parameterMapping: cdk.aws_apigatewayv2.ParameterMapping.fromObject({
        'overwrite:path': cdk.aws_apigatewayv2.MappingValue.requestPath(),
      }),
      timeout: cdk.Duration.seconds(10),
    },
  );

  api.addRoutes({
    path: '/static/{proxy+}',
    methods: [cdk.aws_apigatewayv2.HttpMethod.GET],
    integration: bucketIntegration,
  });
  api.addRoutes({
    path: '/themes/{proxy+}',
    methods: [cdk.aws_apigatewayv2.HttpMethod.GET],
    integration: bucketIntegration,
  });

  const siteLambda = new cdk.aws_lambda.Function(stack, 'SiteLambda', {
    functionName: `${stackName}-site`,
    runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
    handler: 'app-min.handler',
    code: cdk.aws_lambda.Code.fromAsset(path.join(__dirname, '../../frontend-blog/dist')),
    environment: {
      S3_BUCKET: bucket.bucketName,
    },
  });

  api.addRoutes({
    path: '/{proxy+}',
    methods: [cdk.aws_apigatewayv2.HttpMethod.ANY],
    integration: new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration('SiteIntegration', siteLambda),
  });

  new cdk.CfnOutput(stack, 'Url', {
    description: 'API Gateway URL',
    value: api.url!,
  });
  new cdk.CfnOutput(stack, 'BucketName', {
    description: 'S3 Bucket Name',
    value: bucket.bucketName,
  });

  return stack.stackName;
}

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

  // const apiGatewayRole = new cdk.aws_iam.Role(stack, 'ApiGatewayRole', {
  //   assumedBy: new cdk.aws_iam.ServicePrincipal('apigateway.amazonaws.com'),
  // });

  const lambdaRole = new cdk.aws_iam.Role(stack, 'LambdaRole', {
    assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
  });

  const bucket = new cdk.aws_s3.Bucket(stack, 'Files', {
    bucketName: cdk.Fn.join('-', [stackName, suffix]),
    encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
    publicReadAccess: true,
    blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ACLS,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    websiteIndexDocument: 'index.html',
  });

  bucket.grantReadWrite(lambdaRole);

  api.addRoutes({
    path: '/themes/{proxy+}',
    methods: [cdk.aws_apigatewayv2.HttpMethod.GET],
    integration: new cdk.aws_apigatewayv2_integrations.HttpUrlIntegration(
      'ThemesIntegration',
      bucket.bucketWebsiteUrl,
      {
        parameterMapping: cdk.aws_apigatewayv2.ParameterMapping.fromObject({
          // 'overwrite:path': cdk.aws_apigatewayv2.MappingValue.custom('/frontend-blog/$request.path'),
          'overwrite:path': cdk.aws_apigatewayv2.MappingValue.requestPath(),
        }),
        timeout: cdk.Duration.seconds(10),
      },
    ),
  });

  const apiLambda = new cdk.aws_lambda.Function(stack, 'ApiLambda', {
    functionName: `${stackName}-api`,
    runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
    handler: 'handler.handler',
    code: cdk.aws_lambda.Code.fromAsset(path.join(__dirname, '../../backend-api/dist')),
    role: lambdaRole,
    architecture: cdk.aws_lambda.Architecture.ARM_64,
    memorySize: 1024,
    environment: {
      NODE_ENV: 'production',
      THATBLOG_DYNAMODB_TABLENAME: 'thatblog-example',
      THATBLOG_S3_BUCKET: bucket.bucketName,
      THATBLOG_USER_AUTH_SECRET: 'hello-world',
      LOG_LEVEL: 'debug',
    },
    timeout: cdk.Duration.seconds(29),
  });

  api.addRoutes({
    path: '/api/{proxy+}',
    methods: [cdk.aws_apigatewayv2.HttpMethod.ANY],
    integration: new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration('ApiIntegration', apiLambda, {
      payloadFormatVersion: cdk.aws_apigatewayv2.PayloadFormatVersion.VERSION_2_0,
    }),
  });

  const siteLambda = new cdk.aws_lambda.Function(stack, 'SiteLambda', {
    functionName: `${stackName}-site`,
    runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
    handler: 'blog.handler',
    code: cdk.aws_lambda.Code.fromAsset(path.join(__dirname, '../../frontend-blog/dist')),
    role: lambdaRole,
    architecture: cdk.aws_lambda.Architecture.ARM_64,
    memorySize: 1024,
    environment: {
      NODE_ENV: 'production',
      THATBLOG_S3_BUCKET: bucket.bucketName,
      THATBLOG_USER_AUTH_SECRET: 'hello-world',
      HYDE_TEMPLATE_CACHE_DIR: '/tmp',
    },
    timeout: cdk.Duration.seconds(29),
  });

  siteLambda.addPermission('ApiGatewayInvokePermission', {
    principal: new cdk.aws_iam.ServicePrincipal('apigateway.amazonaws.com'),
    action: 'lambda:InvokeFunction',
    sourceArn: `arn:aws:execute-api:${stack.region}:${stack.account}:*`, // Adjust as needed
  });

  api.addRoutes({
    path: '/{proxy+}',
    methods: [cdk.aws_apigatewayv2.HttpMethod.GET],
    integration: new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration('SiteIntegration', siteLambda, {
      payloadFormatVersion: cdk.aws_apigatewayv2.PayloadFormatVersion.VERSION_2_0,
    }),
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

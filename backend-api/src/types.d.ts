import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';

export { APIGatewayProxyEventV2 as LambdaEvent, APIGatewayProxyStructuredResultV2 as LambdaResult };

export interface LambdaContext extends Context {
  blogId?: string;
  userId?: string;
}

import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

import { DYNAMODB_ENDPOINT } from './config'

export const dydb = new DynamoDB({
  endpoint: DYNAMODB_ENDPOINT,
})

export const dcdb = DynamoDBDocumentClient.from(dydb)

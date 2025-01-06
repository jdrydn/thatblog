import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import createStack from './stack';

const app = new cdk.App();
createStack(app, 'thatblog');

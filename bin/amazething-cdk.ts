#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AMazeThingCdkStack } from '../lib/amazething-cdk-stack';

const app = new cdk.App();
new AMazeThingCdkStack(app, 'AMazeThingCdkStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
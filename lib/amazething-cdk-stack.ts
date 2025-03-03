import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AMazeThingService } from './amazething-service';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AMazeThingCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AmazethingCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    new AMazeThingService(this, 'AMazeThingService');
  }
}

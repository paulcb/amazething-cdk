import { Construct } from 'constructs';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket, BlockPublicAccess, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { AllowedMethods, Distribution, GeoRestriction, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';

import { Duration, Stack } from 'aws-cdk-lib';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

import path = require('path');

export class AMazeThingService extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const stackName = Stack.of(this).stackName.toLowerCase();
        const bucketName = `${stackName}-oacbucket`;
        const s3bucket = new Bucket(this, `${stackName}-Bucket`, {
            bucketName: bucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            accessControl: BucketAccessControl.PRIVATE,
            enforceSSL: true,
            versioned: true,
        });

        const nodeJsFunctionProps: NodejsFunctionProps = {
            bundling: {
                externalModules: [
                    'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
                ],
            },
            runtime: Runtime.NODEJS_18_X,
            timeout: Duration.minutes(3), // Default is 3 seconds
            memorySize: 256,
        };
        const writeS3ObjFn = new NodejsFunction(this, `${stackName}-WriteS3`, {
            entry: path.join('./lib/lambda', 's3WriteMazes.ts'),
            ...nodeJsFunctionProps,
            functionName: `${stackName.replace('-', '')}S3Write`,
            environment: {
                bucketName: s3bucket.bucketName,
            },
        });

        s3bucket.grantWrite(writeS3ObjFn);


        new BucketDeployment(this, `${stackName}-DeployFiles`, {
            sources: [Source.asset('./../mazeapp/build')],
            destinationBucket: s3bucket,
        });

        const distribution = new Distribution(this, `${stackName}-Dist`, {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessControl(s3bucket),
                compress: true,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            // geoRestriction: GeoRestriction.allowlist('US'),
        });

        const rule = new Rule(this, `${stackName}-ScheduleRule`, {
            schedule: Schedule.cron({ minute: '0', hour: '0' }),
        });

        rule.addTarget(new LambdaFunction(writeS3ObjFn));
    }
}

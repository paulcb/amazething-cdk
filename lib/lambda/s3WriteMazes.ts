import { PutObjectRequest, S3, S3ServiceException } from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import { Readable } from "stream";

import Maze from "./maze/maze"

export const handler = async (
    event: S3Event
): Promise<any> => {
    try {
        const bucketName = process.env.bucketName || '';

        const s3 = new S3();

        const maze1 = new Maze(null, 12, 8);
        maze1.init();

        const maze2 = new Maze(null, 16, 20);
        maze2.init();

        const today = new Date();
        let dateKey = `${today.toISOString().split('T')[0]}` + "_mazedata.json";
        const res = {
            mazes: [
                { date: today, mobile: maze1.mazeJsonOutput, desktop: maze2.mazeJsonOutput }
                // { date: today, mobile: null, desktop: null }
            ]
        };

        const jsonOutput = JSON.stringify(res);
        const params: PutObjectRequest = {
            Bucket: bucketName,
            Key: dateKey,
            Body: Readable.from(jsonOutput),
            ContentLength: jsonOutput.length

        };
        await s3.putObject(params);
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        // else if (error instanceof S3ServiceException) {
        //     const s3exception = error as S3ServiceException;
        //     console.log(s3exception.message);
        // }
        else{
            console.log(error);
        }
    }
};
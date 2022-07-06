import { captureAWS } from "aws-xray-sdk";
import * as AWS from "aws-sdk";

import config from './config';
const { SecretsManager, DynamoDB, S3 } = config.xrayEnabled ? captureAWS(AWS) : AWS;

export const secretsManager = new SecretsManager();
export const dynamoDb = new DynamoDB.DocumentClient();
export const s3 = new S3();

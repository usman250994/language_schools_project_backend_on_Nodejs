import * as AWS from 'aws-sdk';

import config from '../config';

AWS.config.update({
    region: config.aws.region,
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
});

export const S3 = new AWS.S3({
    endpoint: config.aws.s3Endpoint ? config.aws.s3Endpoint : undefined,
    // Only for Localstack: If you omit this, you'll have to add bucket name to
    // the 'Key' property of the object.
    // https://github.com/localstack/localstack/issues/2123
    //
    // Also read about it here:
    // https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html#path-style-access
    // https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html#virtual-hosted-style-access
    s3ForcePathStyle: config.aws.s3Endpoint ? true : false,
});

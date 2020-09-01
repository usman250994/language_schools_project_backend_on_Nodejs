import convict from 'convict';

const conf = convict({
    env: {
        format: ['development', 'staging', 'production'],
        default: 'development',
        env: 'NODE_ENV',
    },
    server: {
        port: {
            format: 'port',
            default: 3200,
            env: 'NODE_PORT',
        },
        basePath: {
            format: '*',
            default: '/',
            env: 'BASE_PATH',
        },
    },
    token: {
        auth: {
            secret: {
                format: '*',
                default: 'auth-secret',
                env: 'AUTH_TOKEN_SECRET',
            },
            expiry: {
                format: '*',
                default: '1 day',
                env: 'AUTH_TOKEN_EXPIRY',
            },
        },
    },
    database: {
        host: {
            format: '*',
            default: 'postgres',
            env: 'DB_HOST',
        },
        port: {
            format: 'port',
            default: 5432,
            env: 'DB_PORT',
        },
        name: {
            format: '*',
            default: 'postgres',
            env: 'DB_NAME',
        },
        username: {
            format: '*',
            default: 'postgres',
            env: 'DB_USERNAME',
        },
        password: {
            format: '*',
            default: 'postgres',
            env: 'DB_PASSWORD',
        },
    },
    appUrl: {
        format: '*',
        default: 'http://localhost:4200',
        env: 'APP_URL',
    },
    aws: {
        endpoint: {
            format: '*',
            default: '',
            env: 'AWS_ENDPOINT',
        },
        region: {
            format: '*',
            default: 'us-east-1',
            env: 'AWS_DEFAULT_REGION',
        },
        s3Endpoint: {
            format: '*',
            default: 'us-east-1',
            env: 'AWS_S3_ENDPOINT',
        },
        accessKeyId: {
            format: '*',
            default: '',
            env: 'AWS_ACCESS_KEY_ID',
        },
        secretAccessKey: {
            format: '*',
            default: '',
            env: 'AWS_SECRET_ACCESS_KEY',
        },
    },
    s3Buckets: {
        assignments: {
            format: '*',
            default: 'assignment',
            env: 'S3_BUCKET_ASSIGNMENT',
        },
    },
});

conf.validate({ allowed: 'strict' });

export default conf.getProperties();

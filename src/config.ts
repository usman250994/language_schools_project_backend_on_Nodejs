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
});

conf.validate({ allowed: 'strict' });

export default conf.getProperties();

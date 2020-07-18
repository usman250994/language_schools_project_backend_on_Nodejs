import Bunyan from 'bunyan';

import config from '../config';

export default new Bunyan({
    name: 'DTech-API',
    serializers: Bunyan.stdSerializers,
    streams: [{
        level: config.env !== 'production' ? 'debug' : 'info',
        stream: process.stdout,
    }],
});

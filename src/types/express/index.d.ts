import * as Logger from 'bunyan';
import { ClientUser } from 'src/models/ClientUser';
import { User } from 'src/models/User';

declare module 'express-serve-static-core' {
    interface Request {
        log: Logger;
        user?: User;
        clientUsers?: ClientUser[];
    }
}

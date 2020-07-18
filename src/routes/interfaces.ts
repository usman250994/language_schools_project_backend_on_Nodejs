import * as express from 'express';

import { User } from '../models/User';
export interface UserRequest extends express.Request {
    user: User;
}

export type Request = express.Request | UserRequest;

export function isUserReq(req: Request): req is UserRequest {
    return (req as UserRequest).user !== undefined;
}

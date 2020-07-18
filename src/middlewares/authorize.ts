import Boom from '@hapi/boom';
import express from 'express';

import { Role } from '../models/enums';
import { Request } from '../routes/interfaces';
import { verifyAuthToken } from '../services/authToken';
import { findUserByID } from '../services/users';

export function authorize(roles?: Role | Role[]): express.RequestHandler {
    if (!Array.isArray(roles)) {
        if (roles) {
            roles = [roles];
        } else {
            roles = [];
        }
    }

    return async (req: Request, res: express.Response, next: express.NextFunction): Promise<void> => {
        if (!Array.isArray(roles)) {
            if (roles) {
                roles = [roles];
            } else {
                roles = [];
            }
        }

        // token verification
        let token: string | null = null;
        const authheader = (req.headers.authorization || '').split(' ');
        if (authheader.length === 2 && authheader[0].toLowerCase() === 'bearer') {
            token = authheader[1];
        }

        if (!token) {
            return next(Boom.unauthorized('Token required'));
        }

        try {
            const claims = verifyAuthToken(token);

            const user = await findUserByID(claims.userId);

            req.user = user;
        } catch (err) {
            req.log.error({ err });

            return next(Boom.unauthorized('This token is unauthorized'));
        }

        // role checking
        if (roles.length === 0) {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            return next(Boom.forbidden());
        }

        return next();
    };
}

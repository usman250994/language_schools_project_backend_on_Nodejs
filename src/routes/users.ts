import Joi from '@hapi/joi';
import express, { Router } from 'express';

import { authorize } from '../middlewares/authorize';
import { Role } from '../models/enums';
import { getAllAdminUsers, createUser, updateUser } from '../services/users';
import { wrapAsync } from '../utils/asyncHandler';

import { Request, isUserReq } from './interfaces';

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - User
 *     summary: Get Super Admin User list
 *     security:
 *       - JWT: []
 *     parameters:
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/limit'
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *             example:
 *               total: 2
 *               data:
 *                 - id: c43a3b0d-e794-4a9c-9c12-e35c6b62de4c
 *                   email: admin@dtech.com
 *                   firstName: John
 *                   lastName: Doe
 *                   role: ADMIN
 *                   invitationAccepted: true
 *                 - id: 2efa52e2-e9fd-4bd0-88bc-0132b2e837d9
 *                   email: admin2@dtech.com
 *                   firstName: John
 *                   lastName: Doe
 *                   role: ADMIN
 *                   invitationAccepted: false
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/users', authorize([Role.ADMIN]), wrapAsync(async (req: Request, res: express.Response) => {
    const { limit, offset } = await Joi
        .object({
            offset: Joi.number().integer().default(0).failover(0).label('Offset'),
            limit: Joi.number().integer().default(10).failover(10).label('Limit'),
        })
        .validateAsync({
            offset: req.query.offset,
            limit: req.query.limit,
        });

    const [users, total] = await getAllAdminUsers('all', offset, limit);

    res.send({
        total,
        data: users.map((user) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        })),
    });
}));

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Get Current User
 *     security:
 *       - JWT: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: c43a3b0d-e794-4a9c-9c12-e35c6b62de4c
 *               email: admin@dtech.com
 *               firstName: John
 *               lastName: Doe
 *               role: ADMIN
 *               invitationAccepted: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/users/me', authorize(), wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
        throw new Error('User not found in session');
    }

    res.send({
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
    });
}));

/**
 * @swagger
 * /users/me:
 *   put:
 *     tags:
 *       - User
 *     summary: Edit current user profile
 *     security:
 *       - JWT: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               firstName:
 *                  description: First name
 *                  type: string
 *                  minimum: 1
 *                  maximum: 50
 *               lastName:
 *                  description: Last name
 *                  type: string
 *                  minimum: 1
 *                  maximum: 50
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: c43a3b0d-e794-4a9c-9c12-e35c6b62de4c
 *               email: admin@dtech.com
 *               firstName: John
 *               lastName: Doe
 *               role: ADMIN
 *               invitationAccepted: true
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/users/me', authorize(), wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
        throw new Error('User not found in session');
    }

    const user = await Joi
        .object({
            firstName: Joi.string().trim().min(1).max(50).required().label('First name'),
            lastName: Joi.string().trim().min(1).max(50).required().label('Last name'),
        })
        .validateAsync(req.body);

    const _user = await updateUser(req.user.id, user);

    res.send({
        id: _user.id,
        email: req.user.email,
        firstName: _user.firstName,
        lastName: _user.lastName,
        role: req.user.role,
    });
}));

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - User
 *     summary: Invite Super Admin User
 *     security:
 *       - JWT: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  description: User e-mail
 *                  type: string
 *                  minimum: 3
 *                  maximum: 255
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInvitation'
 *             example:
 *               id: c43a3b0d-e794-4a9c-9c12-e35c6b62de4c
 *               email: user@client.com
 *               role: CLIENT
 *               invitationAccepted: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/users', authorize([Role.ADMIN]), wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
        throw new Error('User not found in session');
    }

    const { email } = await Joi
        .object({
            email: Joi.string().trim().lowercase().email().required().label('Email'),
        })
        .validateAsync(req.body);

    const user = await createUser(email, Role.ADMIN);

    res.send({
        id: user.id,
        email: user.email,
        role: user.role,
    });
}));

export default router;

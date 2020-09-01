import Joi from '@hapi/joi';
import express, { Router } from 'express';

import { authorize } from '../middlewares/authorize';
import { Role } from '../models/enums';
import { createSchool, getAllSchools, deleteSchool, updateSchool } from '../services/school';
import { wrapAsync } from '../utils/asyncHandler';

import { Request, isUserReq } from './interfaces';

const router = Router();

/**
 * @swagger
 * /schools:
 *   get:
 *     tags:
 *       - School
 *     summary: Get Schools
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
 *                     $ref: '#/components/schemas/School'
 *             example:
 *               total: 2
 *               data:
 *                 - id: c43a3b0d-e794-4a9c-9c12-e35c6b62de4c
 *                   email: user@client.com
 *                   name: Patricks
 *                   address: California ST. 31
 *                   phone: +1241233212
 *                 - id: c43a3b0d-e794-4a9c-9c12-e35c6b62de4c
 *                   email: user@client.com
 *                   name: Patricks
 *                   address: California ST. 31
 *                   phone: +1241233212
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/schools', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
    const { limit, offset, name } = await Joi
        .object({
            offset: Joi.number().integer().default(0).failover(0).label('Offset'),
            limit: Joi.number().integer().default(10).failover(10).label('Limit'),
            name: Joi.string().allow('', null).default('').label('Name'),
        })
        .validateAsync({
            offset: req.query.offset,
            limit: req.query.limit,
            name: req.query.name,
        });

    const [schools, total] = await getAllSchools(offset, limit, name);

    res.send({
        total,
        data: schools,
    });
}));

/**
 * @swagger
 * /schools:
 *   post:
 *     tags:
 *       - School
 *     summary: Create School
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
 *                  description: School general e-mail
 *                  type: string
 *                  minimum: 3
 *                  maximum: 255
 *                name:
 *                  description: School name
 *                  type: string
 *                  minimum: 3
 *                  maximum: 255
 *                address:
 *                  description: School address
 *                  type: string
 *                  minimum: 3
 *                  maximum: 255
 *                phone:
 *                  description: School phone number
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
 *               $ref: '#/components/schemas/School'
 *             example:
 *               id: c43a3b0d-e794-4a9c-9c12-e35c6b62de4c
 *               email: user@client.com
 *               name: Patricks
 *               address: California ST. 31
 *               phone: +1241233212
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */

router.post('/schools', authorize([Role.ADMIN]), wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
        throw new Error('User not found in session');
    }

    const { email, name, address, phone } = await Joi
        .object({
            email: Joi.string().trim().lowercase().email().required().label('Email'),
            name: Joi.string().trim().min(1).max(50).required().label('Name'),
            address: Joi.string().trim().min(1).max(50).required().label('Address'),
            phone: Joi.string().trim().min(1).max(50).required().label('Phone'),
        })
        .validateAsync(req.body);

    const school = await createSchool(email, name, address, phone);

    res.send({
        id: school.id,
        email: school.name,
        address: school.address,
        phone: school.phone,
    });
}));

/**
 * @swagger
 * /schools:
 *   put:
 *     tags:
 *       - School
 *     summary: Update School
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
 *                  description: School general e-mail
 *                  type: string
 *                  minimum: 3
 *                  maximum: 255
 *                name:
 *                  description: School name
 *                  type: string
 *                  minimum: 3
 *                  maximum: 255
 *                address:
 *                  description: School address
 *                  type: string
 *                  minimum: 3
 *                  maximum: 255
 *                phone:
 *                  description: School phone number
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
 *               $ref: '#/components/schemas/School'
 *             example:
 *               id: c43a3b0d-e794-4a9c-9c12-e35c6b62de4c
 *               email: user@client.com
 *               name: Patricks
 *               address: California ST. 31
 *               phone: +1241233212
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */

router.put('/schools/:schoolId', authorize([Role.ADMIN]), wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
        throw new Error('User not found in session');
    }

    const { schoolId, email, name, address, phone } = await Joi
        .object({
            schoolId: Joi.string().uuid().required().label('School ID'),
            email: Joi.string().trim().lowercase().email().required().label('Email'),
            name: Joi.string().trim().min(1).max(50).required().label('Name'),
            address: Joi.string().trim().min(1).max(50).required().label('Address'),
            phone: Joi.string().trim().min(1).max(50).required().label('Phone'),
        })
        .validateAsync({
            schoolId: req.params.schoolId,
            ...req.body,
        });

    const school = await updateSchool(schoolId, { email, name, address, phone });

    res.send({
        id: school.id,
        email: school.name,
        address: school.address,
        phone: school.phone,
    });
}));

/**
 * @swagger
 * /schools/{schoolId}:
 *   delete:
 *     tags:
 *       - ClassRoom
 *     summary: Delete a School
 *     security:
 *       - JWT: []
 *     parameters:
 *       - $ref: '#/components/parameters/clientId'
 *       - $ref: '#/components/parameters/tagId'
 *     produces:
 *       - application/json
 *     responses:
 *       204:
 *         $ref: '#/components/responses/NoContentResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/schools/:schoolId', authorize([Role.ADMIN]), wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
        throw new Error('User not found in session');
    }

    const { schoolId } = await Joi
        .object({
            schoolId: Joi.string().uuid().required().label('School ID'),
        })
        .validateAsync({
            schoolId: req.params.schoolId,
        });

    await deleteSchool(schoolId);

    res.status(204).send();
}));

export default router;

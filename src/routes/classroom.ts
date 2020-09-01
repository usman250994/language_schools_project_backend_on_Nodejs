import Joi from '@hapi/joi';
import express, { Router } from 'express';
import fileUpload from 'express-fileupload';

import config from '../config';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/enums';
import { createClassroom, deleteClassroom, getClassroomByUserId, addClassInUser, getClassrooms, getAllClassroomBySchoolId, deleteClassroomFromUser, addAssignmentsInClass, getAssignmentsInClass } from '../services/classroom';
import { wrapAsync } from '../utils/asyncHandler';

import { S3 } from './../utils/aws';
import { Request, isUserReq } from './interfaces';

const router = Router();

/**
 * @swagger
 * /classrooms/{schoolId}:
 *   post:
 *     tags:
 *       - ClassRoom
 *     summary: Create Class Room
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

router.post('/classrooms/schools/:schoolId', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
        throw new Error('User not found in session');
    }

    const { schoolId, name, section } = await Joi
        .object({
            schoolId: Joi.string().uuid().required().label('School ID'),
            name: Joi.string().trim().min(1).max(50).required().label('Name'),
            section: Joi.string().trim().min(1).max(50).required().label('Section'),
        })
        .validateAsync({
            ...req.body,
            schoolId: req.params.schoolId,
        });

    const classRoom = await createClassroom(schoolId, name, section);

    res.send(classRoom);
}));

/**
 * @swagger
 * /classrooms/{classRoomId}:
 *   delete:
 *     tags:
 *       - ClassRoom
 *     summary: Get Class Rooms
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
router.get('/classrooms/users/:userId', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
        throw new Error('User not found in session');
    }

    const { offset, limit, userId } = await Joi
        .object({
            offset: Joi.number().integer().default(0).failover(0).label('Offset'),
            limit: Joi.number().integer().default(10).failover(10).label('Limit'),
            userId: Joi.string().label('User Id'),

        })
        .validateAsync({
            offset: req.query.offset,
            limit: req.query.limit,
            userId: req.params.userId,
        });

    const [classrooms, total] = await getClassroomByUserId(userId, offset, limit);

    res.send({
        total,
        data: classrooms,
    });
}));

router.get('/classrooms', authorize([Role.ADMIN]), wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
        throw new Error('User not found in session');
    }

    const { offset, limit } = await Joi
        .object({
            offset: Joi.number().integer().default(0).failover(0).label('Offset'),
            limit: Joi.number().integer().default(10).failover(10).label('Limit'),
        })
        .validateAsync({
            offset: req.query.offset,
            limit: req.query.limit,
        });

    const [classrooms, total] = await getClassrooms(offset, limit);

    res.send({
        total,
        data: classrooms,
    });
}));

router.get('/classrooms/schools/:schoolId', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
    const { schoolId, limit, offset, name } = await Joi
        .object({
            offset: Joi.number().integer().default(0).failover(0).label('Offset'),
            limit: Joi.number().integer().default(10).failover(10).label('Limit'),
            name: Joi.string().allow('', null).default('').label('Name'),
            schoolId: Joi.string().label('School ID'),
        })
        .validateAsync({
            schoolId: req.params.schoolId,
            offset: req.query.offset,
            limit: req.query.limit,
            name: req.query.name,
        });

    const [schools, total] = await getAllClassroomBySchoolId(schoolId, offset, limit, name);

    res.send({
        total,
        data: schools,
    });
}));

router.post('/classrooms/:classRoomId/users/:userId', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
        throw new Error('User not found in session');
    }

    const { classRoomId, userId } = await Joi
        .object({
            classRoomId: Joi.string().label('Class Room Id'),
            userId: Joi.string().label('User Id'),
        })
        .validateAsync({
            classRoomId: req.params.classRoomId,
            userId: req.params.userId,
        });

    await addClassInUser(classRoomId, userId);

    res.status(204).send();
}));

/**
 * @swagger
 * /classrooms/{classRoomId}:
 *   delete:
 *     tags:
 *       - ClassRoom
 *     summary: Delete a Class Room
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
router.delete('/classrooms/:classRoomId', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
        throw new Error('User not found in session');
    }

    const { classRoomId } = await Joi
        .object({
            classRoomId: Joi.string().uuid().required().label('Class Room ID'),
        })
        .validateAsync({
            classRoomId: req.params.classRoomId,
        });

    await deleteClassroom(classRoomId);

    res.status(204).send();
}));
router.delete('/classrooms/:classroomId/users/:userId', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
        throw new Error('User not found in session');
    }

    const { classRoomId, userId } = await Joi
        .object({
            classRoomId: Joi.string().uuid().required().label('Class Room ID'),
            userId: Joi.string().uuid().required().label('User ID'),
        })
        .validateAsync({
            classRoomId: req.params.classRoomId,
            userId: req.params.userId,
        });

    await deleteClassroomFromUser(classRoomId, userId);

    res.status(204).send();
}));

router.use(fileUpload({
    debug: true,
}));

router.post('/classrooms/:classroomId/assignments', authorize([Role.ADMIN, Role.TEACHER]), wrapAsync(async (req: any, res: express.Response) => {
    const { classroomId } = await Joi
        .object({
            classroomId: Joi.string().uuid().required().label('Class Room ID'),
        })
        .validateAsync({
            classroomId: req.params.classroomId,
        });

    let fileData = (req as any).files.files as fileUpload.UploadedFile[] | fileUpload.UploadedFile;

    if (!Array.isArray(fileData)) {
        fileData = [fileData];
    }

    const filePromises = fileData.map((file) => {
        return S3.upload({
            Bucket: config.s3Buckets.assignments,
            Key: file.name,
            Body: file.data,
            ContentType: (file as any).type,
            ServerSideEncryption: 'AES256',
            ContentDisposition: `attachment; filename=${file.name}`,
        }).promise();
    });

    const uploadedfiles = await Promise.all(filePromises);

    const assignments = await addAssignmentsInClass(uploadedfiles, classroomId);

    res.send(assignments);
}));

router.get('/classrooms/:classroomId/assignments', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: any, res: express.Response) => {
    const { classroomId, offset, limit } = await Joi
        .object({
            offset: Joi.number().integer().default(0).failover(0).label('Offset'),
            limit: Joi.number().integer().default(10).failover(10).label('Limit'),
            classroomId: Joi.string().uuid().required().label('Class Room ID'),
        })
        .validateAsync({
            offset: req.query.offset,
            limit: req.query.limit,
            classroomId: req.params.classroomId,
        });

    const [assignments, total] = await getAssignmentsInClass(classroomId, offset, limit);

    res.send({
        total,
        data: assignments,
    });
}));

export default router;

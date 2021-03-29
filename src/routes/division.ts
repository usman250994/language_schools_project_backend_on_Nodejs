import Joi from '@hapi/joi';
import express, { Router } from 'express';

import { authorize } from '../middlewares/authorize';
import { Role } from '../models/enums';
import { addDivisionInClassroom, createDivision, getAllDivisions, getAllDivisionsByClassroom } from '../services/division';
import { wrapAsync } from '../utils/asyncHandler';

import { Request } from './interfaces';

const router = Router();

router.get('/divisions', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
    const { limit, offset, name } = await Joi
        .object({
            offset: Joi.number().integer().default(0).failover(0).label('Offset'),
            limit: Joi.number().integer().default(10).failover(10).label('Limit'),
            name: Joi.string().label('Name').allow('', null),
        })
        .validateAsync({
            offset: req.query.offset,
            limit: req.query.limit,
            name: req.query.name,
        });

    const [divisions, total] = await getAllDivisions(offset, limit, name);

    res.send({
        total,
        data: divisions,
    });
}));

router.get('/divisions/classroom/:classroomId', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
    const { limit, offset, name, classroomId } = await Joi
        .object({
            offset: Joi.number().integer().default(0).failover(0).label('Offset'),
            limit: Joi.number().integer().default(10).failover(10).label('Limit'),
            name: Joi.string().label('Name').allow('', null),
            classroomId: Joi.string().label('Classroom ID'),
        })
        .validateAsync({
            offset: req.query.offset,
            limit: req.query.limit,
            name: req.query.name,
            classroomId: req.params.classroomId,
        });

    const [divisions, total] = await getAllDivisionsByClassroom(offset, limit, name, classroomId);

    res.send({
        total,
        data: divisions,
    });
}));

router.post('/divisions', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
    const { name, amount, startDate, endDate, startTime, endTime, day } = await Joi
        .object({
            name: Joi.string().trim().min(1).max(50).required().label('Name'),
            amount: Joi.number().integer().required().label('Amount'),
            startDate: Joi.string().required().label('startDate').allow('', null),
            endDate: Joi.string().required().label('endDate').allow('', null),
            startTime: Joi.string().required().label('startTime').allow('', null),
            endTime: Joi.string().required().label('endTime').allow('', null),
            day: Joi.string().required().label('day').allow('', null),
        })
        .validateAsync(req.body);

    const division = await createDivision({ name, amount, startDate, endDate, startTime, endTime, day });

    res.send({
        data: division,
    });
}));

router.put('/divisions/classroom', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
    const { classroomId, divisionId } = await Joi
        .object({
            classroomId: Joi.string().label('Classroom ID'),
            divisionId: Joi.string().label('Division ID'),
        })
        .validateAsync(req.body);

    const division = await addDivisionInClassroom({ classroomId, divisionId });

    res.send({
        data: division,
    });
}));

export default router;

import Joi from '@hapi/joi';
import express, { Router } from 'express';

import { authorize } from '../middlewares/authorize';
import { Role } from '../models/enums';
import { getAttendance, markClassAttendance } from '../services/attendance';
import { wrapAsync } from '../utils/asyncHandler';

import { Request, isUserReq } from './interfaces';

const router = Router();

router.post('/attendance/classroom/:classroomId/divisionId/:divisionId/', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
  if (!isUserReq(req)) {
    throw new Error('User not found in session');
  }

  const { attendanceStatuses, classroomId, divisionId } = await Joi.object({
    attendanceStatuses: Joi.array().items({
      studentId: Joi.string().required().label('Student Id'),

      divisionId: Joi.string().trim().min(1).max(50).required().label('divisionId'),
      status: Joi.string().trim().min(1).max(50).required().label('Status'),

      attendanceDate: Joi.string().trim().min(1).max(50).required().label('Date'),
    }),
    classroomId: Joi.string().trim().min(1).max(50).required().label('classroomId'),
  }).validateAsync({
    classroomId: req.params.classroomId,
    divisionId: req.params.divisionId,
    ...req.body,
  });

  const attendance = await markClassAttendance(classroomId, divisionId, attendanceStatuses);

  res.send(attendance);
}));

router.get('/attendance/classroom/:classroomId/divisionId/:divisionId', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
  if (!isUserReq(req)) {
    throw new Error('User not found in session');
  }

  const { students, classroomId, divisionId } = await Joi
    .object({
      classroomId: Joi.string().trim().min(1).max(50).required().label('classroomId'),
      divisionId: Joi.string().trim().min(1).max(50).required().label('divisionId'),
    })
    .validateAsync({
      classroomId: req.params.classroomId,
      divisionId: req.params.divisionId,
    });

  const attendance = await getAttendance(classroomId, divisionId);

  res.send(attendance);
}));

// router.put('/attendance', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
//     if (!isUserReq(req)) {
//         throw new Error('User not found in session');
//     }

//     const { schoolId, email, name, address, phone } = await Joi
//         .object({
//             schoolId: Joi.string().uuid().required().label('School ID'),
//             email: Joi.string().trim().lowercase().email().required().label('Email'),
//             name: Joi.string().trim().min(1).max(50).required().label('Name'),
//             address: Joi.string().trim().min(1).max(50).required().label('Address'),
//             phone: Joi.string().trim().min(1).max(50).required().label('Phone'),
//         })
//         .validateAsync({
//             schoolId: req.params.schoolId,
//             ...req.body,
//         });

//     const school = await updateSchool(schoolId, { email, name, address, phone });

//     res.send({
//         id: school.id,
//         email: school.name,
//         address: school.address,
//         phone: school.phone,
//     });
// }));

// router.get('/attendance', authorize([Role.ADMIN, Role.TEACHER, Role.PARENT]), wrapAsync(async (req: Request, res: express.Response) => {
//     const { limit, offset, name } = await Joi
//         .object({
//             offset: Joi.number().integer().default(0).failover(0).label('Offset'),
//             limit: Joi.number().integer().default(10).failover(10).label('Limit'),
//             name: Joi.string().allow('', null).default('').label('Name'),
//         })
//         .validateAsync({
//             offset: req.query.offset,
//             limit: req.query.limit,
//             name: req.query.name,
//         });

//     const [schools, total] = await getAllSchools(offset, limit, name);

//     res.send({
//         total,
//         data: schools,
//     });
// }));

export default router;

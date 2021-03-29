import Joi from '@hapi/joi';
import bcrypt from 'bcrypt';
import express, { Router } from 'express';

import { authorize } from '../middlewares/authorize';
import { Role } from '../models/enums';
import { createUser, updateUser, getUsersByType, deleteUser, findUserByID, addStudentInParent, getStudentsByParent, getAllByTypeAndKeyword, createStudent, getStudentInfo, updateStudent, searchStudent } from '../services/users';
import { wrapAsync } from '../utils/asyncHandler';

import { Request, isUserReq } from './interfaces';

const router = Router();

//swager documentation needs to be added here

router.get(
  '/users/:role/byKeyword',
  authorize([Role.ADMIN]),
  wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
      throw new Error('User not found in session');
    }
    const { limit, offset, role, keyword } = await Joi.object({
      offset: Joi.number().integer().default(0).failover(0).label('Offset'),
      limit: Joi.number().integer().default(10).failover(10).label('Limit'),
      role:
        req.user.role === Role.SUPER_ADMIN
          ? Joi.string().valid(Role.ADMIN).required().label('User role')
          : Joi.string()
            .valid(Role.TEACHER, Role.PARENT, Role.STUDENT)
            .required()
            .label('User role'),
      keyword: Joi.string().allow('', null).default('').label('Keyword'),
    }).validateAsync({
      offset: req.query.offset,
      limit: req.query.limit,
      keyword: req.query.keyword,
      role: req.params.role,
    });
    const [users, total] = await getAllByTypeAndKeyword(
      role,
      offset,
      limit,
      keyword
    );

    const dataParsed = users.map((user) => ({
      id: user.id,
      name: user.firstName + ' ' + user.lastName,
      firstName: user.firstName,
      lastName: user.lastName,
    }));

    res.send({
      total,
      data: dataParsed,
    });
  })
);
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
router.get(
  '/users/:role',
  authorize([Role.ADMIN]),
  wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
      throw new Error('User not found in session');
    }
    const { limit, offset, role, keyword } = await Joi.object({
      offset: Joi.number().integer().default(0).failover(0).label('Offset'),
      limit: Joi.number().integer().default(10).failover(10).label('Limit'),
      keyword: Joi.string().trim().min(0).max(50).label('Keyword').allow('', null),
      role:
        req.user.role === Role.SUPER_ADMIN
          ? Joi.string().valid(Role.ADMIN).required().label('User role')
          : Joi.string()
            .valid(Role.TEACHER, Role.PARENT, Role.STUDENT)
            .required()
            .label('User role'),
    }).validateAsync({
      offset: req.query.offset,
      limit: req.query.limit,
      role: req.params.role,
      keyword: req.query.keyword,
    });

    console.log({ keyword });

    const [users, total] = await getUsersByType(role, offset, limit, keyword);

    res.send({
      total,
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        dob: user.DOB,
      })),
    });
  })
);

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
router.get(
  '/users/me',
  authorize(),
  wrapAsync(async (req: Request, res: express.Response) => {
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
  })
);

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
router.put(
  '/users/me',
  authorize(),
  wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
      throw new Error('User not found in session');
    }

    const user = await Joi.object({
      firstName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .label('First name'),
      lastName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .label('Last name'),
    }).validateAsync(req.body);

    const _user = await updateUser(req.user.id, user);

    res.send({
      id: _user.id,
      email: req.user.email,
      firstName: _user.firstName,
      lastName: _user.lastName,
      role: req.user.role,
    });
  })
);

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create Admin
 *     security:
 *       - JWT: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              type: object
 *              properties:
 *                firstName:
 *                  description: Admin first name
 *                  type: string
 *                  minimum: 3
 *                  maximum: 255
 *                lastName:
 *                  description: Admin last name
 *                  type: string
 *                  minimum: 3
 *                  maximum: 255
 *                email:
 *                  description: User e-mail
 *                  type: string
 *                  minimum: 3
 *                  maximum: 255
 *                password:
 *                  description: Admin password
 *                  type: string
 *                  minimum: 3
 *                  maximum: 255
 *                role:
 *                  description: Admin role
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
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: c43a3b0d-e794-4a9c-9c12-e35c6b62de4c
 *               firstName: John
 *               lastName: Doe
 *               email: user@client.com
 *               role: Admin
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post(
  '/users',
  authorize([Role.SUPER_ADMIN, Role.ADMIN]),
  wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
      throw new Error('User not found in session');
    }

    const { firstName, lastName, email, password, role } = await Joi.object({
      firstName: Joi.string().trim().min(1).max(50).required().label('First name'),
      lastName: Joi.string().trim().min(1).max(50).required().label('Last name'),
      email: Joi.string().trim().lowercase().email().required().label('Email'),
      password: Joi.string().trim().min(1).max(50).required().label('Password'),
      role: req.user.role === Role.SUPER_ADMIN ? Joi.string().valid(Role.ADMIN).required().label('User role') : Joi.string().valid(Role.TEACHER, Role.PARENT).required().label('User role'),
    }).validateAsync(req.body);

    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await createUser(
      firstName,
      lastName,
      email,
      hashedPassword,
      role
    );

    res.send({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  })
);

/**
 * @swagger
 * /user/{userId}:
 *   delete:
 *     tags:
 *       - User
 *     summary: Delete a User
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
router.delete(
  '/users/:userId',
  authorize([Role.ADMIN]),
  wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
      throw new Error('User not found in session');
    }

    const { userId } = await Joi.object({
      userId: Joi.string().uuid().required().label('User ID'),
    }).validateAsync({
      userId: req.params.userId,
    });

    await deleteUser(userId);

    res.status(204).send();
  })
);

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
router.put(
  '/users/:userId',
  authorize(),
  wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
      throw new Error('User not found in session');
    }

    const { userId, firstName, lastName, email } = await Joi.object({
      userId: Joi.string().uuid().required().label('User ID'),
      firstName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .label('First name'),
      lastName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .label('Last name'),
      email: Joi.string().trim().lowercase().email().required().label('Email'),
    }).validateAsync({
      userId: req.params.userId,
      ...req.body,
    });

    const _user = await updateUser(userId, { firstName, lastName, email });

    res.send({
      id: _user.id,
      email: req.user.email,
      firstName: _user.firstName,
      lastName: _user.lastName,
      role: req.user.role,
    });
  })
);

router.post(
  '/students/parent/:parentId',
  authorize([Role.SUPER_ADMIN, Role.ADMIN]),
  wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
      throw new Error('User not found in session');
    }

    const {
      firstName,
      lastName,
      email,
      password,
      role,
      parentId,
    } = await Joi.object({
      firstName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .label('First name'),
      lastName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .label('Last name'),
      email: Joi.string().trim().lowercase().email().required().label('Email'),
      password: Joi.string().trim().min(1).max(50).required().label('Password'),
      role:
        req.user.role === Role.SUPER_ADMIN
          ? Joi.string().valid(Role.ADMIN).required().label('User role')
          : Joi.string()
            .valid(Role.TEACHER, Role.PARENT, Role.STUDENT)
            .required()
            .label('User role'),
      parentId: Joi.string().uuid().required().label('Parent ID'),
    }).validateAsync({
      ...req.body,
      parentId: req.params.parentId,
    });

    const hashedPassword = await bcrypt.hash(password, 8);

    const parent = await findUserByID(parentId);

    const student = await createUser(
      firstName,
      lastName,
      email,
      hashedPassword,
      role
    );

    await addStudentInParent(student, parent);

    res.send({
      id: student.id,
      email: student.email,
      role: student.role,
    });
  })
);

router.get(
  '/students/parent/:parentId',
  authorize([Role.SUPER_ADMIN, Role.ADMIN]),
  wrapAsync(async (req: Request, res: express.Response) => {
    if (!isUserReq(req)) {
      throw new Error('User not found in session');
    }

    const { offset, limit, parentId } = await Joi.object({
      offset: Joi.number().integer().default(0).failover(0).label('Offset'),
      limit: Joi.number().integer().default(10).failover(10).label('Limit'),
      parentId: Joi.string().uuid().required().label('Parent ID'),
    }).validateAsync({
      offset: req.query.offset,
      limit: req.query.limit,
      parentId: req.params.parentId,
    });

    const [users, total] = await getStudentsByParent(parentId, offset, limit);

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
  })
);

router.post('/students', authorize([Role.SUPER_ADMIN, Role.ADMIN]), wrapAsync(async (req: Request, res: express.Response) => {
  if (!isUserReq(req)) {
    throw new Error('User not found in session');
  }

  const { firstName, lastName, email, password, classRoomId, divisionId, parentId } = await Joi.object({
    firstName: Joi.string().trim().min(1).max(50).required().label('First name'),
    lastName: Joi.string().trim().min(1).max(50).required().label('Last name'),
    email: Joi.string().trim().lowercase().email().label('Email').allow('', null),
    password: Joi.string().trim().min(0).max(50).label('Password').allow('', null),
    classRoomId: Joi.string().uuid().label('Class ID').allow('', null),
    divisionId: Joi.string().label('Division ID'),
    parentId: Joi.string().uuid().label('Parent ID').allow('', null),
  }).validateAsync(req.body);

  const hashedPassword = await bcrypt.hash(password, 8);

  const _user = await createStudent({ firstName, lastName, email, hashedPassword }, { classRoomId, parentId, divisionId });

  res.send({
    id: _user.id,
    email: req.user.email,
    firstName: _user.firstName,
    lastName: _user.lastName,
    role: req.user.role,
  });
}));

router.put('/students/:studentId', authorize([Role.SUPER_ADMIN, Role.ADMIN]), wrapAsync(async (req: Request, res: express.Response) => {
  if (!isUserReq(req)) {
    throw new Error('User not found in session');
  }

  console.log('here here:::');

  const { firstName, lastName, email, password, classRoomId, divisionId, parentId, studentId } = await Joi.object({
    firstName: Joi.string().trim().min(1).max(50).required().label('First name').allow('', null),
    lastName: Joi.string().trim().min(1).max(50).required().label('Last name').allow('', null),
    email: Joi.string().trim().lowercase().email().label('Email').allow('', null),
    password: Joi.string().trim().max(50).label('Password').allow('', null),
    classRoomId: Joi.string().uuid().label('Class ID').allow('', null),
    divisionId: Joi.string().label('Division ID'),
    parentId: Joi.string().uuid().label('Parent ID').allow('', null),
    studentId: Joi.string().uuid().label('Student ID').allow('', null),
  }).validateAsync({
    studentId: req.params.studentId,
    ...req.body,
  });

  const hashedPassword = await bcrypt.hash(password, 8);

  const _user = await updateStudent({ firstName, lastName, email, hashedPassword }, { classRoomId, parentId, divisionId }, studentId);

  res.send({
    id: _user.id,
    email: req.user.email,
    firstName: _user.firstName,
    lastName: _user.lastName,
    role: req.user.role,
  });
}));

router.get('/students/:studentId', authorize([Role.SUPER_ADMIN, Role.ADMIN]), wrapAsync(async (req: Request, res: express.Response) => {
  if (!isUserReq(req)) {
    throw new Error('User not found in session');
  }

  const { studentId } = await Joi.object({
    studentId: Joi.string().uuid().required().label('Student ID'),
  }).validateAsync({
    studentId: req.params.studentId,
  });

  const _user = await getStudentInfo(studentId);

  if (!_user) {
    throw new Error('User not found');
  }

  const { hashedPassword, ...restUser } = _user;

  res.send({ ...restUser });
}));

router.post('/students/search', authorize([Role.SUPER_ADMIN, Role.ADMIN]), wrapAsync(async (req: Request, res: express.Response) => {
  if (!isUserReq(req)) {
    throw new Error('User not found in session');
  }

  const { limit, offset, keyword } = await Joi.object({
    offset: Joi.number().integer().default(0).failover(0).label('Offset'),
    limit: Joi.number().integer().default(10).failover(10).label('Limit'),
    keyword: Joi.string().label('Keyword').allow('', null),
  }).validateAsync({
    offset: req.query.offset,
    limit: req.query.limit,
    ...req.body,
  });

  const [users, total] = await searchStudent({ keyword }, limit, offset);

  res.send({
    total,
    data: users,
  });
}));

export default router;

import Boom from '@hapi/boom';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { User } from 'src/models/User';

import { Classroom } from '../models/Classroom';
import { Division } from '../models/Division';
import { Days, TimeTable } from '../models/TimeTable';
import AssignmentRepo from '../repositories/assignment';
import ClassroomRepo from '../repositories/classroom';
import DivisionRepo from '../repositories/division';
import TimeTableRepo from '../repositories/timetable';

import { Assignment } from './../models/Assignment';
import { findDivisionById, findDivisionByProperty } from './division';
import { findSchoolByProperty } from './school';
import { findUserByID } from './users';

type classRoomInfo = { name: string; section: string; startDate: string; endDate: string; startTime: string; endTime: string; day: Days }

export async function checkIfDivisionAlreadyExistInClassroom(division: Division, classroom: Classroom): Promise<void> {
    const relation = await DivisionRepo.findClassByDivision(division, classroom);

    if (relation) {
        throw Boom.conflict('Division Already exist in classroom');
    }
}

export async function createClassroom(schoolId: string, divisionId: string, data: Partial<classRoomInfo>): Promise<Classroom> {
    const school = await findSchoolByProperty({ id: schoolId });
    const division = await findDivisionByProperty({ id: divisionId });

    const { name, section } = data;

    const {
        startDate,
        endDate,
        startTime,
        endTime,
        day,
    } = division;

    const classroom = await ClassroomRepo.create(school, division, name || '', section || '');

    await DivisionRepo.addDivisionInClassroom(division, classroom);

    await TimeTableRepo.create(classroom, {
        startDate,
        endDate,
        startTime,
        endTime,
        day,
    });

    return classroom;
}

export async function findClassroomById(id: string): Promise<Classroom> {
    const classroom = await ClassroomRepo.findByProp({ id });

    if (!classroom) {
        throw Boom.notFound('Classroom doesn\'t exist');
    }

    return classroom;
}

export async function updateClassroom(schoolId: string, classroomId: string, divisionId: string, data: Partial<classRoomInfo>): Promise<Classroom> {
    const classroom = await findClassroomById(classroomId);
    const division = await findDivisionByProperty({ id: divisionId });

    await checkIfDivisionAlreadyExistInClassroom(division, classroom);

    const { name, section } = data;

    const updatedClassroom = await ClassroomRepo.update(classroom.id, { name, section });

    await DivisionRepo.addDivisionInClassroom(division, updatedClassroom);

    const {
        startDate,
        endDate,
        startTime,
        endTime,
        day,
    } = division;

    await TimeTableRepo.create(classroom, {
        startDate,
        endDate,
        startTime,
        endTime,
        day,
    });

    return classroom;
}

export async function findClassroomByProperty(
    property: Partial<Classroom>
): Promise<Classroom> {
    const classRoom = await ClassroomRepo.findByProp(property);
    if (!classRoom) {
        throw new Error('Classroom not found');
    }

    return classRoom;
}

export async function deleteClassroom(id: string): Promise<void> {
    await findClassroomByProperty({ id });

    return ClassroomRepo.remove(id);
}

export async function deleteClassroomFromUser(
    id: string,
    userId: string
): Promise<void> {
    await findClassroomByProperty({ id });
    await findUserByID(userId);

    return ClassroomRepo.removeFromUser(id, userId);
}

export async function getClassroomByUserId(
    userId: string,
    offset: number,
    limit: number
): Promise<[Classroom[], number]> {
    const user = await findUserByID(userId);

    return ClassroomRepo.findByUserId(user.id, offset, limit);
}

export async function getClassrooms(
    offset: number,
    limit: number
): Promise<[Classroom[], number]> {
    return ClassroomRepo.getAll(offset, limit);
}

export async function getAllClassroomBySchoolId(
    schoolId: string,
    offset: number,
    limit: number,
    name = ''
): Promise<[Classroom[], number]> {
    await findSchoolByProperty({ id: schoolId });

    return ClassroomRepo.getAllBySchoolId(schoolId, offset, limit, name);
}

export async function addClassInUser(
    classRoomId: string,
    userId: string,
    divisionId: string,
): Promise<void> {
    const user = await findUserByID(userId);
    const classroom = await findClassroomByProperty({ id: classRoomId });

    const userClassRoom = await ClassroomRepo.getAUserClassroom(classroom, user);

    if (userClassRoom) {
        throw new Error('This classroom already exist in this user');
    }

    const division = await findDivisionById(divisionId);

    return ClassroomRepo.addToUser(classroom, division, user);
}

export async function addAssignmentsInClass(
    filesData: ManagedUpload.SendData[],
    classId: string
): Promise<Assignment[]> {
    return Promise.all(
        filesData.map((fileData) =>
            AssignmentRepo.addInClass(fileData.Key, classId)
        )
    );
}

export async function getAssignmentsInClass(
    classId: string,
    offset: number,
    limit: number
): Promise<[Assignment[], number]> {
    return AssignmentRepo.getClass(classId, offset, limit);
}

export async function getUsersByRoleAndClass(
    role: string,
    classId: string,
    offset: number,
    limit: number
): Promise<[User[], number]> {
    return ClassroomRepo.getUsersByRoleAndClass(role, classId, offset, limit);
}

export async function getStudentsAttendanceByClass(
    classId: string,
    offset: number,
    limit: number
): Promise<[User[], number]> {
    return ClassroomRepo.getStudentsAttendanceByClass(classId, offset, limit);
}

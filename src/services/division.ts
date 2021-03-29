import Boom from '@hapi/boom';

import { Division } from '../models/Division';
import DivisionsRepo from '../repositories/division';

import { checkIfDivisionAlreadyExistInClassroom, findClassroomById } from './classroom';

export async function getAllDivisions(offset: number, limit: number, name = ''): Promise<[Division[], number]> {
    return DivisionsRepo.getAll(offset, limit, name);
}

export async function findDivisionById(id: string): Promise<Division> {
    const division = await DivisionsRepo.findByProp({ id });

    if (!division) {
        throw Boom.notFound('Division doesn\'t exist');
    }

    return division;
}

export async function getAllDivisionsByClassroom(offset: number, limit: number, name = '', classroomId = ''): Promise<[Division[], number]> {
    return DivisionsRepo.getAllByClassroom(offset, limit, name, classroomId);
}

export async function createDivision(division: Partial<Division>): Promise<Division> {
    return DivisionsRepo.create(division);
}

export async function addDivisionInClassroom({ classroomId, divisionId }: { classroomId: string; divisionId: string }): Promise<void> {
    const classroom = await findClassroomById(classroomId);
    const division = await findDivisionById(divisionId);

    await checkIfDivisionAlreadyExistInClassroom(division, classroom);

    await DivisionsRepo.addDivisionInClassroom(division, classroom);
}

export async function findDivisionByProperty(property: Partial<Division>): Promise<Division> {
    const division = await DivisionsRepo.findByProp(property);
    if (!division) {
        throw new Error('Division not found');
    }

    return division;
}

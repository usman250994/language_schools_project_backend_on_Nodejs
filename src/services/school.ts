import Boom from '@hapi/boom';

import SchoolRepo from '../repositories/school';

import { School } from './../models/School';

export async function findSchoolByProperty(property: Partial<School>): Promise<School> {
    const school = await SchoolRepo.findByProp(property);
    if (!school) {
        throw new Error('School not found');
    }

    return school;
}

export async function createSchool(email: string, name: string, address: string, phone: string): Promise<School> {
    const school = await findSchoolByProperty({ name }).catch(() => null);
    if (school) {
        throw Boom.conflict('School with this name already exist');
    }

    return SchoolRepo.create(email, name, address, phone);
}

export async function updateSchool(id: string, props: Partial<School>): Promise<School> {
    const school = await findSchoolByProperty({ id });

    return SchoolRepo.update(school.id, props);
}

export async function getAllSchools(offset: number, limit: number, name = ''): Promise<[School[], number]> {
    return SchoolRepo.getAll(offset, limit, name);
}

export async function deleteSchool(id: string): Promise<void> {
    await findSchoolByProperty({ id });

    return SchoolRepo.remove(id);
}

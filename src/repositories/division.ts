import { getConnection, Repository } from 'typeorm';

import { Division } from '../models/Division';
import { DivisionClassroom } from '../models/DivisionClassroom';

import { Classroom } from './../models/Classroom';

class DivisionRepo {
    private repo: Repository<Division>;
    private divisionClassroomRepo: Repository<DivisionClassroom>;

    constructor() {
        this.repo = getConnection().getRepository(Division);
        this.divisionClassroomRepo = getConnection().getRepository(DivisionClassroom);
    }

    async getAll(offset: number, limit: number, name = ''): Promise<[Division[], number]> {
        const query = this.repo.createQueryBuilder('division').take(limit);
        if (name) {
            query.where('name ILIKE :name', { name: `%${name}%` });
        }

        return query.skip(offset).getManyAndCount();
    }

    async getAllByClassroom(offset: number, limit: number, name = '', classroomId: string): Promise<[Division[], number]> {
        const query = this.repo.createQueryBuilder('division').take(limit);
        if (name) {
            query.where('name ILIKE :name', { name: `%${name}%` });
        }

        return query.leftJoinAndSelect('division_classroom', 'division_classroom', 'division_classroom.divisionId = division.id')
            .where('division_classroom.classroomId = :classroomId', { classroomId })
            .skip(offset).getManyAndCount();
    }

    async create(division: Partial<Division>): Promise<Division> {
        const mod = this.repo.create(division);

        return this.repo.save(mod);
    }

    async findByProp(prop: Partial<Division>): Promise<Division | undefined> {
        const division = await this.repo.findOne({
            where: [
                { ...prop },
            ],
        });

        return division;
    }

    async addDivisionInClassroom(division: Division, classroom: Classroom): Promise<void> {
        await this.divisionClassroomRepo.save({ division, classroom });
    }

    async findClassByDivision(division: Division, classroom: Classroom): Promise<DivisionClassroom | undefined> {
        return this.divisionClassroomRepo.findOne({ division, classroom });
    }
}

export default new DivisionRepo();

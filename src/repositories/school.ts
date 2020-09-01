import { Repository, getConnection } from 'typeorm';

import { School } from './../models/School';

class SchoolRepo {
  private repo: Repository<School>;

  constructor() {
      this.repo = getConnection().getRepository(School);
  }

  async create(email: string, name: string, address: string, phone: string): Promise<School> {
      const school = this.repo.create({ email, name, address, phone });

      return this.repo.save(school);
  }

  async update(id: string, props: Partial<School>): Promise<School> {
      return this.repo.save({
          id,
          ...props,
      });
  }

  async findByProp(prop: Partial<School>): Promise<School | undefined> {
      const school = await this.repo.findOne({
          where: [
              { ...prop },
          ],
      });

      return school;
  }

  async getAll(offset: number, limit: number, name = ''): Promise<[School[], number]> {
      const query = this.repo.createQueryBuilder('school')
          .leftJoinAndSelect('school.classrooms', 'classrooms');

      if (name) {
          query.where('school.name ILIKE :name', { name: `%${name}%` })
              .orWhere('school.address ILIKE :name', { name: `%${name}%` });
      }

      return query.take(limit)
          .skip(offset)
          .getManyAndCount();
  }

  async remove(schoolId: string): Promise<void> {
      await this.repo.delete(schoolId);
  }
}

export default new SchoolRepo();

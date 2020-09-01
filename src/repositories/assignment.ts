import { Repository, getConnection } from 'typeorm';

import { Assignment } from './../models/Assignment';

class AssignmentRepo {
  private repo: Repository<Assignment>;

  constructor() {
      this.repo = getConnection().getRepository(Assignment);
  }

  async addInClass(key: string, classId: string): Promise<Assignment> {
      return this.repo.save({ key, classId });
  }

  async getClass(classId: string, offset: number, limit: number): Promise<[Assignment[], number]> {
      return this.repo.findAndCount({
          where: { classId },
          take: limit,
          skip: offset,
      });
  }
}

export default new AssignmentRepo();

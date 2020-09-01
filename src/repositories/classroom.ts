import { Repository, getConnection } from 'typeorm';

import { Classroom } from '../models/Classroom';
import { ClassroomUser } from '../models/ClassroomUser';
import { School } from '../models/School';
import { User } from '../models/User';

class ClassroomRepo {
  private repo: Repository<Classroom>;
  private classroomUserRepo: Repository<ClassroomUser>;

  constructor() {
      this.repo = getConnection().getRepository(Classroom);
      this.classroomUserRepo = getConnection().getRepository(ClassroomUser);
  }

  async create(school: School, name: string, section: string): Promise<Classroom> {
      const classroom = this.repo.create({ school, name, section });

      return this.repo.save(classroom);
  }

  async findByProp(prop: Partial<Classroom>): Promise<Classroom | undefined> {
      const classroom = await this.repo.findOne({
          where: [
              { ...prop },
          ],
      });

      return classroom;
  }

  async findByUserId(userId: string, offset: number, limit: number): Promise<[Classroom[], number]> {
      return this.repo.createQueryBuilder('classroom')
          .leftJoin('classroom_user', 'classroom_user', 'classroom_user.classroomId = classroom.id')
          .where('classroom_user.userId = :userId', { userId })
          .take(limit)
          .skip(offset)
          .getManyAndCount();
  }

  async getAll(offset: number, limit: number): Promise<[Classroom[], number]> {
      return this.repo.findAndCount({
          take: limit,
          skip: offset,
      });
  }

  async getAllBySchoolId(schoolId: string, offset: number, limit: number, name = ''): Promise<[Classroom[], number]> {
      const query = this.repo.createQueryBuilder('classroom')
          .where('"classroom"."schoolId" = :schoolId', { schoolId });

      if (name) {
          query.where('school.name ILIKE :name', { name: `%${name}%` })
              .orWhere('school.section ILIKE :name', { name: `%${name}%` });
      }

      return query.take(limit)
          .skip(offset)
          .getManyAndCount();
  }

  async addToUser(classroom: Classroom, user: User): Promise<void> {
      await this.classroomUserRepo.save({ classroom, user });
  }

  async getAUserClassroom(classroom: Classroom, user: User): Promise<ClassroomUser | undefined> {
      const userClassroom = await this.classroomUserRepo.findOne({ classroom, user });

      return userClassroom;
  }

  async remove(id: string): Promise<void> {
      await this.repo.delete(id);
  }

  async removeFromUser(id: string, userId: string): Promise<void> {
      await this.classroomUserRepo.delete({ classroomId: id, userId });
  }
}

export default new ClassroomRepo();

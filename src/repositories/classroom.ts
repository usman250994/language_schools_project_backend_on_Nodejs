import { Repository, getConnection } from 'typeorm';

import { Classroom } from '../models/Classroom';
import { ClassroomUser } from '../models/ClassroomUser';
import { School } from '../models/School';
import { User } from '../models/User';

class ClassroomRepo {
  private repo: Repository<Classroom>;
  private classroomUserRepo: Repository<ClassroomUser>;
  private userRepo: Repository<User>;

  constructor() {
      this.repo = getConnection().getRepository(Classroom);
      this.classroomUserRepo = getConnection().getRepository(ClassroomUser);
      this.userRepo = getConnection().getRepository(User);
  }

  async create(school: School, name: string, section: string): Promise<Classroom> {
      const classroom = this.repo.create({ school, name, section });

      return this.repo.save(classroom);
  }

  async update(id: string, props: Partial<Classroom>): Promise<Classroom> {
      return this.repo.save({
          id,
          ...props,
      });
  }

  async findByProp(prop: Partial<Classroom>): Promise<Classroom | undefined> {
      const classroom = await this.repo.findOne({
          where: [{ ...prop }],
      });

      return classroom;
  }

  async findByUserId(userId: string, offset: number, limit: number): Promise<[Classroom[], number]> {
      return this.repo
          .createQueryBuilder('classroom')
          .leftJoin(
              'classroom_user',
              'classroom_user',
              'classroom_user.classroomId = classroom.id'
          )
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
      const query = this.repo
          .createQueryBuilder('classroom')
          .where('"classroom"."schoolId" = :schoolId', { schoolId });

      if (name) {
          query
              .where('classroom.name ILIKE :name', { name: `%${name}%` })
              .orWhere('classroom.section ILIKE :name', { name: `%${name}%` });
      }

      return query
          .leftJoinAndSelect('time_table', 'time_table', 'time_table.classroomId = classroom.id')
          .leftJoinAndMapOne('classroom.timeTable', 'time_table', 'time_tables', 'time_tables.classroomId = classroom.id')
          .take(limit).skip(offset).getManyAndCount();
  }

  async addToUser(classroom: Classroom, user: User): Promise<void> {
      const relation = await this.classroomUserRepo.findOne({ user });

      if (relation) {
          await this.classroomUserRepo.update({ userId: relation.userId }, { classroomId: classroom.id });

          return;
      }

      await this.classroomUserRepo.save({ user, classroom });

      return;
  }

  async getAUserClassroom(classroom: Classroom, user: User): Promise<ClassroomUser | undefined> {
      const userClassroom = await this.classroomUserRepo.findOne({
          classroom,
          user,
      });

      return userClassroom;
  }

  async remove(id: string): Promise<void> {
      await this.repo.delete(id);
  }

  async removeFromUser(id: string, userId: string): Promise<void> {
      await this.classroomUserRepo.delete({ classroomId: id, userId });
  }

  async getUsersByRoleAndClass(userRole: string, classId: string, offset: number, limit: number): Promise<[User[], number]> {
      return this.userRepo
          .createQueryBuilder('user')
          .leftJoin(
              'classroom_user',
              'classroom_user',
              'classroom_user.userId = user.id'
          )
          .where('classroom_user.classroomId = :classId', { classId })
          .andWhere('user.role = :userRole', { userRole })
          .take(limit)
          .skip(offset)
          .getManyAndCount();
  }

  async getStudentsAttendanceByClass(classId: string, offset: number, limit: number): Promise<[User[], number]> {
      return this.userRepo
          .createQueryBuilder('user')
          .leftJoin(
              'classroom_user',
              'classroom_user',
              'classroom_user.userId = user.id'
          )
          .leftJoinAndSelect('class_attendance', 'classAttendance', 'classAttendance.studentId = user.id')
          .leftJoinAndMapMany('user.attendance', 'class_attendance', 'classAttendances', 'classAttendances.studentId = user.id')
          .where('classroom_user.classroomId = :classId', { classId })
          .orWhere('classAttendance.classroomId = :classId', { classId })
          .take(limit)
          .skip(offset)
          .getManyAndCount();
  }
}

export default new ClassroomRepo();

import { string } from '@hapi/joi';
import { Repository, getConnection } from 'typeorm';

import { Classroom } from '../models/Classroom';
import { Role } from '../models/enums';
import { StudentParent } from '../models/StudentParent';
import { User } from '../models/User';

class UserRepo {
  private repo: Repository<User>;
  private studentParentRepo: Repository<StudentParent>;

  constructor() {
      this.repo = getConnection().getRepository(User);
      this.studentParentRepo = getConnection().getRepository(StudentParent);
  }

  async getAll(roles: Role[], invitationAccepted: boolean | 'all', offset: number, limit: number): Promise<[User[], number]> {
      const query = this.repo
          .createQueryBuilder('user')
          .where('user.role in (:...roles)', { roles });

      if (invitationAccepted !== 'all') {
          query.andWhere('user.invitationAccepted = :invitationAccepted', {
              invitationAccepted,
          });
      }

      return query.take(limit).skip(offset).getManyAndCount();
  }

  async getAllByType(userRole: Role | 'all', offset: number, limit: number, keyword = ''): Promise<[User[], number]> {
      const query = this.repo.createQueryBuilder('user').where('user.role = :userRole', { userRole });

      if (keyword) {
          query.andWhere('(user.firstName ILIKE :keyword OR user.lastName ILIKE :keyword OR user.email ILIKE :keyword OR user.phone ILIKE :keyword)', { keyword: `%${keyword}%` });
      }

      return query.take(limit).skip(offset).getManyAndCount();
  }

  async getAllByTypeAndKeyword(
      userRole: Role | 'all',
      offset: number,
      limit: number,
      keyword: string | null
  ): Promise<[User[], number]> {
      const query = this.repo
          .createQueryBuilder('user')
          .where('user.role = :userRole', { userRole })
          .andWhere('(user.firstName ILIKE :keyword OR user.lastName ILIKE :keyword)', { keyword: `%${keyword}%` });

      return query.take(limit).skip(offset).getManyAndCount();
  }

  async findById(userId: string): Promise<User | undefined> {
      const user = await this.repo.findOne({
          where: [{ id: userId }],
      });

      return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
      const user = await this.repo.findOne({
          where: [{ email }],
      });

      return user;
  }

  async create(
      firstName: string,
      lastName: string,
      email: string,
      hashedPassword: string,
      role: Role
  ): Promise<User> {
      const user = this.repo.create({
          firstName,
          lastName,
          email,
          hashedPassword,
          role,
      });

      return this.repo.save(user);
  }

  async update(
      userId: string,
      user: Partial<Pick<User, 'firstName' | 'lastName' | 'hashedPassword'>>
  ): Promise<User> {
      return this.repo.save({
          id: userId,
          ...user,
      });
  }

  async remove(userId: string): Promise<void> {
      await this.repo.delete(userId);
  }

  async addStudentInParent(student: User, parent: User): Promise<void> {
      const relation = await this.studentParentRepo.findOne({ student });

      if (relation) {
          await this.studentParentRepo.update({ studentId: relation.studentId }, { parentId: parent.id });

          return;
      }

      await this.studentParentRepo.save({ student, parent });

      return;
  }

  async getStudentsByParent(parentId: string, offset: number, limit: number): Promise<[User[], number]> {
      return this.repo
          .createQueryBuilder('user')
          .leftJoin('student_parent', 'student_parent', 'student_parent.studentId = user.id')
          .where('student_parent.parentId = :parentId', { parentId })
          .take(limit)
          .skip(offset)
          .getManyAndCount();
  }

  async createStudent(student: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'hashedPassword'>>): Promise<User> {
      const user = this.repo.create({ ...student, role: Role.STUDENT });

      return this.repo.save(user);
  }

  async getStudentInfo(studentId: string): Promise<User | undefined>{
      return this.repo
          .createQueryBuilder('user')
          .leftJoinAndSelect('classroom_user', 'classroom_user', 'classroom_user.userId = user.id')
          .leftJoinAndSelect('student_parent', 'student_parent', 'student_parent.studentId = user.id')
          .leftJoinAndMapOne('user.parent', 'user', 'users', 'student_parent.parentId = users.id')
          .leftJoinAndMapOne('user.classRoom', 'classroom', 'classroom', 'classroom.id = classroom_user.classroomId')
          .leftJoinAndMapOne('user.school', 'school', 'school', 'school.id = "classroom"."schoolId"')
          .where('user.id = :studentId', { studentId })
          .getOne();
  }

  async searchStudents({ keyword }: { keyword: string }, limit: number, offset: number): Promise<[User[], number]> {
      const query = this.repo
          .createQueryBuilder('user')
          .leftJoinAndSelect('classroom_user', 'classroom_user', 'classroom_user.userId = user.id')
          .leftJoinAndSelect('classroom', 'classroom', 'classroom.id = "classroom_user"."classroomId"')
          .leftJoinAndSelect('school', 'school', 'school.id = classroom.schoolId')
          .leftJoinAndSelect('student_parent', 'student_parent', '"student_parent"."studentId" = user.id')
          .leftJoinAndMapOne('user.parent', 'user', 'users', 'student_parent.parentId = users.id')
          .leftJoinAndMapOne('user.classRoom', 'classroom', 'classrooms', '"classrooms"."id" = "classroom_user"."classroomId"')
          .leftJoinAndMapOne('user.school', 'school', 'schools', 'schools.id = "classroom"."schoolId"')
          .where('user.role = :roleStd', { roleStd: 'STUDENT' });

      if (keyword) {
          query.andWhere('(user.firstName ILIKE :keyword OR user.lastName ILIKE :keyword OR user.email ILIKE :keyword)', { keyword: `%${keyword}%` })
              .orWhere('(classroom.name ILIKE :keyword OR classroom.section ILIKE :keyword)', { keyword: `%${keyword}%` })
              .orWhere('(school.name ILIKE :keyword)', { keyword: `%${keyword}%` })
              .orWhere(qb => {
                  const subQuery = qb.subQuery()
                      .select('student_parent.studentId', 'studentId')
                      .from(User, 'user')
                      .leftJoin('student_parent', 'student_parent', 'student_parent.parentId = user.id')
                      .where('user.role = :roleParent', { roleParent: 'PARENT' })
                      .andWhere('(user.firstName ILIKE :keyword OR user.lastName ILIKE :keyword OR user.email ILIKE :keyword)', { keyword: `%${keyword}%` })
                      .getQuery();

                  return 'user.id IN ' + subQuery;
              });
      }

      return query.take(limit).skip(offset).getManyAndCount();
  }
}

export default new UserRepo();

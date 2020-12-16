import { Classroom } from 'src/models/Classroom';
import {
    Repository,
    getConnection,
} from 'typeorm';

import { AttendanceStatus, ClassAttendance } from '../models/classAttendance';

export type StudentAttendanceStatus = {
  studentId: string;
  status: AttendanceStatus;
  attendanceDate: Date;
};

export type StudentAttendanceStatusClassroom = { classroom: Classroom; studentId: string; attendanceDate: Date; status: AttendanceStatus}
class AttendanceRepo {
  private repo: Repository<ClassAttendance>;

  constructor() {
      this.repo = getConnection().getRepository(ClassAttendance);
  }

  async createClassAttendance(classroom: Classroom, students: any): Promise<any> {
      return Promise.all(students.map((stud: any) =>
          this.repo.save(
              this.repo.create({
                  // studentId: stud.id,
                  status: stud.status,
                  classroom,
              })
          )
      ));
  }

  //   async getAll(offset: number, limit: number): Promise<[Classroom[], number]> {
  //     return this.repo.findAndCount({
  //       take: limit,
  //       skip: offset,
  //     });
  //   }

  async markClassAttendance(studentStatuses: StudentAttendanceStatusClassroom[]): Promise<void> {
      this.repo
          .createQueryBuilder('classAttendance')
          .insert()
          .values(studentStatuses)
          .execute();
  }

  async findAndUpdateClassAttendanceByStudentInfo(studentStatuses: { classroom: Classroom; studentId: string; attendanceDate: Date; status: AttendanceStatus }): Promise<ClassAttendance | undefined> {
      const foundStatus = await this.repo
          .createQueryBuilder('classAttendance')
          .where('classAttendance.studentId = :id', { id: studentStatuses.studentId })
          .andWhere('classAttendance.classroomId = :classroomId', { classroomId: studentStatuses.classroom.id })
          .andWhere('classAttendance.attendanceDate = :attendanceDate', { attendanceDate: studentStatuses.attendanceDate })
          .getOne();

      if (foundStatus) {
          this.repo.update(foundStatus, { status: studentStatuses.status });
      }

      return foundStatus;
  }

  async updateClassAttendanceByStudentInfo(classAttendance: ClassAttendance, status: AttendanceStatus): Promise<void> {
      this.repo.update(classAttendance, { status });
  }

  async findClassAttendanceByClassroom(classroom: Classroom): Promise<ClassAttendance[]> {
      return this.repo.find({ classroom });
  }
}

export default new AttendanceRepo();

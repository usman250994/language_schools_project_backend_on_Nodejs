import Boom from '@hapi/boom';
import { Classroom } from 'src/models/Classroom';

import { ClassAttendance } from '../models/ClassAttendance';
import { Role } from '../models/enums';
import { User } from '../models/User';
import AttendanceRepo, { StudentAttendanceStatus, StudentAttendanceStatusClassroom } from '../repositories/attendance';
import ClassroomRepo from '../repositories/classroom';
import TimeTableRepo from '../repositories/timetable';

import { TimeTable } from './../models/TimeTable';
import { findClassroomById, getStudentsAttendanceByClass, getUsersByRoleAndClass } from './classroom';
import { findDivisionById } from './division';

export async function createAttendance(students: any, classroomId: string): Promise<any> {
  const classroom: any = await ClassroomRepo.findByProp({ id: classroomId });

  return AttendanceRepo.createClassAttendance(
    classroom,
    students
  );
}

export async function getAttendance(classroomId: string, divisionId: string): Promise<{ timeTable: TimeTable; students: User[] }> {
  const classroom = await findClassroomById(classroomId);
  const division = await findDivisionById(divisionId);
  const timeTable = await TimeTableRepo.findByProp({ classroom, division });

  if (!(timeTable && timeTable.day && timeTable.endDate && timeTable.endTime && timeTable.startDate && timeTable.endDate)) {
    throw Boom.conflict('Time Table not found');
  }

  const [students] = await getStudentsAttendanceByClass(classroom.id, 0, 0);

  if (students.length < 1) {
    throw Boom.conflict('No User found');
  }

  return { timeTable, students };
}

export async function markClassAttendance(classroomId: string, divisionId: string, statuses: StudentAttendanceStatus[]): Promise<void> {
  const classroom = await findClassroomById(classroomId);
  const division = await findDivisionById(divisionId);
  if (!classroom) {
    throw Boom.conflict('Classroom not found');
  }

  //{ classroom: Classroom; studentId: string; attendanceDate: Date; status: AttendanceStatus}
  const studentStatuses = statuses.map(status => ({ classroom, studentId: status.studentId, attendanceDate: status.attendanceDate, status: status.status }));

  const notFoundStudentStatuses: StudentAttendanceStatusClassroom[] = [];

  for (const st of studentStatuses) {
    const classAttendance = await AttendanceRepo.findAndUpdateClassAttendanceByStudentInfo({ classroom, division, studentId: st.studentId, attendanceDate: st.attendanceDate, status: st.status });

    if (!classAttendance) {
      notFoundStudentStatuses.push(st);
    }
  }

  if (notFoundStudentStatuses.length > 0) {
    await AttendanceRepo.markClassAttendance(notFoundStudentStatuses);
  }
}

// export async function updateSchool(id: string, props: Partial<School>): Promise<School> {
//     const school = await findSchoolByProperty({ id });

//     return SchoolRepo.update(school.id, props);
// }

// export async function getAllSchools(offset: number, limit: number, name = ''): Promise<[School[], number]> {
//     return SchoolRepo.getAll(offset, limit, name);
// }

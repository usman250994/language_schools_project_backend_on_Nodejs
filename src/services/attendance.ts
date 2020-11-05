import Boom from "@hapi/boom";

import AttendanceRepo from "../repositories/attendance";
import ClassroomRepo from "../repositories/classroom";

import { ClassAttendance } from "./../models/classAttendance";

export async function createAttendance(
  students: any,
  classroomId: string
): Promise<any> {
  console.log(
    students,
    classroomId,
    "services"
  );
  const classroom: any = await ClassroomRepo.findByProp(
    { id: classroomId }
  );
  return AttendanceRepo.createClassAttendance(
    classroom,
    students
  );
}

// export async function updateSchool(id: string, props: Partial<School>): Promise<School> {
//     const school = await findSchoolByProperty({ id });

//     return SchoolRepo.update(school.id, props);
// }

// export async function getAllSchools(offset: number, limit: number, name = ''): Promise<[School[], number]> {
//     return SchoolRepo.getAll(offset, limit, name);
// }

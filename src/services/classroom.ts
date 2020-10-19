import { ManagedUpload } from "aws-sdk/clients/s3";
import { User } from "src/models/User";

import { Classroom } from "../models/Classroom";
import AssignmentRepo from "../repositories/assignment";
import ClassroomRepo from "../repositories/classroom";

import { Assignment } from "./../models/Assignment";
import { findSchoolByProperty } from "./school";
import { findUserByID } from "./users";

export async function createClassroom(
  schoolId: string,
  name: string,
  section: string
): Promise<Classroom> {
  const school = await findSchoolByProperty({ id: schoolId });

  return ClassroomRepo.create(school, name, section);
}

export async function findClassroomByProperty(
  property: Partial<Classroom>
): Promise<Classroom> {
  const classRoom = await ClassroomRepo.findByProp(property);
  if (!classRoom) {
    throw new Error("Classroom not found");
  }

  return classRoom;
}

export async function deleteClassroom(id: string): Promise<void> {
  await findClassroomByProperty({ id });

  return ClassroomRepo.remove(id);
}

export async function deleteClassroomFromUser(
  id: string,
  userId: string
): Promise<void> {
  await findClassroomByProperty({ id });
  await findUserByID(userId);

  return ClassroomRepo.removeFromUser(id, userId);
}

export async function getClassroomByUserId(
  userId: string,
  offset: number,
  limit: number
): Promise<[Classroom[], number]> {
  const user = await findUserByID(userId);

  return ClassroomRepo.findByUserId(user.id, offset, limit);
}

export async function getClassrooms(
  offset: number,
  limit: number
): Promise<[Classroom[], number]> {
  return ClassroomRepo.getAll(offset, limit);
}

export async function getAllClassroomBySchoolId(
  schoolId: string,
  offset: number,
  limit: number,
  name = ""
): Promise<[Classroom[], number]> {
  await findSchoolByProperty({ id: schoolId });

  return ClassroomRepo.getAllBySchoolId(schoolId, offset, limit, name);
}

export async function addClassInUser(
  classRoomId: string,
  userId: string
): Promise<void> {
  const user = await findUserByID(userId);
  const classroom = await findClassroomByProperty({ id: classRoomId });

  const userClassRoom = await ClassroomRepo.getAUserClassroom(classroom, user);

  if (userClassRoom) {
    throw new Error("This classroom already exist in this user");
  }

  return ClassroomRepo.addToUser(classroom, user);
}

export async function addAssignmentsInClass(
  filesData: ManagedUpload.SendData[],
  classId: string
): Promise<Assignment[]> {
  return Promise.all(
    filesData.map((fileData) =>
      AssignmentRepo.addInClass(fileData.Key, classId)
    )
  );
}

export async function getAssignmentsInClass(
  classId: string,
  offset: number,
  limit: number
): Promise<[Assignment[], number]> {
  return AssignmentRepo.getClass(classId, offset, limit);
}

export async function getUsersByRoleAndClass(
  role: string,
  classId: string,
  offset: number,
  limit: number
): Promise<[User[], number]> {
  return ClassroomRepo.getUsersByRoleAndClass(role, classId, offset, limit);
}

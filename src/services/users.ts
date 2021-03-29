import Boom from '@hapi/boom';
import bcrypt from 'bcrypt';

import { Role } from '../models/enums';
import { User } from '../models/User';
import ClassroomRepo from '../repositories/classroom';
import UserRepo from '../repositories/users';

import { findDivisionById } from './division';

export async function getAllAdminUsers(invitationAccepted: boolean | 'all', offset: number, limit: number): Promise<[User[], number]> {
  return UserRepo.getAll([Role.ADMIN], invitationAccepted, offset, limit);
}

export async function getUsersByType(userRole: Role | 'all', offset: number, limit: number, keyword = ''): Promise<[User[], number]> {
  return UserRepo.getAllByType(userRole, offset, limit, keyword);
}

export async function getAllByTypeAndKeyword(
  userRole: Role | 'all',
  offset: number,
  limit: number,
  keyword: string | null
): Promise<[User[], number]> {
  return UserRepo.getAllByTypeAndKeyword(userRole, offset, limit, keyword);
}

export async function findUserByID(userId: string): Promise<User> {
  const user = await UserRepo.findById(userId);
  if (!user) {
    throw Boom.notFound('User with this id does not exist');
  }

  return user;
}

export async function findUserByEmail(email: string): Promise<User> {
  const user = await UserRepo.findByEmail(email);
  if (!user) {
    throw Boom.notFound('User with this email does not exist');
  }

  return user;
}

export async function createUser(firstName: string, lastName: string, email: string, hashedPassword: string, role: Role): Promise<User> {
  const user = await findUserByEmail(email).catch(() => null);
  if (user) {
    throw Boom.conflict('User with this email already exist');
  }

  return UserRepo.create(firstName, lastName, email, hashedPassword, role);
}

export async function updateUser(userId: string, user: Partial<User>): Promise<User> {
  return UserRepo.update(userId, user);
}

export async function updateUserPassword(userId: string, password: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 8);

  return updateUser(userId, { hashedPassword });
}

export async function deleteUser(userId: string): Promise<void> {
  await findUserByID(userId);

  await UserRepo.remove(userId);
}

export async function addStudentInParent(student: User, parent: User): Promise<void> {
  await UserRepo.addStudentInParent(student, parent);
}

export async function getStudentsByParent(parentId: string, offset: number, limit: number): Promise<[User[], number]> {
  return UserRepo.getStudentsByParent(parentId, offset, limit);
}

async function setupStudent(student: User, { classRoomId, parentId, divisionId }: { classRoomId: string; parentId: string; divisionId: string }): Promise<User> {
  if (classRoomId) {
    const classroom = await ClassroomRepo.findByProp({ id: classRoomId });

    if (!classroom) {
      throw Boom.conflict('Class not found');
    }

    const division = await findDivisionById(divisionId);

    await ClassroomRepo.addToUser(classroom, division, student);
  }

  if (parentId) {
    const parent = await UserRepo.findById(parentId);

    if (!parent) {
      throw Boom.conflict('Parent not found');
    }

    await UserRepo.addStudentInParent(student, parent);
  }

  return student;
}

export async function createStudent(student: Partial<User>, { classRoomId, parentId, divisionId }: { classRoomId: string; parentId: string; divisionId: string }): Promise<User> {
  const _student = await UserRepo.createStudent(student);

  return setupStudent(_student, { classRoomId, parentId, divisionId });
}

export async function updateStudent(student: Partial<User>, { classRoomId, parentId, divisionId }: { classRoomId: string; parentId: string; divisionId: string }, studentId: string): Promise<User> {
  const _student = await UserRepo.findById(studentId);

  if (!_student) {
    throw Boom.conflict('Student not found');
  }

  await UserRepo.update(_student.id, student);

  return setupStudent({ ..._student, ...student }, { classRoomId, parentId, divisionId });
}

export async function getStudentInfo(studentId: string): Promise<User | undefined> {
  const student = await UserRepo.findById(studentId);
  if (!student) {
    throw Boom.conflict('Student not found');
  }

  return UserRepo.getStudentInfo(student.id);
}

export async function searchStudent({ keyword }: { keyword: string }, limit: number, offset: number): Promise<[User[], number]> {
  return UserRepo.searchStudents({ keyword }, limit, offset);
}

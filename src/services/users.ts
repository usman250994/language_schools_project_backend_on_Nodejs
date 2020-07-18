import Boom from '@hapi/boom';
import bcrypt from 'bcrypt';

import { Role } from '../models/enums';
import { User } from '../models/User';
import UserRepo from '../repositories/users';

export async function getAllAdminUsers(invitationAccepted: boolean | 'all', offset: number, limit: number): Promise<[User[], number]> {
    return UserRepo.getAll([Role.ADMIN], invitationAccepted, offset, limit);
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

export async function createUser(email: string, role: Role): Promise<User> {
    const user = await findUserByEmail(email).catch(() => null);
    if (user) {
        throw Boom.conflict('User with this email already exist');
    }

    return UserRepo.create(email, role);
}

export async function updateUser(userId: string, user: Partial<Pick<User, 'firstName' | 'lastName' | 'hashedPassword'>>): Promise<User> {
    return UserRepo.update(userId, user);
}

export async function updateUserPassword(userId: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 8);

    return updateUser(userId, { hashedPassword });
}

export async function deleteUser(userId: string): Promise<void> {
    await UserRepo.remove(userId);
}

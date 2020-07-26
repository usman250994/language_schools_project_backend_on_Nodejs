import bcrypt from 'bcrypt';
import { MigrationInterface, getRepository } from 'typeorm';

import { Role } from '../models/enums';
import { User } from '../models/User';

export class Seed1580070688033 implements MigrationInterface {
    public async up(): Promise<void> {
        const user = getRepository(User).create({
            email: 'su@sprachcenter.com',
            firstName: 'Usman',
            lastName: 'Ali',
            hashedPassword: bcrypt.hashSync('helloworld', 8),
            role: Role.SU,
        });

        await getRepository(User).save(user);
    }

    public async down(): Promise<void> {
        const user = await getRepository(User).findOne({
            where: { email: 'su@sprachcenter.com' },
        });
        if (!user) {
            throw new Error('User not found');
        }

        await getRepository(User).remove(user);
    }
}

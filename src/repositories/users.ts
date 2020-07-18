import { Repository, getConnection } from 'typeorm';

import { Role } from '../models/enums';
import { User } from '../models/User';

class UserRepo {
    private repo: Repository<User>;

    constructor() {
        this.repo = getConnection().getRepository(User);
    }

    async getAll(roles: Role[], invitationAccepted: boolean | 'all', offset: number, limit: number): Promise<[User[], number]> {
        const query = this.repo.createQueryBuilder('user')
            .where('user.role in (:...roles)', { roles });

        if (invitationAccepted !== 'all') {
            query.andWhere('user.invitationAccepted = :invitationAccepted', { invitationAccepted });
        }

        return query
            .take(limit)
            .skip(offset)
            .getManyAndCount();
    }

    async findById(userId: string): Promise<User | undefined> {
        const user = await this.repo.findOne({
            where: [
                { id: userId },
            ],
        });

        return user;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const user = await this.repo.findOne({
            where: [
                { email },
            ],
        });

        return user;
    }

    async create(email: string, role: Role): Promise<User> {
        const user = this.repo.create({ email, role });

        return this.repo.save(user);
    }

    async update(userId: string, user: Partial<Pick<User, 'firstName' | 'lastName' | 'hashedPassword'>>): Promise<User> {
        return this.repo.save({
            id: userId,
            ...user,
        });
    }

    async remove(userId: string): Promise<void> {
        await this.repo.delete(userId);
    }
}

export default new UserRepo();

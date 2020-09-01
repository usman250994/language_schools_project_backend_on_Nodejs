import { Repository, getConnection } from 'typeorm';

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

    async getAllByType(userRole: Role | 'all', offset: number, limit: number): Promise<[User[], number]> {
        const query = this.repo.createQueryBuilder('user')
            .where('user.role = :userRole', { userRole });

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

    async create(firstName: string, lastName: string, email: string, hashedPassword: string, role: Role): Promise<User> {
        const user = this.repo.create({ firstName, lastName, email, hashedPassword, role });

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

    async addStudentInParent(student: User, parent: User): Promise<void> {
        await this.studentParentRepo.save({ student, parent });
    }

    async getStudentsByParent(parentId: string, offset: number, limit: number): Promise<[User[], number]> {
        return this.repo.createQueryBuilder('user')
            .leftJoin('student_parent', 'student_parent', 'student_parent.studentId = user.id')
            .where('student_parent.parentId = :parentId', { parentId })
            .take(limit)
            .skip(offset)
            .getManyAndCount();
    }
}

export default new UserRepo();

import { Column, Entity, ManyToOne } from 'typeorm';

import { Classroom } from './Classroom';
import { Division } from './Division';
import { User } from './User';

@Entity()
export class ClassroomUser {
    @Column({ primary: true })
    userId!: string;

    @Column({ primary: true })
    classroomId!: string;
    @Column({})
    divisionId!: string;

    @ManyToOne(() => User, user => user.classrooms, { onDelete: 'CASCADE' })
    user!: User;

    @ManyToOne(() => Classroom, classroom => classroom.users, { onDelete: 'CASCADE' })
    classroom!: Classroom;

    @ManyToOne(() => Division, division => division.users, { onDelete: 'CASCADE' })
    division!: Division;
}

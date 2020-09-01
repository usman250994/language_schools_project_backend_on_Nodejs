import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

import { User } from './User';

@Entity()
export class StudentParent {
    @Column({ primary: true })
    studentId!: string;

    @Column({ primary: true })
    parentId!: string;

    @ManyToOne(() => User, user => user.students, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'studentId', referencedColumnName: 'id' })
    student!: User;

    @ManyToOne(() => User, user => user.parents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parentId', referencedColumnName: 'id' })
    parent!: User;
}

import { Column, Entity, ManyToOne } from 'typeorm';

import { Classroom } from './Classroom';
import { Division } from './Division';

@Entity()
export class DivisionClassroom {
    @Column({ primary: true })
    classroomId!: string;

    @Column({ primary: true })
    divisionId!: string;

    @ManyToOne(() => Classroom, classroom => classroom.divisions, { onDelete: 'CASCADE' })
    classroom!: Classroom;

    @ManyToOne(() => Division, division => division.classrooms, { onDelete: 'CASCADE' })
    division!: Division;
}

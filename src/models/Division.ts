import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DivisionClassroom } from './DivisionClassroom';
import { Days, TimeTable } from './TimeTable';
import { User } from './User';

@Entity()
export class Division {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: false })
    name!: string;

    @Column({ nullable: false })
    amount!: number;

    @OneToMany(() => DivisionClassroom, (divisionClassroom: DivisionClassroom) => divisionClassroom.classroom)
    classrooms!: DivisionClassroom[];

    @OneToMany(() => DivisionClassroom, (divisionClassroom: DivisionClassroom) => divisionClassroom.division)
    users!: User[];

    @OneToOne(() => TimeTable, (timetable: TimeTable) => timetable.classroom)
    timetable!: TimeTable;

    @Column('enum', { enum: Days, nullable: true })
    day?: Days;

    @Column({ nullable: true })
    startDate?: string;

    @Column({ nullable: true })
    endDate?: string;

    @Column({ nullable: true })
    startTime?: string;

    @Column({ nullable: true })
    endTime?: string;
}

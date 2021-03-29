import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToOne, OneToMany,
} from 'typeorm';

import { ClassAttendance } from './ClassAttendance';
import { Division } from './Division';
import { DivisionClassroom } from './DivisionClassroom';
import { School } from './School';
import { TimeTable } from './TimeTable';
import { User } from './User';

@Entity()
export class Classroom {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false })
  section!: string;

  @ManyToOne(() => School, (school: School) => school.classrooms, { onDelete: 'CASCADE' })
  school!: School;

  @ManyToMany(() => User, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'classroom_user' })
  users!: User[];

  @OneToOne(() => TimeTable, (timetable: TimeTable) => timetable.classroom)
  timetable!: TimeTable;

  @OneToMany(() => ClassAttendance, (classAttendance: ClassAttendance) => classAttendance.classroom)
  classAttendance!: ClassAttendance[];

  @OneToMany(() => Division, (division: Division) => division.classrooms)
  divisions!: DivisionClassroom[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

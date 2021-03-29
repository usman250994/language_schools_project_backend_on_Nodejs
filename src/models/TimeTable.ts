import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn, OneToOne,
} from 'typeorm';

import { Classroom } from './Classroom';
import { Division } from './Division';

export enum Days {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

@Entity()
export class TimeTable {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @OneToOne(() => Classroom, (classroom) => classroom.timetable, {
    onDelete: 'CASCADE',
  })

  @OneToOne(() => Division, (division) => division.timetable, {
    onDelete: 'CASCADE',
  })

  @JoinColumn()
  classroom!: Classroom;

  @JoinColumn()
  division!: Division;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

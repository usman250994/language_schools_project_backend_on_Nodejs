import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';

import { Classroom } from './Classroom';

export enum AttendanceStatus {
  NOT_MARKED = 'NOT_MARKED',
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}
@Entity()
export class ClassAttendance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Classroom, (classroom: Classroom) => classroom.classAttendance, {
      onDelete: 'CASCADE',
  })
  classroom!: Classroom;

  @Column({ nullable: false, type: 'uuid' })
  studentId!: string;

  @Column('enum', { enum: AttendanceStatus, default: AttendanceStatus.ABSENT })
  status!: AttendanceStatus;

  @Column({ nullable: false })
  attendanceDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

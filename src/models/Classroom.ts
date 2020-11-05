import timetable from "src/repositories/timetable";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToOne,
  OneToMany,
} from "typeorm";
import { ClassAttendance } from "./classAttendance";

import { School } from "./School";
import { TimeTable } from "./TimeTable";
import { User } from "./User";

@Entity()
export class Classroom {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false })
  section!: string;

  @ManyToOne(() => School, (school:any) => school.classrooms, {
    onDelete: "CASCADE",
  })
  school!: School;

  @ManyToMany(() => User, { onDelete: "CASCADE" })
  @JoinTable({ name: "classroom_user" })
  users!: User[];

  @OneToOne(() => TimeTable, (timetable: any) => timetable.classroom)
  timetable!: TimeTable;

  @OneToMany(
    () => ClassAttendance,
    (
      classAttendance: any
    ) =>
      classAttendance.classroom
  )
  classAttendance!: ClassAttendance[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

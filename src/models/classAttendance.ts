import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";

import { Classroom } from "./Classroom";
import { User } from "./User";

@Entity()
export class ClassAttendance {
  @PrimaryGeneratedColumn(
    "uuid"
  )
  id!: string;

  @ManyToOne(() => Classroom, (classroom: any) => classroom.classAttendance, {
    onDelete: "CASCADE",
  })
  classroom!: Classroom;


  @Column({ nullable: false })
  studentId!: string;


  @Column({ nullable: false })
  status!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

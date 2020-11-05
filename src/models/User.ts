import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { ClassAttendance } from "./classAttendance";

import { Classroom } from "./Classroom";
import { Role } from "./enums";
import { StudentParent } from "./StudentParent";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column("enum", { enum: Role })
  role!: Role;

  @Column({ nullable: true })
  DOB?: number;

  @Column({ nullable: true })
  hashedPassword?: string;

  @ManyToMany(() => Classroom, { onDelete: "CASCADE" })
  @JoinTable({ name: "classroom_user" })
  classrooms!: Classroom[];

  @OneToMany(() => StudentParent, (studentParent) => studentParent.student)
  @JoinTable({ name: "student_parent" })
  students!: User[];

  @OneToMany(() => StudentParent, (studentParent) => studentParent.parent)
  @JoinTable({ name: "student_parent" })
  parents!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

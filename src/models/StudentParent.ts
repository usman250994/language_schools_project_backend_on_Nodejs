import classroom from "src/repositories/classroom";
import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Classroom } from "./Classroom";

import { User } from "./User";

@Entity()
export class StudentParent {
  @Column({ primary: true })
  studentId!: string;

  @Column({ primary: true })
  parentId!: string;

  //   @Column({ primary: true })
  //   classRoomId!: string;

  @ManyToOne(() => User, (user) => user.students, { onDelete: "CASCADE" })
  @JoinColumn({ name: "studentId", referencedColumnName: "id" })
  student!: User;

  @ManyToOne(() => User, (user) => user.parents, { onDelete: "CASCADE" })
  @JoinColumn({ name: "parentId", referencedColumnName: "id" })
  parent!: User;

  //   @OneToMany(() => Classroom, (classroom) => classroom.users, { onDelete: "CASCADE" })
  //   @JoinColumn({ name: "classRoomId", referencedColumnName: "id" })
  //   classrooms?: Classroom[];
}

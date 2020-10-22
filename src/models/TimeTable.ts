import classroom from "src/repositories/classroom";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from "typeorm";

import { Classroom } from "./Classroom";

@Entity()
export class TimeTable {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  monday!: string;
  @Column({ nullable: false })
  tuesday!: string;
  @Column({ nullable: false })
  wednesday!: string;
  @Column({ nullable: false })
  thursday!: string;
  @Column({ nullable: false })
  friday!: string;

  @OneToOne(() => Classroom, (classroom) => classroom.timetable, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  classroom!: Classroom;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

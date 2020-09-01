import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  key!: string;

  @Column({ nullable: true })
  classId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

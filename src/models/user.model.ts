import { IsEmail, MinLength } from "class-validator";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @MinLength(2, { message: "firstname must be a minimum of two characters" })
  firstname!: string;

  @Column()
  lastname!: string;

  @Column()
  @Unique(["email"])
  @Index()
  @IsEmail({}, { message: "please enter a valid email" })
  email!: string;

  @Column()
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}

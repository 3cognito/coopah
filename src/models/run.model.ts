import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum RunStatus {
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

@Entity()
export class Run {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @Index()
  userID!: string;

  @Column({ type: "enum", enum: RunStatus, default: RunStatus.IN_PROGRESS })
  status!: string;

  @Column({ nullable: true })
  finishedAt!: Date;

  @Column({ nullable: true })
  totalDistance!: number; //in centimeters

  @Column({ nullable: true })
  timeElapsed!: number; // in seconds

  @Column({ type: "float", nullable: true })
  caloriesBurned!: number;

  @Column({ nullable: true })
  speed!: number; //km/h

  @Column({ nullable: true })
  pace!: number; //min per km

  @CreateDateColumn()
  createdAt!: Date; //using this as start time, under the assumption user starts running when they create a run

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}

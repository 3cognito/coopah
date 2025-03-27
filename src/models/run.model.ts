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
  userId!: string;

  @Column({ type: "enum", enum: RunStatus, default: RunStatus.IN_PROGRESS })
  status!: RunStatus;

  @Column({ nullable: true })
  finishedAt!: Date;

  @Column({ default: 0 })
  totalDistance!: number; //in centimeters

  @Column({ default: 0 })
  timeElapsed!: number; // in seconds

  // @Column({ type: "float", default: 0 })
  // caloriesBurned!: number;

  @Column({ default: 0 })
  speed!: number; //km/h

  @Column({ default: 0 })
  pace!: number; //min per km

  @CreateDateColumn()
  createdAt!: Date; //using this as start time, under the assumption user starts running when they create a run

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  inProgress() {
    return this.status == RunStatus.IN_PROGRESS;
  }
}

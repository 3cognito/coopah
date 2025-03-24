import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { Run } from "./run.model";

@Entity()
@Unique(["run_id", "latitude", "longitude", "timestamp"])
export class Point {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  @Index()
  @ManyToOne(() => Run, { onDelete: "CASCADE" })
  @JoinColumn({ name: "run_id" })
  run_id!: string;

  @Column({ type: "float8" })
  @Check(`latitude BETWEEN -90 AND 90`)
  latitude!: number;

  @Column({ type: "float8" })
  @Check(`longitude BETWEEN -180 AND 180`)
  longitude!: number;

  @Column({ type: "float" })
  @Check(`altitude >= 0`)
  altitude!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  //TODO: some kind of validation to ensure newer entries cannot have older timestamps??
  //Note to self: validation does not necessarily have to be done at model level???
  timestamp!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}

import { Type } from "class-transformer";
import {
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
} from "class-validator";
import { RunStatus } from "../models/run.model";

export class RunRequestDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @Type(() => Number)
  coordinates!: number[]; //lat, long, alt
}

export class AddPointDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @Type(() => Number)
  coordinates!: number[]; //lat, long, alt

  @IsUUID()
  runId!: string;
}

export class RunStat {
  @IsUUID()
  runId!: string;

  @IsUUID()
  userId!: string;

  @IsNumber()
  speed!: number; // m/s

  @IsNumber()
  @Type(() => Number)
  pace!: number; // seconds/m

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @Type(() => Number)
  lastCoordinates!: number[]; // [lat, long]

  @IsNumber()
  lastTimestamp!: number; // milliseconds from 1970, Jan

  @IsNumber()
  startTimestamp!: number; // milliseconds from 1970, Jan

  @IsEnum(RunStatus)
  status!: RunStatus;

  @IsOptional()
  @IsNumber()
  finishedAt?: number; // timestamp (optional)

  @IsNumber()
  totalDistance!: number; // meters

  @IsNumber()
  timeElapsed!: number; // seconds
}

export class RunSummary {
  @IsUUID()
  userId!: string;

  @IsNumber()
  speed!: number; // m/s

  @IsNumber()
  @Type(() => Number)
  pace!: number; // seconds/m

  @IsNumber()
  totalDistance!: number; // meters

  @IsNumber()
  totalTimeSpent!: number; // seconds
}

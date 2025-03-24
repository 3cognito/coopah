import { Type } from "class-transformer";
import { IsArray, ArrayMaxSize, ArrayMinSize, IsUUID } from "class-validator";

export class RunRequestDto {
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @Type(() => Number)
  coordinates!: number[]; //lat, long, alt
}

export class AddPointDto {
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @Type(() => Number)
  coordinates!: number[]; //lat, long, alt

  @IsUUID()
  runId!: string;
}

import { Type } from "class-transformer";
import { IsArray, ArrayMaxSize, ArrayMinSize, IsUUID } from "class-validator";

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

import { Type } from "class-transformer";
import { IsArray, ArrayMaxSize, ArrayMinSize } from "class-validator";

export class RunRequestDto {
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @Type(() => Number)
  coordinates!: number[]; //lat, long, alt
}

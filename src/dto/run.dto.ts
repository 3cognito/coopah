import { Type } from "class-transformer";
import {
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  ValidateNested,
} from "class-validator";

export class RunDto {
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => Number)
  coordinates!: number[]; //lat, long, alt
}

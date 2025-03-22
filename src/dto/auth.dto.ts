import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  firstname!: string;

  @IsNotEmpty()
  lastname!: string;

  @IsNotEmpty()
  @Length(6, 20)
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @Length(6, 20)
  password!: string;
}

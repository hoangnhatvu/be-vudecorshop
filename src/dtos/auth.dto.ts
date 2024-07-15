import { IsEmail, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator'
import { Transform } from 'class-transformer'

export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  @Transform((email) => email.value.toLowerCase())
  email: string
  @IsNotEmpty()
  password: string
  @IsOptional()
  device_token: string
}

export class RegisterDTO {
  @IsNotEmpty()
  user_name: string

  @IsEmail()
  @IsNotEmpty()
  @Transform((email) => email.value.toLowerCase())
  email: string

  @IsNotEmpty()
  @Length(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'Mật khẩu phải chứa ít nhất một ký tự in hoa, một ký tự thường, một chữ số và một ký tự đặc biệt!',
  })
  password: string
}

export class SendOtpDTO {
  @IsEmail()
  @IsNotEmpty()
  @Transform((email) => email.value.toLowerCase())
  email: string
  @IsNotEmpty()
  type: string
}

export class VerifyOtpDTO {
  @IsEmail()
  @IsNotEmpty()
  @Transform((email) => email.value.toLowerCase())
  email: string
  @IsNotEmpty()
  otp: string
  @IsNotEmpty()
  type: string
}

export class ForgotPasswordDTO {
  @IsEmail()
  @IsNotEmpty()
  @Transform((email) => email.value.toLowerCase())
  email: string
  @IsNotEmpty()
  @Length(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'Mật khẩu phải chứa ít nhất một ký tự in hoa, một ký tự thường, một chữ số và một ký tự đặc biệt!',
  })
  password: string
  @IsNotEmpty()
  updated_token: string
}

export class ChangePasswordDTO {
  @IsNotEmpty()
  @Length(8)
  oldPassword: string

  @IsNotEmpty()
  updated_token: string

  @IsNotEmpty()
  @Length(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'Mật khẩu phải chứa ít nhất một ký tự in hoa, một ký tự thường, một chữ số và một ký tự đặc biệt!',
  })
  password: string
}

import { Injectable, HttpException, HttpStatus, ConflictException, InternalServerErrorException } from '@nestjs/common'

import {
  ChangePasswordDTO,
  ForgotPasswordDTO,
  LoginDTO,
  RegisterDTO,
  SendOtpDTO,
  VerifyOtpDTO,
} from 'src/dtos/auth.dto'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { plainToInstance } from 'class-transformer'
import { CreateUserDto, UpdateUserDTO, UserDTO } from 'src/dtos/user.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from 'src/types/user'
import { TokenBlacklist } from 'src/types/token-blacklist'
import { generateUpdateToken } from 'src/common/generate-update-token'
import { hashPassword } from 'src/common/hashPassword'
import * as nodemailer from 'nodemailer'
import { otpCache, verify } from 'src/main'
import { UserRole } from 'src/enums/role.enum'

type PayloadType = {
  id: string
  updatedToken: string
  email: string
  role: string
}

@Injectable()
export class AuthService {
  private readonly transporter
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('TokenBlacklist') private tokenBlacklistModel: Model<TokenBlacklist>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'hoangnhatvu35202@gmail.com',
        pass: 'zgks hact bbjd axtb',
      },
    })
  }

  async sendOtpEmail(sendOtpDTO: SendOtpDTO) {
    try {
      const user = await this.userModel.findOne({
        email: sendOtpDTO.email,
      })
      if (!user) {
        throw new HttpException('Email chưa được đăng ký', HttpStatus.NOT_FOUND)
      } else if (sendOtpDTO.type === 'verify' && user.is_active) {
        throw new HttpException('Tài khoản đã được kích hoạt, vui lòng đăng nhập', HttpStatus.CONFLICT)
      } else {
        verify[sendOtpDTO.email] = { isVerified: false }
      }

      if (otpCache[sendOtpDTO.email]) {
        const { expirationTime } = otpCache[sendOtpDTO.email]
        const currentTime = Date.now()
        if (currentTime <= expirationTime) {
          throw new HttpException('Mã otp hiện tại chưa hết hạn', HttpStatus.CONFLICT)
        }
      }

      try {
        const expirationTime = Date.now() + 60 * 1000
        const otp = this.generateOtp()
        otpCache[sendOtpDTO.email] = { otp, expirationTime }

        const mailOptions = {
          from: 'hoangnhatvu35202@gmail.com',
          to: sendOtpDTO.email,
          subject: 'Xác minh tài khoản',
          html: `<p>Cảm ơn bạn đã đăng ký!</p>
                <p>Mã OTP của bạn là: <strong>${otp}</strong>. Vui lòng đừng chia sẻ với bất kỳ ai!</p>`,
        }
        await this.transporter.sendMail(mailOptions)
        return { success: true, message: 'Email xác nhận đã được gửi đến bạn !' }
      } catch (error) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST)
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else throw new HttpException('Lỗi Internet', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  private generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  async verifyOtp(verifyOtpDTO: VerifyOtpDTO) {
    try {
      const user = await this.userModel.findOne({
        email: verifyOtpDTO.email,
      })
      if (!user) {
        throw new HttpException('Email chưa được đăng ký', HttpStatus.NOT_FOUND)
      } else if (verifyOtpDTO.type === 'verify' && user.is_active) {
        throw new HttpException('Tài khoản đã được kích hoạt, vui lòng đăng nhập', HttpStatus.CONFLICT)
      }
      if (otpCache[verifyOtpDTO.email]) {
        const { otp: cachedOtp, expirationTime } = otpCache[verifyOtpDTO.email]
        const currentTime = Date.now()

        if (verifyOtpDTO.otp === cachedOtp && currentTime <= expirationTime) {
          if (verifyOtpDTO.type === 'verify') {
            const updateResult = await user.updateOne({ is_active: true })
            if (updateResult.modifiedCount > 0) {
              return { success: true, message: 'Xác minh thành công' }
            } else {
              throw new HttpException('Xác minh thất bại', HttpStatus.NOT_IMPLEMENTED)
            }
          } else {
            verify[verifyOtpDTO.email] = { isVerified: true }
            return {
              user: plainToInstance(UserDTO, user, {
                excludeExtraneousValues: true,
              }),
            }
          }
        } else {
          throw new HttpException('OTP không hợp lệ !', HttpStatus.NOT_IMPLEMENTED)
        }
      } else {
        throw new HttpException('Không tìm thấy OTP !', HttpStatus.NOT_FOUND)
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else throw new HttpException('Lỗi Internet', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async login(loginDTO: LoginDTO) {
    const user = await this.userModel.findOne({
      email: loginDTO.email,
    })
    if (!user) {
      throw new HttpException('Email hoặc mật khẩu không đúng !', HttpStatus.UNAUTHORIZED)
    }
    const isMatch = await bcrypt.compare(loginDTO.password, user.password)
    if (!isMatch) {
      throw new HttpException('Email hoặc mật khẩu không đúng !', HttpStatus.UNAUTHORIZED)
    }

    if (user.is_blocked) {
      throw new HttpException('Tài khoản hiện tại đang bị vô hiệu hóa !', HttpStatus.FORBIDDEN)
    } else if (!user.is_active) {
      throw new HttpException('Tài khoản chưa được kích hoạt !', HttpStatus.NOT_ACCEPTABLE)
    }

    if (user.device_token !== loginDTO.device_token) {
      const updateResult = await user.updateOne({ device_token: loginDTO.device_token })
      if (updateResult.modifiedCount > 0) {
        const payload = {
          id: user.id,
          updatedToken: user.updated_token,
          email: user.email,
          role: user.role,
        }
        const token = await this.generateToken(payload)
        return {
          user: plainToInstance(UserDTO, user, {
            excludeExtraneousValues: true,
          }),
          token: token,
        }
      } else {
        throw new HttpException('Đăng nhập thất bại !', HttpStatus.NOT_IMPLEMENTED)
      }
    }    
  }

  async loginAdmin(loginDTO: LoginDTO) {
    const user = await this.userModel.findOne({
      email: loginDTO.email,
    })
    if (!user) {
      throw new HttpException('Email hoặc mật khẩu không đúng !', HttpStatus.UNAUTHORIZED)
    }
    const isMatch = await bcrypt.compare(loginDTO.password, user.password)
    if (!isMatch) {
      throw new HttpException('Email hoặc mật khẩu không đúng !', HttpStatus.UNAUTHORIZED)
    }

    if (user.is_blocked) {
      throw new HttpException('Tài khoản hiện tại đang bị vô hiệu hóa !', HttpStatus.FORBIDDEN)
    } else if (!user.is_active) {
      throw new HttpException('Tài khoản chưa được kích hoạt !', HttpStatus.NOT_ACCEPTABLE)
    }

    if (user.role === UserRole.USER) {
      throw new HttpException('Tài khoản không có quyền truy cập !', HttpStatus.FORBIDDEN)
    }

    const payload = {
      id: user.id,
      updatedToken: user.updated_token,
      email: user.email,
      role: user.role,
    }
    const token = await this.generateToken(payload)
    return {
      user: plainToInstance(UserDTO, user, {
        excludeExtraneousValues: true,
      }),
      token: token,
    }
  }

  async changePassword(changePasswordDTO: ChangePasswordDTO, email: string) {
    try {
      const user = await this.userModel.findOne({
        email: email,
      })
      if (!user) {
        throw new HttpException('Không tìm thấy người dùng !', HttpStatus.UNAUTHORIZED)
      }
      const isMatch = await bcrypt.compare(changePasswordDTO.oldPassword, user.password)
      if (!isMatch) {
        throw new HttpException('Mật khẩu hiện tại không chính xác !', HttpStatus.UNAUTHORIZED)
      }

      if (user.updated_token !== changePasswordDTO.updated_token) {
        throw new HttpException('User đang được cập nhật bởi ai đó!', HttpStatus.CONFLICT)
      }

      const hashPass = await hashPassword(changePasswordDTO.password)

      const updatePasswordData = {
        password: hashPass,
        updated_token: generateUpdateToken(),
        updated_date: Date.now(),
      }

      const updateResult = await user.updateOne(updatePasswordData)

      if (updateResult.modifiedCount > 0) {
        return { message: 'Cập nhật thành công' }
      } else {
        throw new HttpException('Cập nhật thất bại', HttpStatus.NOT_IMPLEMENTED)
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new HttpException('Lỗi Internet', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async register(registerDTO: RegisterDTO): Promise<RegisterDTO> {
    try {
      const hashPass = await hashPassword(registerDTO.password)
      const user = new this.userModel({
        ...registerDTO,
        updated_token: generateUpdateToken(),
        password: hashPass,
      })

      await user.save()

      return plainToInstance(UserDTO, user, {
        excludeExtraneousValues: true,
      })
    } catch (err) {
      console.log(err)
      if (err.code === 11000) {
        throw new ConflictException('Email đã tồn tại !')
      } else {
        throw new InternalServerErrorException()
      }
    }
  }

  async forgotPassword(forgotPasswordDTO: ForgotPasswordDTO) {
    try {
      if (!verify[forgotPasswordDTO.email]) {
        throw new HttpException('Email chưa được xác minh', HttpStatus.NOT_ACCEPTABLE)
      }

      const user = await this.userModel.findOne({
        email: forgotPasswordDTO.email,
      })
      if (!user) {
        throw new HttpException('Email hoặc mật khẩu không đúng', HttpStatus.UNAUTHORIZED)
      }
      if (user.updated_token !== forgotPasswordDTO.updated_token) {
        throw new HttpException('User đang được thay đổi mật khẩu bởi ai đó', HttpStatus.CONFLICT)
      }
      const hashPass = await hashPassword(forgotPasswordDTO.password)
      const updateResult = await user.updateOne({ password: hashPass, updated_token: generateUpdateToken() })
      if (updateResult.modifiedCount > 0) {
        verify[forgotPasswordDTO.email] = { isVerified: false }
        return { success: true, message: 'Thay đổi mật khẩu thành công !' }
      } else {
        throw new HttpException('Thay đổi mật khẩu thất bại !', HttpStatus.NOT_IMPLEMENTED)
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      } else {
        throw new HttpException('Lỗi Internet', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async getStatusUser(userId: string) {
    try {
      const user = await this.userModel.findOne({ _id: userId })

      if (!user) {
        throw new HttpException('Không tìm thấy user', HttpStatus.NOT_FOUND)
      } else {
        return { is_active: user.is_active, is_block: user.is_blocked }
      }
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      } else {
        throw new HttpException('Lỗi Internet', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async logout(userId: string, token: string) {
    try {
      const result = await this.userModel.updateOne(
        {
          _id: userId,
        },
        {
          refresh_token: null,
        },
      )
      if (result.modifiedCount === 0) {
        throw new HttpException('Không tìm thấy user !', HttpStatus.NOT_FOUND)
      }

      const tokenBlacklist = new this.tokenBlacklistModel({
        token: token,
      })
      await tokenBlacklist.save()

      return { message: 'Đăng xuất thành công !' }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      } else {
        throw new HttpException('Lỗi Internet', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const verify = await this.jwtService.verifyAsync<PayloadType>(refreshToken, {
        secret: this.configService.get('SECRET'),
      })

      const user = await this.userModel.findOne({
        _id: verify.id,
        updated_token: verify.updatedToken,
        refresh_token: refreshToken,
      })
      if (user) {
        return this.generateToken({
          id: user.id,
          updatedToken: user.updated_token,
          role: user.role,
          email: user.email,
        })
      } else {
        throw new HttpException('Refresh token không hợp lệ !', HttpStatus.BAD_REQUEST)
      }
    } catch (err) {
      throw new HttpException('Refresh token không hợp lệ !', HttpStatus.BAD_REQUEST)
    }
  }

  private async generateToken(payload: PayloadType) {
    const accessToken = await this.jwtService.signAsync(payload)
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('SECRET'),
      expiresIn: this.configService.get('EXPIRES_IN_REFRESH_TOKEN'),
    })

    await this.userModel.updateOne(
      {
        _id: payload.id,
        updated_token: payload.updatedToken,
      },
      {
        refresh_token: refreshToken,
      },
    )

    return { accessToken, refreshToken }
  }
}

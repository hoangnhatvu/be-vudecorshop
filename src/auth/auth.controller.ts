import { Req, Body, Controller, HttpCode, Post, UseGuards, Get } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthGuard } from '../guards/auth.guard'
import { ChangePasswordDTO, ForgotPasswordDTO, LoginDTO, RegisterDTO, SendOtpDTO, VerifyOtpDTO } from 'src/dtos/auth.dto'
import { Roles } from 'src/decorators/roles.decorator'
import { UserRole } from 'src/enums/role.enum'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  login(@Body() loginDTO: LoginDTO) {
    return this.authService.login(loginDTO)
  }

  @Post('loginAdmin')
  loginAdmin(@Body() loginDTO: LoginDTO) {
    return this.authService.loginAdmin(loginDTO)
  }

  @Post('register')
  register(@Body() registerDTO: RegisterDTO) {
    return this.authService.register(registerDTO)
  }

  @Post('otp')
  @HttpCode(200)
  sendOtpEmail(@Body() sendOtpDTO: SendOtpDTO) {
    return this.authService.sendOtpEmail(sendOtpDTO)
  }

  @Post('verify')
  @HttpCode(200)
  verifyOtp(@Body() verifyOtpDTO: VerifyOtpDTO) {
    return this.authService.verifyOtp(verifyOtpDTO)
  }

  @Post('forgotPassword')
  @HttpCode(200)
  forgotPassword(@Body() forgotPasswordDTO: ForgotPasswordDTO) {
    return this.authService.forgotPassword(forgotPasswordDTO)
  }

  @Post('refresh-token')
  refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken)
  }

  @Post('getUserStatus')
  getUserStatus(@Body() body: {id: string}) {
    return this.authService.getStatusUser(body.id)
  }

  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Roles(UserRole.USER)
  @Post('changePassword')
  changePassword(@Req() request: any, @Body() changePasswordDTO: ChangePasswordDTO) {
    return this.authService.changePassword(changePasswordDTO, request.user_data.email)
  }

  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER)
  @Post('logout')
  logout(@Req() request: any) {
    return this.authService.logout(request.user_data.id, request.token)
  }
}

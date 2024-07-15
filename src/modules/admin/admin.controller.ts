import { Controller, Post, UseGuards } from '@nestjs/common'
import { UserRole } from 'src/enums/role.enum'
import { AuthGuard } from 'src/guards/auth.guard'
import { Roles } from 'src/decorators/roles.decorator'
import { AdminService } from './admin.service'

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}
  @Post('getInfoDashboard')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  async getInfoDashboard() {
    return this.adminService.getInfoDashboard()
  }
}

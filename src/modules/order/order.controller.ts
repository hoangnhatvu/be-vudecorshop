import { Body, Controller, Post, UseGuards, Req, BadRequestException, Put, Query, Get } from '@nestjs/common'
import { UserRole } from 'src/enums/role.enum'
import { AuthGuard } from 'src/guards/auth.guard'
import { Roles } from 'src/decorators/roles.decorator'
import { OrderService } from './order.service'
import { CreateOrderDTO, GetOrderByUserDTO, UpdateOrderDTO } from 'src/dtos/order.dto'

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}
  @Post('create')
  @UseGuards(AuthGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.EMPLOYEE)
  create(@Body() createOrderDTO: CreateOrderDTO, @Req() req: any) {
    return this.orderService.create(createOrderDTO, req.user_data.id)
  }

  @Put('update')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER)
  update(@Query() query: { id: string }, @Body() updateOrdertDTO: UpdateOrderDTO, @Req() req: any) {
    return this.orderService.update(query.id, updateOrdertDTO, req.user_data.id)
  }

  @Get('')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  async getAll(@Query() query: any) {
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20
    const status = query.status ? query.status : ''
    return this.orderService.getAll(page, limit, status)
  }

  @Post('getOrderByUser')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER)
  async getOrderByUser(@Query() query: any, @Body() getOrderByUserDTO: GetOrderByUserDTO, @Req() req: any) {
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20

    return this.orderService.getOrderByUser(page, limit, req.user_data.id, getOrderByUserDTO.status)
  }

  @Get('createPayment')
  @UseGuards(AuthGuard)
  @Roles(UserRole.USER)
  async createPayment(@Query() query: any) {
    const amount = query.amount
    const orderId = query.orderId
    return this.orderService.createPayment(amount, orderId)
  }

  @Get('getPaymentResult')
  async getPaymentResult(@Query() query: any) {
    return this.orderService.getPaymentResult(query)
  }
}

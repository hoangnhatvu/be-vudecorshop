import { Body, Controller, Post, UseGuards, Req, HttpCode, Query, Get, Put } from '@nestjs/common'
import { UserRole } from 'src/enums/role.enum'
import { AuthGuard } from 'src/guards/auth.guard'
import { Roles } from 'src/decorators/roles.decorator'
import { ReviewService } from './review.service'
import { CreateReviewDTO, UpdateReviewDTO } from 'src/dtos/review.dto'

@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}
  @Post('create')
  @UseGuards(AuthGuard)
  @Roles(UserRole.USER)
  create(@Body() createReviewDTO: CreateReviewDTO, @Req() req: any) {
    return this.reviewService.create(createReviewDTO, req.user_data.id)
  }

  @Put('update')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER)
  update(@Query() query: { id: string }, @Body() updateReviewDTO: UpdateReviewDTO, @Req() req: any) {
    return this.reviewService.update(query.id, updateReviewDTO, req.user_data.id)
  }

  @Post('getReviewsByProduct')
  @HttpCode(200)
  async getReviewsByProduct(@Query() query: any, @Body() body: { product: string }) {
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20
    return this.reviewService.getAll(page, limit, false, body.product)
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @HttpCode(200)
  async getAll(@Query() query: any) {
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20
    return this.reviewService.getAll(page, limit, true)
  }
}

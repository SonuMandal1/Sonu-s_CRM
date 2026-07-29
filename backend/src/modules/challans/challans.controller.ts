import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChallansService } from './challans.service';
import { CreateChallanDto } from './dto/create-challan.dto';
import { QueryChallanDto } from './dto/query-challan.dto';
import { UpdateChallanStatusDto } from './dto/update-challan-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('challans')
export class ChallansController {
  constructor(private challansService: ChallansService) {}

  @Post()
  @Roles('admin', 'sales')
  create(@Body() dto: CreateChallanDto, @CurrentUser() user: any) {
    return this.challansService.create(dto, user.userId);
  }

  @Get()
  @Roles('admin', 'sales', 'warehouse', 'accounts')
  findAll(@Query() query: QueryChallanDto) {
    return this.challansService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'sales', 'warehouse', 'accounts')
  findOne(@Param('id') id: string) {
    return this.challansService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('admin', 'sales', 'warehouse')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateChallanStatusDto, @CurrentUser() user: any) {
    return this.challansService.updateStatus(id, dto.status, user.userId);
  }
}
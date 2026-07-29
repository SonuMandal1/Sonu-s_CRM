import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @Roles('admin', 'warehouse')
  create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(dto, user.userId);
  }

  @Get()
  @Roles('admin', 'warehouse', 'sales', 'accounts')
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  // Static routes declared before ':id' so Nest doesn't swallow them
  @Get('categories')
  @Roles('admin', 'warehouse', 'sales', 'accounts')
  listCategories() {
    return this.productsService.listCategories();
  }

  @Post('categories')
  @Roles('admin', 'warehouse')
  createCategory(@Body('name') name: string) {
    return this.productsService.createCategory(name);
  }

  @Get('warehouses')
  @Roles('admin', 'warehouse', 'sales', 'accounts')
  listWarehouses() {
    return this.productsService.listWarehouses();
  }

  @Post('warehouses')
  @Roles('admin', 'warehouse')
  createWarehouse(@Body('name') name: string, @Body('location') location?: string) {
    return this.productsService.createWarehouse(name, location);
  }

  @Get(':id')
  @Roles('admin', 'warehouse', 'sales', 'accounts')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'warehouse')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @CurrentUser() user: any) {
    return this.productsService.update(id, dto, user.userId);
  }

  @Post(':id/stock-adjustment')
  @Roles('admin', 'warehouse')
  adjustStock(@Param('id') id: string, @Body() dto: AdjustStockDto, @CurrentUser() user: any) {
    return this.productsService.adjustStock(id, dto, user.userId);
  }
}
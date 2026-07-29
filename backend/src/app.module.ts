import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ProductsModule } from './modules/products/products.module';
import { ChallansModule } from './modules/challans/challans.module';

@Module({
  imports: [AuthModule, CustomersModule, ProductsModule, ChallansModule],
})
export class AppModule {}
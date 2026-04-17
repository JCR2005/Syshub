import { Module } from '@nestjs/common';
import { RecursosService } from './recursos.service';
import { RecursosController } from './recursos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RecursosService],
  controllers: [RecursosController],
  exports: [RecursosService],
})
export class RecursosModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CursoEspacioController } from './curso-espacio.controller';
import { CursoEspacioService } from './curso-espacio.service';

@Module({
  imports: [PrismaModule],
  controllers: [CursoEspacioController],
  providers: [CursoEspacioService],
  exports: [CursoEspacioService],
})
export class CursoEspacioModule {}

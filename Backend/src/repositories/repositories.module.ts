import { Module } from '@nestjs/common';
import { RepositoriesService } from './repositories.service';
import { RepositoriesController } from './repositories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RepositoriesService],
  controllers: [RepositoriesController],
  exports: [RepositoriesService],
})
export class RepositoriesModule {}

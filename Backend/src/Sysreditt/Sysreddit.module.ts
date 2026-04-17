import { Module } from '@nestjs/common';
import { SysredditService } from './Sysreddit.service';
import { SysredditController } from './Sysreddit.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SysredditService],
  controllers: [SysredditController],
  exports: [SysredditService],
})
export class SysredditModule {}

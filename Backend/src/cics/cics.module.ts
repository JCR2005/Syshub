import { Module } from '@nestjs/common';
import { CicsController } from './cics.controller';
import { CicsService } from './cics.service';

@Module({
  controllers: [CicsController],
  providers: [CicsService],
  exports: [CicsService],
})
export class CicsModule {}

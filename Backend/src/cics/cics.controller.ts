import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentInfoDto } from './dto/student-info.dto';
import { CicsService } from './cics.service';

@Controller('cics')
export class CicsController {
  constructor(private readonly cicsService: CicsService) {}

  @Post('student-info')
  @UseGuards(JwtAuthGuard)
  async getStudentInfo(@Body() dto: StudentInfoDto) {
    const ra = (dto?.ra ?? '').trim();
    const pin = (dto?.pin ?? '').trim();

    if (!ra || !pin) {
      throw new BadRequestException('Debes enviar carnet (ra) y pin');
    }

    return this.cicsService.getStudentInfo(ra, pin);
  }
}

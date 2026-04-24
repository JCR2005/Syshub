import { StudentInfoDto } from './dto/student-info.dto';
import { CicsService } from './cics.service';
export declare class CicsController {
    private readonly cicsService;
    constructor(cicsService: CicsService);
    getStudentInfo(dto: StudentInfoDto): Promise<{
        ok: boolean;
        data: Record<string, unknown> | null;
    }>;
}

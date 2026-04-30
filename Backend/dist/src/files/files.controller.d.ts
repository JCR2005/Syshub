import { PrismaService } from '../prisma/prisma.service';
import type { Request, Response } from 'express';
type AuthenticatedRequest = Request & {
    user?: {
        sub?: number | string;
        id?: number | string;
    };
};
export declare class FilesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    serveFile(id: string, download: string | undefined, res: Response, req: AuthenticatedRequest): Promise<void>;
}
export {};

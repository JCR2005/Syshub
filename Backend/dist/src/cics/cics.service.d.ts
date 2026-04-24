export declare class CicsService {
    private readonly baseUrl;
    getStudentInfo(ra: string, pin: string): Promise<{
        ok: boolean;
        data: Record<string, unknown> | null;
    }>;
    private extractMessage;
}

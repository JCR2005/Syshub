export declare class MailerService {
    private readonly logger;
    sendVerificationEmail(to: string, code: string): Promise<void>;
}

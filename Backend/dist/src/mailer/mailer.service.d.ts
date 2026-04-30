export declare class MailerService {
    private readonly logger;
    private logVerificationCode;
    sendVerificationEmail(to: string, code: string): Promise<void>;
}

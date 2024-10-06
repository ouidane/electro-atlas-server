interface EmailVerificationPayload {
    verificationCode: string;
    email: string;
    createdAt: number;
}
export declare function generateEmailVerificationToken(verificationCode: string, email: string): string;
export declare function validateEmailVerificationToken(token: string): EmailVerificationPayload | null;
export declare function generateVerificationCode(): string;
export {};

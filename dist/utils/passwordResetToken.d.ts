interface ResetTokenPayload {
    userId: string;
    passwordToken: string;
}
export declare function generateResetToken(payload: ResetTokenPayload): string;
export declare function validateResetToken(token: string): ResetTokenPayload | null;
export {};

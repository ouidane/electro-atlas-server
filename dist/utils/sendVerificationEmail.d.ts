interface VerifyEmailParams {
    email: string;
    verificationCode: string;
    origin: string;
}
declare const sendVerificationEmail: ({ email, verificationCode, origin, }: VerifyEmailParams) => Promise<void>;
export default sendVerificationEmail;

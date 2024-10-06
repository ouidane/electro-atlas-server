interface ResetPasswordParams {
    email: string;
    token: string;
    origin: string;
}
declare const sendResetPasswordEmail: ({ email, token, origin, }: ResetPasswordParams) => Promise<void>;
export default sendResetPasswordEmail;

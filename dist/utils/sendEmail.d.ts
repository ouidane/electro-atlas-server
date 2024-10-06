interface EmailContent {
    to: string;
    subject: string;
    html: string;
}
declare const sendEmail: ({ to, subject, html, }: EmailContent) => Promise<void>;
export default sendEmail;

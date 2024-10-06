"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendEmail_1 = __importDefault(require("./sendEmail"));
const sendResetPasswordEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, token, origin, }) {
    const resetLink = `${origin}/reset-password?resetToken=${token}`;
    yield (0, sendEmail_1.default)({
        to: email,
        subject: "Reset Your Password - Electro Atlas",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - Electro Atlas</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .email-header {
                    background-color: #007bff;
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                }
                .email-body {
                    padding: 20px;
                }
                .email-body h2 {
                    color: #007bff;
                    font-size: 20px;
                }
                .email-body p {
                    line-height: 1.6;
                    margin: 10px 0;
                }
                .reset-button {
                    display: block;
                    width: 200px;
                    margin: 20px auto;
                    padding: 15px;
                    background-color: #007bff;
                    color: #ffffff;
                    text-align: center;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: bold;
                }
                .reset-button:hover {
                    background-color: #0056b3;
                }
                .email-footer {
                    background-color: #f4f4f4;
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #888888;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    Electro Atlas
                </div>
                <div class="email-body">
                    <h2>Reset Your Password</h2>
                    <p>We received a request to reset the password for your Electro Atlas account associated with this email address. If you made this request, please click the button below to reset your password.</p>
                    <a href="${resetLink}" class="reset-button">Reset Password</a>
                    <p>If the button above doesn’t work, please copy and paste the following link into your browser:</p>
                    <p>${resetLink}</p>
                    <p><strong>Security Reminder:</strong> For your security, this link will expire in 24 hours. If you did not request a password reset, please ignore this email or contact our support team.</p>
                    <p>If you have any questions or need further assistance, feel free to reach out to us at <a href="mailto:support@electroatlas.com">support@electroatlas.com</a>.</p>
                </div>
                <div class="email-footer">
                    Thank you for choosing Electro Atlas!<br>
                    &copy; 2024 Electro Atlas. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `,
    });
});
exports.default = sendResetPasswordEmail;
//# sourceMappingURL=sendResetPasswordEmail.js.map
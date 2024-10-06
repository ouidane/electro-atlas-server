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
const sendVerificationEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, verificationCode, origin, }) {
    yield (0, sendEmail_1.default)({
        to: email,
        subject: "Confirm Your Email Address - Electro Atlas",
        html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Email Address</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                color: #333;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                background-color: #007BFF;
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
            }
            h1 {
                margin: 0;
                font-size: 24px;
            }
            .body-content {
                padding: 20px;
            }
            .code {
                display: block;
                font-size: 24px;
                font-weight: bold;
                color: #333;
                background: #f4f4f4;
                padding: 10px;
                text-align: center;
                margin: 20px 0;
                border-radius: 5px;
            }
            p {
                line-height: 1.6;
                margin: 10px 0;
            }
            a {
                color: #007BFF;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #777;
                text-align: center;
                border-top: 1px solid #f4f4f4;
                padding-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Confirm Your Email</h1>
            </div>
            <div class="body-content">
                <p>Dear User,</p>
                <p>Thank you for registering with Electro Atlas! To complete your registration, please confirm your email address by using the confirmation code provided below:</p>
                <span class="code">${verificationCode}</span>
                <p><strong>How to Confirm Your Email:</strong></p>
                <ol>
                    <li>Copy the confirmation code provided above.</li>
                    <li>Go back to our website and enter the code in the email confirmation section.</li>
                    <li>Once you submit the code, your email address will be verified, and you will be able to access all the features of your account.</li>
                </ol>
                <p>If you did not request this registration or believe this email was sent in error, please disregard this message.</p>
                <p>If you have any questions or need further assistance, feel free to reply to this email or contact our support team at <a href="mailto:support@example.com">support@example.com</a>.</p>
                <p>Thank you for choosing Electro Atlas!</p>
            </div>
            <div class="footer">
                Best regards,<br>
                The Electro Atlas Team<br>
                <a href="${origin}">Electro Atlas</a><br>
                +21205040000
            </div>
        </div>
    </body>
    </html>
    `,
    });
});
exports.default = sendVerificationEmail;
//# sourceMappingURL=sendVerificationEmail.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = exports.getMailTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// export const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST as string,
//   port: Number(process.env.SMTP_PORT as string),
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER as string,
//     pass: process.env.SMTP_PASS as string,
//   },
// });
let transporter;
const getMailTransporter = () => {
    if (transporter)
        return transporter;
    transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT ?? "587", 10),
        secure: process.env.SMTP_PORT === "465",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    transporter.verify((error) => {
        if (error) {
            console.error("❌ Nodemailer connection error:", error.message);
        }
        else {
            console.log("✅ Nodemailer ready");
        }
    });
    return transporter;
};
exports.getMailTransporter = getMailTransporter;
const sendOtpEmail = async (to, otp, subject) => {
    await (0, exports.getMailTransporter)().sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4f46e5">Preplyft</h2>
        <p>${subject}</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 0;color:#1e1b4b">${otp}</div>
        <p style="color:#6b7280;font-size:13px">This OTP expires in ${process.env.OTP_EXPIRES_IN} minutes. Do not share it with anyone.</p>
      </div>
    `,
    });
};
exports.sendOtpEmail = sendOtpEmail;
//# sourceMappingURL=mailer.js.map
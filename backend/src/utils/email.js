"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransporter = createTransporter;
exports.sendEmail = sendEmail;
const nodemailer = require('nodemailer');
let transporter = null;
function createTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        });
    }
    return transporter;
}
async function sendEmail(options) {
    const transport = createTransporter();
    await transport.sendMail({
        from: options.from || process.env.SMTP_FROM || 'noreply@nurisk.app',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    });
}
//# sourceMappingURL=email.js.map
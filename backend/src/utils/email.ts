const nodemailer = require('nodemailer');

let transporter: any = null;

export function createTransporter() {
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

export async function sendEmail(options: {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<void> {
  const transport = createTransporter();
  await transport.sendMail({
    from: options.from || process.env.SMTP_FROM || 'noreply@nurisk.app',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

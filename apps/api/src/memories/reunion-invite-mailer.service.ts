import { Injectable } from '@nestjs/common';

@Injectable()
export class ReunionInviteMailerService {
  async sendInviteEmail(recipientEmail: string, subjectLine: string, htmlBody: string) {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || 'reunion@minhdidauthe.local';

    if (!host || !user || !pass) {
      return {
        status: 'FAILED',
        sentAt: null,
        errorMessage: 'Missing SMTP configuration',
      } as const;
    }

    const loadNodemailer = new Function('return import("nodemailer")') as () => Promise<any>;
    const nodemailer = await loadNodemailer();
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });

    try {
      await transporter.sendMail({
        from,
        to: recipientEmail,
        subject: subjectLine,
        html: htmlBody,
      });
      return {
        status: 'SENT',
        sentAt: new Date(),
        errorMessage: null,
      } as const;
    } catch (error) {
      return {
        status: 'FAILED',
        sentAt: null,
        errorMessage: error instanceof Error ? error.message : 'SMTP send failed',
      } as const;
    }
  }
}

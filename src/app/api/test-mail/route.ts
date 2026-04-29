import { sendEmail } from '@/lib/email';

export async function GET() {
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'skybirds@skybirds.net',
      subject: 'Test Email from Sky Birds',
      html: '<h2>This is a test email from your Next.js app using Microsoft 365 SMTP.</h2><p>If you received this, your mail setup is working!</p>'
    });
    return new Response('Test email sent successfully!', { status: 200 });
  } catch (error) {
    return new Response('Failed to send test email: ' + error, { status: 500 });
  }
}

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const embeddedLogoDataUri = (() => {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'assets', 'images', 'skybird-logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch {
    return null;
  }
})();

function emailBrandMarkup() {
  if (embeddedLogoDataUri) {
    return `<img src="${embeddedLogoDataUri}" alt="Sky Bird" style="width: 180px; height: auto; display: inline-block;" />`;
  }

  return `<h1 style="color: #0F1F3D; font-size: 28px; margin: 0;">Sky<span style="color: #E8A020;">Birds</span></h1>`;
}

interface EmailOptions {
  to: string;
  cc?: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, cc, subject, html }: EmailOptions) {
  return transporter.sendMail({
    from: `"Sky Birds" <${process.env.SMTP_USER}>`,
    to,
    cc,
    subject,
    html,
  });
}

export function verificationEmailTemplate(name: string, verifyUrl: string) {
  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        ${emailBrandMarkup()}
      </div>
      <div style="background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(15,31,61,0.08);">
        <h2 style="color: #0F1F3D; font-size: 22px; margin: 0 0 16px;">Verify Your Email</h2>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">Welcome to Sky Birds! Please verify your email address by clicking the button below.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="background: #0F1F3D; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #8A96A8; font-size: 13px; line-height: 1.6;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
      </div>
      <p style="color: #8A96A8; font-size: 12px; text-align: center; margin-top: 24px;">© 2026 Sky Birds. All rights reserved.</p>
    </div>
  `;
}

export function resetPasswordEmailTemplate(name: string, resetUrl: string) {
  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        ${emailBrandMarkup()}
      </div>
      <div style="background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(15,31,61,0.08);">
        <h2 style="color: #0F1F3D; font-size: 22px; margin: 0 0 16px;">Reset Your Password</h2>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">We received a request to reset your password. Click the button below to set a new password.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: #E8A020; color: #0F1F3D; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #8A96A8; font-size: 13px; line-height: 1.6;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
      <p style="color: #8A96A8; font-size: 12px; text-align: center; margin-top: 24px;">© 2026 Sky Birds. All rights reserved.</p>
    </div>
  `;
}

export function contactNotificationTemplate(data: {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  destination: string;
  travelers: string;
  message: string;
}) {
  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        ${emailBrandMarkup()}
      </div>
      <div style="background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(15,31,61,0.08);">
        <h2 style="color: #0F1F3D; font-size: 22px; margin: 0 0 16px;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #8A96A8; font-size: 13px;">Name</td><td style="padding: 8px 0; color: #0F1F3D; font-size: 14px; font-weight: 600;">${data.fullName}</td></tr>
          <tr><td style="padding: 8px 0; color: #8A96A8; font-size: 13px;">Email</td><td style="padding: 8px 0; color: #0F1F3D; font-size: 14px;">${data.email}</td></tr>
          <tr><td style="padding: 8px 0; color: #8A96A8; font-size: 13px;">Phone</td><td style="padding: 8px 0; color: #0F1F3D; font-size: 14px;">${data.phone}</td></tr>
          <tr><td style="padding: 8px 0; color: #8A96A8; font-size: 13px;">Company</td><td style="padding: 8px 0; color: #0F1F3D; font-size: 14px;">${data.company}</td></tr>
          <tr><td style="padding: 8px 0; color: #8A96A8; font-size: 13px;">Destination</td><td style="padding: 8px 0; color: #0F1F3D; font-size: 14px;">${data.destination}</td></tr>
          <tr><td style="padding: 8px 0; color: #8A96A8; font-size: 13px;">Travelers</td><td style="padding: 8px 0; color: #0F1F3D; font-size: 14px;">${data.travelers}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #FAF9F6; border-radius: 12px;">
          <p style="color: #8A96A8; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
          <p style="color: #0F1F3D; font-size: 14px; line-height: 1.6; margin: 0;">${data.message}</p>
        </div>
      </div>
    </div>
  `;
}

export function bookingConfirmationTemplate(data: {
  name: string;
  destination: string;
  travelDate: string;
  returnDate: string;
  travelers: number;
  amount: string;
  bookingId: string;
}) {
  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF9F6; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        ${emailBrandMarkup()}
      </div>
      <div style="background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(15,31,61,0.08);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 64px; height: 64px; background: rgba(42,127,212,0.1); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 28px;">✈️</span>
          </div>
          <h2 style="color: #0F1F3D; font-size: 22px; margin: 0;">Booking Confirmed!</h2>
        </div>
        <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">Hi ${data.name}, your booking has been confirmed.</p>
        <div style="background: #FAF9F6; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #8A96A8; font-size: 13px;">Booking ID</td><td style="padding: 6px 0; color: #0F1F3D; font-size: 14px; font-weight: 700;">${data.bookingId}</td></tr>
            <tr><td style="padding: 6px 0; color: #8A96A8; font-size: 13px;">Destination</td><td style="padding: 6px 0; color: #0F1F3D; font-size: 14px;">${data.destination}</td></tr>
            <tr><td style="padding: 6px 0; color: #8A96A8; font-size: 13px;">Travel Date</td><td style="padding: 6px 0; color: #0F1F3D; font-size: 14px;">${data.travelDate}</td></tr>
            <tr><td style="padding: 6px 0; color: #8A96A8; font-size: 13px;">Return Date</td><td style="padding: 6px 0; color: #0F1F3D; font-size: 14px;">${data.returnDate}</td></tr>
            <tr><td style="padding: 6px 0; color: #8A96A8; font-size: 13px;">Travelers</td><td style="padding: 6px 0; color: #0F1F3D; font-size: 14px;">${data.travelers}</td></tr>
            <tr><td style="padding: 6px 0; color: #8A96A8; font-size: 13px;">Amount Paid</td><td style="padding: 6px 0; color: #2A7FD4; font-size: 16px; font-weight: 700;">₹${data.amount}</td></tr>
          </table>
        </div>
        <p style="color: #8A96A8; font-size: 13px; line-height: 1.6;">Our team will reach out with your detailed itinerary within 24 hours.</p>
      </div>
      <p style="color: #8A96A8; font-size: 12px; text-align: center; margin-top: 24px;">© 2026 Sky Birds. All rights reserved.</p>
    </div>
  `;
}

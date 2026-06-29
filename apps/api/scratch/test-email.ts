import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

console.log('Using SMTP Configuration:');
console.log('Host:', smtpHost);
console.log('Port:', smtpPort);
console.log('User:', smtpUser);
console.log('Password length:', smtpPass ? smtpPass.length : 0);

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  family: 4 // Force IPv4
} as nodemailer.TransportOptions);

async function run() {
  console.log('Sending test email...');
  const info = await transporter.sendMail({
    from: `"Xavier 300 Test" <${smtpUser}>`,
    to: 'clasptek@gmail.com',
    subject: 'OTP test from local machine',
    text: 'If you receive this, the SMTP transporter configuration is correct!',
    html: '<b>If you receive this, the SMTP transporter configuration is correct!</b>'
  });
  console.log('Email sent successfully!', info.messageId);
}

run().catch(console.error);

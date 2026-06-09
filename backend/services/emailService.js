const nodemailer = require('nodemailer');

/**
 * Smart Email Service - Supports both Mock and Production environments
 * Strictly follows Project Requirement Milestone 7 (Mock Nodemailer)
 * while remaining Production-Ready for Deployment.
 */
const sendEmail = async (options) => {
  const isProductionReady = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (!isProductionReady) {
    // --- [MOCK MODE] ---
    // Strictly follows "Mock Nodemailer" requirement for development/demo
    console.log('\n--- [MOCK EMAIL SERVICE] ---');
    console.log(`STATUS: SMTP Credentials missing - Operating in Mock Mode (Milestone 7)`);
    console.log(`TO: ${options.email}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`MESSAGE CONTENT:\n${options.message}`);
    console.log('--- [END OF MOCK EMAIL] ---\n');
    return { messageId: 'mock-id-' + Date.now() };
  }

  // --- [PRODUCTION MODE] ---
  // Uses Real SMTP for actual email delivery to user inboxes after deployment
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Production Email Sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('SMTP Delivery Error:', error.message);
    throw new Error('Email service failed');
  }
};

module.exports = sendEmail;

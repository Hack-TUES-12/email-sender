import 'dotenv/config';
import { sendEmail } from './sendEmail';
import { createTransportFromEnv } from './transport';

async function main() {
  try {
    console.log('Creating transport...');
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER,
    });
    // Create transport (verify connection)
    const transport = await createTransportFromEnv();
    console.log('Transport created successfully!');

    console.log('Sending email...');
    // Send email using the transport
    await sendEmail(transport, {
      to: 'martin.v.velchev.2022@elsys-bg.org',
      subject: 'Test Email',
      from: 'team@mail.hack-tues.com',
      text: 'This is a plain text email',
      html: '<h1>This is an HTML email</h1><p>This is a test email sent via nodemailer.</p>',
    });
    console.log('Email process completed!');
  } catch (error) {
    console.error('Error sending email:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Uncomment to run
main();

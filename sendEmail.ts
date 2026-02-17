import { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Sends an email using a nodemailer transport
 * @param transport - Nodemailer transport instance
 * @param emailOptions - Email content and recipient options
 * @returns Promise that resolves when email is sent
 */
export async function sendEmail(
  transport: Transporter,
  emailOptions: EmailOptions
): Promise<void> {
  
  // Prepare mail options
  const mailOptions = {
    from: emailOptions.from,
    to: Array.isArray(emailOptions.to) 
      ? emailOptions.to.join(', ') 
      : emailOptions.to,
    subject: emailOptions.subject,
    text: emailOptions.text,
    html: emailOptions.html,
    replyTo: emailOptions.replyTo,
  };

  try {
    console.log('Attempting to send email to:', mailOptions.to);
    console.log('From:', mailOptions.from);
    
    // Send email with timeout handling
    const info = await Promise.race([
      transport.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout after 60 seconds')), 60000)
      )
    ]) as any;

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    throw error;
  }
}



interface HackTUESEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  fromName?: string; // Default: "team"
}

/**
 * Sends an email using Hack TUES email configuration
 * Constructs the from address as {fromName}@{EMAIL_DOMAIN}
 * Uses REPLY_TO_ADDRESS environment variable for the reply-to field
 * @param transport - Nodemailer transport instance
 * @param emailOptions - Email content and recipient options
 * @param fromName - Name part of the sender email (default: "team")
 * @returns Promise that resolves when email is sent
 * @throws Error if EMAIL_DOMAIN environment variable is not set
 */
export async function sendHackTUESEmail(
  transport: Transporter,
  emailOptions: HackTUESEmailOptions
): Promise<void> {
  const domain = process.env.EMAIL_DOMAIN;
  if (!domain) {
    throw new Error('EMAIL_DOMAIN environment variable is required');
  }

  const fromName = emailOptions.fromName || 'team';
  const fromAddress = `${fromName}@${domain}`;

  const replyToAddress = process.env.REPLY_TO_ADDRESS;

  // Call sendEmail with the constructed from address
  await sendEmail(transport, {
    to: emailOptions.to,
    subject: emailOptions.subject,
    text: emailOptions.text,
    html: emailOptions.html,
    from: fromAddress,
    replyTo: replyToAddress,
  });
}

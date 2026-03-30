import { Transporter } from 'nodemailer';

interface EmailAttachment {
  filename: string;
  path: string;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string | { name: string; address: string; };
  replyTo?: string;
  attachments?: EmailAttachment[];
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
    attachments: emailOptions.attachments,
    headers: {
      'List-Unsubscribe': '<mailto:hacktues@elsys-bg.org>',
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'Precedence': 'bulk',
    }
  };

  try {
    const recipient = Array.isArray(emailOptions.to) ? emailOptions.to.join(', ') : emailOptions.to;
    console.log(`Sending to ${recipient}`);
    
    // Send email with timeout handling
    await Promise.race([
      transport.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout after 60 seconds')), 60000)
      )
    ]);
  } catch (error: any) {
    throw error;
  }
}



export interface HackTUESEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  fromName?: string; // Default: "team"
  attachments?: EmailAttachment[];
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
  const fromWithName = {
    name: 'Hack TUES 12 Team',
    address: fromAddress
  };

  const replyToAddress = process.env.REPLY_TO_ADDRESS;

  // Call sendEmail with the constructed from address
  await sendEmail(transport, {
    to: emailOptions.to,
    subject: emailOptions.subject,
    text: emailOptions.text,
    html: emailOptions.html,
    from: fromWithName,
    replyTo: replyToAddress,
    attachments: emailOptions.attachments,
  });
}

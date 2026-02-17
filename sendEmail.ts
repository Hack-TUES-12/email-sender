import { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
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

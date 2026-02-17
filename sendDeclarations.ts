import { bulkSendHT } from './bulkSendHT';
import { HackTUESEmailOptions } from './sendEmail';

/**
 * Main function to send declaration emails
 */
async function sendDeclarations() {
  try {
    // Define email options
    const emailOptions: Omit<HackTUESEmailOptions, 'to'> = {
      subject: 'Hack TUES Declaration',
      html: '<p>Your declaration email content <a href="https://hack-tues.com">here</a>.</p>',
      fromName: "team"
    };

    // Call bulkSendHT with the email options
    await bulkSendHT(emailOptions);
    
  } catch (error: any) {
    console.error('\n=== Error ===');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the function
sendDeclarations();

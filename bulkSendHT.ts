import 'dotenv/config';
import readline from 'readline';
import { readRecipients } from './readRecipients';
import { createTransportFromEnv } from './transport';
import { sendHackTUESEmail, HackTUESEmailOptions } from './sendEmail';

/**
 * Prompts the user and waits for them to press Enter to continue
 */
function waitForUserInput(prompt: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

/**
 * Sends Hack TUES emails to multiple recipients in bulk
 * Handles all steps: reading recipients, creating transport, test email, and bulk sending
 * @param emailOptions - Email options (subject, text, html, fromName) - 'to' field will be set per recipient
 * @throws Error if email sending fails for any recipient (exits program)
 */
export async function bulkSendHT(
  emailOptions: Omit<HackTUESEmailOptions, 'to'>
): Promise<void> {
  try {
    console.log('=== Hack TUES Email Bulk Sender ===\n');

    // Step 1: Read recipients from file
    console.log('Step 1: Reading recipients from input.txt...');
    const recipients = readRecipients();
    
    if (recipients.length === 0) {
      throw new Error('No recipients found in input.txt');
    }

    console.log(`\nFound ${recipients.length} recipient(s):`);
    recipients.forEach((email, index) => {
      console.log(`  ${index + 1}. ${email}`);
    });

    // Step 2: Pause until user verifies to proceed
    console.log('\n--- Verification Required ---');
    await waitForUserInput('Press Enter to proceed with creating an SMTP transport... ');

    // Step 3: Create transport
    console.log('\nStep 2: Creating SMTP transport...');
    const transport = await createTransportFromEnv();
    console.log('Transport created successfully!');

    // Step 4: Log transport data
    console.log('\n--- Transport Configuration ---');
    console.log('SMTP Host:', process.env.SMTP_HOST);
    console.log('SMTP Port:', process.env.SMTP_PORT);
    console.log('SMTP Secure:', process.env.SMTP_SECURE || 'auto-detected');
    console.log('SMTP User:', process.env.SMTP_USER);
    console.log('Email Domain:', process.env.EMAIL_DOMAIN);
    console.log('Reply-To Address:', process.env.REPLY_TO_ADDRESS);

    // Step 5: Pause until user accepts to proceed
    console.log('\n--- Confirmation Required ---');
    await waitForUserInput('Review the transport configuration above. Press Enter to proceed with sending a test email... ');

    // Step 6: Send test email to TEST_RECIPIENT
    const testRecipient = process.env.TEST_RECIPIENT;
    if (!testRecipient) {
      throw new Error('TEST_RECIPIENT environment variable is required');
    }

    console.log('\nStep 3: Sending test email to verify connection...');
    console.log(`Test recipient: ${testRecipient}`);
    
    await sendHackTUESEmail(transport, {
        to: testRecipient,
        ...emailOptions
    });

    console.log('Test email sent successfully!');

    // Step 7: Pause until user proceeds
    console.log('\n--- Test Email Sent ---');
    await waitForUserInput('Check your test email. Press Enter to start sending to all recipients... ');

    // Step 8: Send emails to all recipients
    console.log('\nStep 4: Sending emails to all recipients...');
    console.log(`Total recipients: ${recipients.length}\n`);

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const emailNumber = i + 1;

      try {
        console.log(`[${emailNumber}/${recipients.length}] Sending to: ${recipient}`);
        
        await sendHackTUESEmail(transport, {
          ...emailOptions,
          to: recipient,
        });

        console.log(`✓ Email ${emailNumber} sent successfully\n`);

        // Pause for 2 seconds every 5 recipients
        if ((i + 1) % 5 === 0 && i < recipients.length - 1) {
          console.log('--- Pausing for 5 seconds (every 5 emails) ---');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error: any) {
        console.error(`\n✗ Failed to send email ${emailNumber} to ${recipient}`);
        console.error('Error:', error.message);
        console.error(`\nProgram exited due to email send failure.`);
        throw error;
      }
    }

    console.log('\n=== Email Sending Complete ===');
    console.log(`Successfully sent emails to all ${recipients.length} recipient(s)`);
    
  } catch (error: any) {
    console.error('\n=== Error ===');
    console.error('Error:', error.message);
    throw error;
  }
}

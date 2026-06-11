import 'dotenv/config';
import readline from 'readline';
import { createTransportFromEnv } from './transport';
import { sendHackTUESEmail } from './sendEmail';
import { readMentors } from './readMentors';

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

function buildEmailOptions(discordJoinToken: string) {
  return {
    subject: 'Ментори Hack TUES 12',
    text: `Здравейте,

      Благодарим, че ще бъдете ментор на Hack TUES 12! Без Вас събитието не би било същото!

      На 17 март (вторник) от 20:30 ще се проведе онлайн информационна среща за всички ментори, на която ще Ви запознаем с необходимата информация за предстоящото събитие. В случай, че нямате възможност да се включите, ще направим запис от срещата и ще Ви го изпратим. Линк към срещата може да намерите тук:
      https://meet.google.com/ikp-syic-rgd

      Молим Ви да попълните анкета за информирано съгласие (в срок до 16 март):
      https://docs.google.com/forms/d/e/1FAIpQLScupMXOUoGLWplz-sjqEMjPqdSixRih2uMH0kJ7Rcsv46qTcw/viewform

      Отделно ще се радваме, ако се запознаете с наръчника на ментора чрез следния survival guide:
      https://docs.google.com/document/d/1d-mq7hqDUZPCh3DkE96dlyckHsXq8AriQKLNANfpLzA/edit?usp=sharing

      За да продължим комуникацията си занапред, както и с участниците може да се присъедините към нашия Discord сървър:
      https://hack-tues.com/api/discord/mentor?token=${discordJoinToken}
      При възникнала грешка може да влезете и от тук: https://discord.gg/P3UxFqbS

      При въпроси или нужда от съдействие оставаме на разположение.

      Очакваме Ви с нетърпение!

      Поздрави,
      Екипът на Hack TUES 12`,
    html: `<div>Здравейте,

      <p>Благодарим, че ще бъдете ментор на Hack TUES 12! Без Вас събитието не би било същото!</p>

      <p>На <strong>17 март (вторник)</strong> от <strong>20:30</strong> ще се проведе онлайн информационна среща за всички ментори, на която ще Ви запознаем с необходимата информация за предстоящото събитие. В случай, че нямате възможност да се включите, ще направим запис от срещата и ще Ви го изпратим. Линк към срещата може да намерите <a href="https://meet.google.com/ikp-syic-rgd">тук</a>.</p>

      <p>Молим Ви да попълните анкета за информирано съгласие (в срок до 16 март) <a href="https://docs.google.com/forms/d/e/1FAIpQLScupMXOUoGLWplz-sjqEMjPqdSixRih2uMH0kJ7Rcsv46qTcw/viewform?usp=dialog">тук</a>.</p>

      <p>Отделно ще се радваме, ако се запознаете с наръчника на ментора чрез следния <a href="https://docs.google.com/document/d/1d-mq7hqDUZPCh3DkE96dlyckHsXq8AriQKLNANfpLzA/edit?usp=sharing">survival guide</a>.</p>

      <p>За да продължим комуникацията си занапред, както и с участниците може да се присъедините към нашия <a href="https://hack-tues.com/api/discord/mentor?token=${discordJoinToken}">Discord сървър</a>. При възникнала грешка може да влезете и от <a href="https://discord.gg/P3UxFqbS">тук</a>.</p>

      <p>При въпроси или нужда от съдействие оставаме на разположение.</p>

      <p>Очакваме Ви с нетърпение!</p>

      <p>Поздрави,<br/>
      Екипът на Hack TUES 12</p>
</div>`,
    fromName: 'team',
  };
}

/**
 * Main function to send mentor invite emails
 */
async function sendMentorInvites() {
  try {
    console.log('=== Hack TUES Email Bulk Sender ===\n');

    // Step 1: Read mentors from Excel
    console.log('Step 1: Reading mentors from mentors.xlsx...');
    const mentors = readMentors();

    if (mentors.length === 0) {
      throw new Error('No mentors found in mentors.xlsx');
    }

    console.log(`\nFound ${mentors.length} mentor(s):`);
    mentors.forEach((mentor, index) => {
      // console.log(`  ${index + 1}. ${mentor.email}`);
      console.log(mentor)
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
      ...buildEmailOptions('TEST_TOKEN'),
    });

    console.log('Test email sent successfully!');

    // Step 7: Pause until user proceeds
    console.log('\n--- Test Email Sent ---');
    await waitForUserInput('Check your test email. Press Enter to start sending to all recipients... ');

    // Step 8: Send emails to all mentors with their individual tokens
    console.log('\nStep 4: Sending emails to all mentors...');
    console.log(`Total mentors: ${mentors.length}\n`);

    for (let i = 0; i < mentors.length; i++) {
      const mentor = mentors[i];
      const emailNumber = i + 1;

      try {
        console.log(`[${emailNumber}/${mentors.length}] Sending to: ${mentor.email}`);

        await sendHackTUESEmail(transport, {
          to: mentor.email,
          ...buildEmailOptions(mentor.discord_join_token),
        });

        console.log(`✓ Email ${emailNumber} sent successfully\n`);

        // Pause for 5 seconds every 5 recipients
        if ((i + 1) % 5 === 0 && i < mentors.length - 1) {
          console.log('--- Pausing for 5 seconds (every 5 emails) ---');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error: any) {
        console.error(`\n✗ Failed to send email ${emailNumber} to ${mentor.email}`);
        console.error('Error:', error.message);
        console.error(`\nProgram exited due to email send failure.`);
        throw error;
      }
    }

    console.log('\n=== Email Sending Complete ===');
    console.log(`Successfully sent emails to all ${mentors.length} mentor(s)`);

  } catch (error: any) {
    console.error('\n=== Error ===');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the function
sendMentorInvites();

import 'dotenv/config';
import path from 'path';
import readline from 'readline';
import { createTransportFromEnv } from './transport';
import { sendHackTUESEmail } from './sendEmail';
import { readRecipients } from './readRecipients';

const PHOTOS_URL = "https://drive.google.com/drive/folders/1JZ2QTcRt1PMgyFFJ09_8ZDgCMoRHM0_V?usp=sharing"

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

function buildEmailOptions() {
  return {
    subject: 'Снимки от TUES Fest 2026',
    text: `Здравейте, скъпи участници!

Мина почти месец от провеждането на десетото юбилейно издание на TUES Fest - денят, в който показваме на света какво всъщност означава да си ТУЕС-ар.
Тазгодишното издание на феста събра 156 проекта, 8 battle bot-a и над 8000 посетители.
Искрено благодарим на всеки един от вас, че се включи и стана част от деня на отворените врати на нашето училище - събитие, което ще остане в сърцата ни до живот.

Надяваме се да сте си прекарали добре и да сте си създали незабравими спомени.
На този линк можете да разгледате снимките от събитието:
${PHOTOS_URL}
Благодарим ви за търпението.

Очакваме ви догодина - някои от вас и в ролята на организатори ;)

Поздрави,
Екипът на Hack TUES 12 и TUES Fest 2026`,
    html: `<div>
      <p>Здравейте, скъпи участници!</p>

      <p>Мина почти месец от провеждането на десетото юбилейно издание на TUES Fest - денят, в който показваме на света какво всъщност означава да си ТУЕС-ар.<br/>
      Тазгодишното издание на феста събра 156 проекта, 8 battle bot-a и над 8000 посетители.<br/>
      Искрено благодарим на всеки един от вас, че се включи и стана част от деня на отворените врати на нашето училище - събитие, което ще остане в сърцата ни до живот.</p>

      <p>Надяваме се да сте си прекарали добре и да сте си създали незабравими спомени.<br/>
      На <a href="${PHOTOS_URL}">този линк</a> можете да разгледате снимките от събитието. Благодарим ви за търпението.</p>

      <p>Очакваме ви догодина - някои от вас и в ролята на организатори ;)</p>

      <p>Поздрави,<br/>
      Екипът на Hack TUES 12 и TUES Fest 2026</p>
</div>`,
    fromName: 'team',
  };
}

async function sendTFPhotos() {
  try {
    console.log('=== Hack TUES Email Bulk Sender — TF Photos ===\n');

    // Step 1: Read recipients from tf-participant-emails.txt
    console.log('Step 1: Reading recipients from tf-participant-emails.txt...');
    const recipientsFile = path.join(process.cwd(), 'tf-participant-emails.txt');
    const recipients = readRecipients(recipientsFile);

    if (recipients.length === 0) {
      throw new Error('No recipients found in tf-participant-emails.txt');
    }

    console.log(`\nFound ${recipients.length} recipient(s):`);
    recipients.forEach((email, index) => {
      console.log(`  ${index + 1}. ${email}`);
    });

    // Step 2: Pause until user verifies the list
    console.log('\n--- Verification Required ---');
    await waitForUserInput('Press Enter to proceed with creating an SMTP transport... ');

    // Step 3: Create transport
    console.log('\nStep 2: Creating SMTP transport...');
    const transport = await createTransportFromEnv();
    console.log('Transport created successfully!');

    console.log('\n--- Transport Configuration ---');
    console.log('SMTP Host:', process.env.SMTP_HOST);
    console.log('SMTP Port:', process.env.SMTP_PORT);
    console.log('SMTP Secure:', process.env.SMTP_SECURE || 'auto-detected');
    console.log('SMTP User:', process.env.SMTP_USER);
    console.log('Email Domain:', process.env.EMAIL_DOMAIN);
    console.log('Reply-To Address:', process.env.REPLY_TO_ADDRESS);

    // Step 4: Send test email
    console.log('\n--- Confirmation Required ---');
    await waitForUserInput('Review the transport configuration above. Press Enter to proceed with sending a test email... ');

    const testRecipient = process.env.TEST_RECIPIENT;
    if (!testRecipient) {
      throw new Error('TEST_RECIPIENT environment variable is required');
    }

    console.log('\nStep 3: Sending test email to verify connection...');
    console.log(`Test recipient: ${testRecipient}`);

    await sendHackTUESEmail(transport, {
      to: testRecipient,
      ...buildEmailOptions(),
    });

    console.log('Test email sent successfully!');

    // Step 5: Send to all recipients
    console.log('\n--- Test Email Sent ---');
    await waitForUserInput('Check your test email. Press Enter to start sending to all TF participants... ');

    console.log('\nStep 4: Sending photo emails to all TF participants...');
    console.log(`Total recipients: ${recipients.length}\n`);

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const emailNumber = i + 1;

      try {
        console.log(`[${emailNumber}/${recipients.length}] Sending to: ${recipient}`);

        await sendHackTUESEmail(transport, {
          to: recipient,
          ...buildEmailOptions(),
        });

        console.log(`✓ Email ${emailNumber} sent successfully\n`);

        if ((i + 1) % 5 === 0 && i < recipients.length - 1) {
          console.log('--- Pausing for 5 seconds (every 5 emails) ---');
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch (error: any) {
        console.error(`\n✗ Failed to send email ${emailNumber} to ${recipient}`);
        console.error('Error:', error.message);
        console.error('\nProgram exited due to email send failure.');
        throw error;
      }
    }

    console.log('\n=== Email Sending Complete ===');
    console.log(`Successfully sent photo emails to all ${recipients.length} recipient(s)`);
  } catch (error: any) {
    console.error('\n=== Error ===');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

sendTFPhotos();

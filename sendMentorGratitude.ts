import 'dotenv/config';
import readline from 'readline';
import { createTransportFromEnv } from './transport';
import { sendHackTUESEmail } from './sendEmail';
import { readMentors } from './readMentors';

const PHOTOS_URL = "https://drive.google.com/drive/folders/1NG8PXI9g4DabOqBcKyGWGsU9_L2ghObI?usp=share_link"

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

function buildEmailOptions(name: string) {
  return {
    subject: 'Благодарности от Hack TUES 12',
    text: `Здравейте, ${name},

Благодарим ви, че станахте част от дванадесетото издание на Hack TUES! Изключително щастливи сме, че заедно работихме за осъществяването на това емблематично за ТУЕС събитие! Надяваме се догодина отново да помогнете на учениците да реализират един невероятен проект!

Избрани снимки от работните дни на хакатона може да намерите тук: ${PHOTOS_URL}

Благодарим ви отново за участието ви и че заедно написахме история с тазгодишното издание на Hack TUES!

Надяваме се да имате възможност да присъствате и на TUES Fest 2026, който ще се проведе на 26-ти април 2026 във форум "Джон Атанасов", София тех парк.

Оставаме насреща за въпроси!`,
    html: `<div>
      <p>Здравейте, ${name},</p>

      <p>Благодарим ви, че станахте част от дванадесетото издание на Hack TUES! Изключително щастливи сме, че заедно работихме за осъществяването на това емблематично за ТУЕС събитие! Надяваме се догодина отново да помогнете на учениците да реализират един невероятен проект!</p>

      <p>Избрани снимки от работните дни на хакатона може да намерите <a href="${PHOTOS_URL}">тук</a>.</p>

      <p>Благодарим ви отново за участието ви и че заедно написахме история с тазгодишното издание на Hack TUES!</p>

      <p>Надяваме се да имате възможност да присъствате и на <strong>TUES Fest 2026</strong>, който ще се проведе на <strong>26-ти април 2026</strong> във форум "Джон Атанасов", София тех парк.</p>

      <p>Оставаме насреща за въпроси!</p>
</div>`,
    fromName: 'team',
  };
}

async function sendMentorGratitude() {
  try {
    console.log('=== Hack TUES Email Bulk Sender — Mentor Gratitude ===\n');

    // Step 1: Read mentors from Excel
    console.log('Step 1: Reading mentors from mentors.xlsx...');
    const mentors = readMentors();

    if (mentors.length === 0) {
      throw new Error('No mentors found in mentors.xlsx');
    }

    console.log(`\nFound ${mentors.length} mentor(s):`);
    mentors.forEach((mentor) => console.log(`  - ${mentor.name} <${mentor.email}>`));

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
      ...buildEmailOptions(mentors[0].name),
    });

    console.log('Test email sent successfully!');

    // Step 5: Send to all mentors
    console.log('\n--- Test Email Sent ---');
    await waitForUserInput('Check your test email. Press Enter to start sending to all mentors... ');

    console.log('\nStep 4: Sending gratitude emails to all mentors...');
    console.log(`Total mentors: ${mentors.length}\n`);

    for (let i = 0; i < mentors.length; i++) {
      const mentor = mentors[i];
      const emailNumber = i + 1;

      try {
        console.log(`[${emailNumber}/${mentors.length}] Sending to: ${mentor.email} (${mentor.name})`);

        await sendHackTUESEmail(transport, {
          to: mentor.email,
          ...buildEmailOptions(mentor.name),
        });

        console.log(`✓ Email ${emailNumber} sent successfully\n`);

        if ((i + 1) % 5 === 0 && i < mentors.length - 1) {
          console.log('--- Pausing for 5 seconds (every 5 emails) ---');
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch (error: any) {
        console.error(`\n✗ Failed to send email ${emailNumber} to ${mentor.email}`);
        console.error('Error:', error.message);
        console.error('\nProgram exited due to email send failure.');
        throw error;
      }
    }

    console.log('\n=== Email Sending Complete ===');
    console.log(`Successfully sent gratitude emails to all ${mentors.length} mentor(s)`);
  } catch (error: any) {
    console.error('\n=== Error ===');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

sendMentorGratitude();

import 'dotenv/config';
import path from 'path';
import readline from 'readline';
import { createTransportFromEnv } from './transport';
import { sendHackTUESEmail } from './sendEmail';
import { readTFParticipants } from './readTFParticipants';

const FEEDBACK_FORM_URL = "https://forms.gle/Cbigq6zwuyCwRETV7"

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

function buildEmailOptions(name: string, certPath: string) {
  return {
    subject: 'Сертификат за участие и обратна връзка за TUES Fest 2026',
    text: `Здравейте, скъпи участници!

TUES Fest 2026 приключи успешно. Благодарим ви, че се включихте и че допринесохте за това да покажем на света какво означава да бъдеш ТУЕС-ар!
Надяваме се, че сте си прекарали страхотно по време на събитието.

Като прикачен файл ще видите сертификатът си за участие.

Молим ви да попълните анкетата за обратна връзка за феста тук: ${FEEDBACK_FORM_URL}. За нас е наистина важно да разберем кои аспекти на събитието могат да бъдат подобрени в бъдеще.

Поздрави,
Организационният екип на Hack TUES 12 и TUES Fest 2026`,
    html: `<div>
      <p>Здравейте, скъпи участници!</p>

      <p>TUES Fest 2026 приключи успешно. Благодарим ви, че се включихте и че допринесохте за това да покажем на света какво означава да бъдеш ТУЕС-ар!<br/>
      Надяваме се, че сте си прекарали страхотно по време на събитието.</p>

      <p>Като прикачен файл ще видите сертификатът си за участие.</p>

      <p>Молим ви да попълните анкетата за обратна връзка за феста <a href="${FEEDBACK_FORM_URL}">тук</a>. За нас е наистина важно да разберем кои аспекти на събитието могат да бъдат подобрени в бъдеще.</p>

      <p>Поздрави,<br/>
      Организационният екип на Hack TUES 12 и TUES Fest 2026</p>
</div>`,
    fromName: 'team',
    attachments: [
      {
        filename: `${name}.pdf`,
        path: certPath,
      },
    ],
  };
}

async function sendTFCertificates() {
  try {
    console.log('=== Hack TUES Email Bulk Sender — TF Certificates ===\n');

    // Step 1: Read TF participants from Excel
    console.log('Step 1: Reading TF participants from tf-participants.xlsx...');
    const participants = readTFParticipants();

    if (participants.length === 0) {
      throw new Error('No TF participants found in tf-participants.xlsx');
    }

    console.log(`\nFound ${participants.length} TF participant(s):`);
    participants.forEach((p) => console.log(`  - ${p.name} <${p.email}>`));

    // Step 2: Resolve certificate paths and verify all exist
    const inputDir = path.join(process.cwd(), 'input-tf');
    const withCerts = participants.map((p) => ({
      ...p,
      certPath: path.join(inputDir, `${p.name}.pdf`),
    }));

    // Step 3: Pause until user verifies the list
    console.log('\n--- Verification Required ---');
    await waitForUserInput('Press Enter to proceed with creating an SMTP transport... ');

    // Step 4: Create transport
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

    // Step 5: Send test email
    console.log('\n--- Confirmation Required ---');
    await waitForUserInput('Review the transport configuration above. Press Enter to proceed with sending a test email... ');

    const testRecipient = process.env.TEST_RECIPIENT;
    if (!testRecipient) {
      throw new Error('TEST_RECIPIENT environment variable is required');
    }

    console.log('\nStep 3: Sending test email to verify connection...');
    console.log(`Test recipient: ${testRecipient}`);

    const firstParticipant = withCerts[0];
    await sendHackTUESEmail(transport, {
      to: testRecipient,
      ...buildEmailOptions(firstParticipant.name, firstParticipant.certPath),
    });

    console.log('Test email sent successfully!');

    // Step 6: Send to all participants
    console.log('\n--- Test Email Sent ---');
    await waitForUserInput('Check your test email. Press Enter to start sending to all TF participants... ');

    console.log('\nStep 4: Sending certificates to all TF participants...');
    console.log(`Total TF participants: ${withCerts.length}\n`);

    for (let i = 0; i < withCerts.length; i++) {
      const participant = withCerts[i];
      const emailNumber = i + 1;

      try {
        console.log(`[${emailNumber}/${withCerts.length}] Sending to: ${participant.email} (${participant.name})`);

        await sendHackTUESEmail(transport, {
          to: participant.email,
          ...buildEmailOptions(participant.name, participant.certPath),
        });

        console.log(`✓ Email ${emailNumber} sent successfully\n`);

        if ((i + 1) % 5 === 0 && i < withCerts.length - 1) {
          console.log('--- Pausing for 5 seconds (every 5 emails) ---');
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch (error: any) {
        console.error(`\n✗ Failed to send email ${emailNumber} to ${participant.email}`);
        console.error('Error:', error.message);
        console.error('\nProgram exited due to email send failure.');
        throw error;
      }
    }

    console.log('\n=== Email Sending Complete ===');
    console.log(`Successfully sent certificates to all ${withCerts.length} TF participant(s)`);
  } catch (error: any) {
    console.error('\n=== Error ===');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

sendTFCertificates();
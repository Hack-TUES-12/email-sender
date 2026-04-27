import 'dotenv/config';
import { bulkSendHT } from './bulkSendHT';
import { HackTUESEmailOptions } from './sendEmail';

async function sendTF() {
  try {
    const emailOptions: Omit<HackTUESEmailOptions, 'to'> = {
      subject: 'Важна информация за TUES Fest 2026',
      text: `Здравейте,

Има лека промяна в самото разпределение по маси вътре в залата, прикачваме скрийншот на масите в залите тук:
https://drive.google.com/file/d/11eIf5esh15cu0_rhfsFw3qrfMcf5Jn_s/view?usp=sharing
Другата таблица остава непроменена.

Нямаме търпение да се видим утре и да направим едно уникално събитие!
Очакваме ви!

Поздрави,

Екипът на Hack TUES 12 & TUES Fest 2026`,
      html: `<div>
  <p>Здравейте,</p>

  <p>Има лека промяна в самото разпределение по маси вътре в залата, прикачваме скрийншот на масите в залите <a href="https://drive.google.com/file/d/11eIf5esh15cu0_rhfsFw3qrfMcf5Jn_s/view?usp=sharing">тук</a>. Другата таблица остава непроменена.</p>

  <p>Нямаме търпение да се видим утре и да направим едно уникално събитие!<br/>
  Очакваме ви!</p>

  <p>Поздрави,<br/>
  Екипът на Hack TUES 12 &amp; TUES Fest 2026</p>
</div>`,
      fromName: 'team',
    };

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
sendTF();

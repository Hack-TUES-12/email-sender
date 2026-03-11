import { bulkSendHT } from './bulkSendHT';
import { HackTUESEmailOptions } from './sendEmail';
import { readMentors } from './readMentors';

/**
 * Main function to send declaration emails
 */
async function sendMentorInvites() {
  try {
    const mentors = readMentors();
    console.log('Mentors:', mentors);

    // Define email options
    const emailOptions: Omit<HackTUESEmailOptions, 'to'> = {
      subject: 'Hack TUES 12 ментори',
      text: `Здравейте,

      Благодарим, че ще бъдете ментор на Hack TUES 12! Без Вас събитието не би било същото!

      На 17 март (вторник) от 20:30 ще се проведе онлайн информационна среща за всички ментори, на която ще Ви запознаем с необходимата информация за предстоящото събитие. В случай, че нямате възможност да се включите, ще направим запис от срещата и ще Ви го изпратим. Линк към срещата може да намерите тук:
      https://meet.google.com/ikp-syic-rgd

      Молим Ви да попълните анкета за информирано съгласие (<strong>в срок до 16 март</strong>):
      https://docs.google.com/forms/d/e/1FAIpQLScupMXOUoGLWplz-sjqEMjPqdSixRih2uMH0kJ7Rcsv46qTcw/viewform

      Отделно ще се радваме, ако се запознаете с наръчника на ментора чрез следния survival guide:
      https://docs.google.com/document/d/1d-mq7hqDUZPCh3DkE96dlyckHsXq8AriQKLNANfpLzA/edit?usp=sharing

      При въпроси или нужда от съдействие оставаме на разположение. 

      Очакваме Ви с нетърпение!

      Поздрави,
      Екипът на Hack TUES 12`,
      html: `<div>Здравейте,

      <p>Благодарим, че ще бъдете ментор на Hack TUES 12! Без Вас събитието не би било същото!</p>

      <p>На <strong>17 март (вторник)</strong> от <strong>20:30</strong> ще се проведе онлайн информационна среща за всички ментори, на която ще Ви запознаем с необходимата информация за предстоящото събитие. В случай, че нямате възможност да се включите, ще направим запис от срещата и ще Ви го изпратим. Линк към срещата може да намерите <a href="https://meet.google.com/ikp-syic-rgd">тук</a>.</p>

      <p>Молим Ви да попълните анкета за информирано съгласие (в срок до 16 март) <a href="https://docs.google.com/forms/d/e/1FAIpQLScupMXOUoGLWplz-sjqEMjPqdSixRih2uMH0kJ7Rcsv46qTcw/viewform?usp=dialog">тук</a>.</p>

      <p>Отделно ще се радваме, ако се запознаете с наръчника на ментора чрез следния <a href="https://docs.google.com/document/d/1d-mq7hqDUZPCh3DkE96dlyckHsXq8AriQKLNANfpLzA/edit?usp=sharing">survival guide</a>.</p>

      <p>За да продължим комуникацията си занапред, както и с участниците може да се присъедините към нашия Discord сървър. При възникнала грешка може да влезете и от <a href="https://discord.gg/P3UxFqbS">тук</a>.</p>

      <p>При въпроси или нужда от съдействие оставаме на разположение.</p>

      <p>Очакваме Ви с нетърпение!</p>

      <p>Поздрави,<br/>
      Екипът на Hack TUES 12</p>
</div>`,
      fromName: "team",
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
sendMentorInvites();
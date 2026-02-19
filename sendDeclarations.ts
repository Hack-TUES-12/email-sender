import { bulkSendHT } from './bulkSendHT';
import { HackTUESEmailOptions } from './sendEmail';

/**
 * Main function to send declaration emails
 */
async function sendDeclarations() {
  try {
    // Define email options
    const emailOptions: Omit<HackTUESEmailOptions, 'to'> = {
      subject: 'Форма за участие в Hack TUES 12',
      text: `Здравейте,

Hack TUES 12 наближава, за да можем да проведем събитието плавно и по възможно най-добрият начин Ви изпращаме форма, която e ЗАДЪЛЖИТЕЛНО да попълните в срок най-късно до 22.02.

Участници, които не са попълнили формата няма да бъдат допуснати до участие на Hack TUES 12.

https://docs.google.com/forms/d/e/1FAIpQLSdE7NXeCjSAXM17Sxi4Euy5sKASvS6Yl-aODPIMOUlf5gV2Yw/viewform

Пожелаваме ви лек и спокоен остатък от деня.
Поздрави,
Екипът на Hack TUES 12`,
      html: `<div>Здравейте,

<p>Hack TUES 12 наближава, за да можем да проведем събитието плавно и  по възможно най-добрият начин Ви изпращаме форма, която e <b>задължително</b> да попълните в срок най-късно до 22.02.</p>

<p>Участници, които не са попълнили формата няма да бъдат допуснати до участие на Hack TUES 12.</p>

<p>Формата може да намерите <a href="https://docs.google.com/forms/d/e/1FAIpQLSdE7NXeCjSAXM17Sxi4Euy5sKASvS6Yl-aODPIMOUlf5gV2Yw/viewform">тук</a></p>

<p>Пожелаваме ви лек и спокоен остатък от деня.<br/>
Поздрави,<br/>
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
sendDeclarations();

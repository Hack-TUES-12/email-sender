import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

export interface Participant {
  name: string;
  email: string;
}

export function readParticipants(filePath?: string): Participant[] {
  const xlsxFile = filePath || path.join(process.cwd(), 'participants.xlsx');
  const inputDir = path.join(process.cwd(), 'input');

  const workbook = XLSX.readFile(xlsxFile);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  const participants: Participant[] = rows.map((row) => {
    const firstName = String(row['firstName'] ?? '').trim();
    const lastName = String(row['lastName'] ?? '').trim();
    const email = String(row['email'] ?? '').trim();

    return {
      name: `${firstName} ${lastName}`,
      email,
    };
  });

  const missingCertificates = participants.filter(({ name }) => {
    const certPath = path.join(inputDir, `${name}.pdf`);
    return !fs.existsSync(certPath);
  });

  if (missingCertificates.length > 0) {
    console.warn(`\nParticipants missing a certificate (${missingCertificates.length}):`);
    for (const { name } of missingCertificates) {
      console.warn(`  - ${name}`);
    }
  } else {
    console.log('All participants have a certificate.');
  }

  console.log(`Found ${participants.length} participants.`)

  return participants;
}

readParticipants()
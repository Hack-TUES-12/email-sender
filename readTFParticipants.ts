import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

export interface TFParticipant {
  name: string;
  email: string;
}

export function readTFParticipants(filePath?: string): TFParticipant[] {
  const xlsxFile = filePath || path.join(process.cwd(), 'tf-participants.xlsx');
  const inputDir = path.join(process.cwd(), 'input-tf');

  const workbook = XLSX.readFile(xlsxFile);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  const allParticipants: TFParticipant[] = rows.map((row) => {
    const name = String(row['Име и Фамилия'] ?? '').trim();
    const email = String(row['Email address'] ?? '').trim();

    return {
      name,
      email,
    };
  });

  const seenEmails = new Set<string>();
  const duplicates: TFParticipant[] = [];
  const participants: TFParticipant[] = [];
  for (const p of allParticipants) {
    const key = p.email.toLowerCase();
    if (seenEmails.has(key)) {
      duplicates.push(p);
      continue;
    }
    seenEmails.add(key);
    participants.push(p);
  }

  if (duplicates.length > 0) {
    console.warn(`\nRemoved ${duplicates.length} duplicate TF participant(s) by email:`);
    for (const { name, email } of duplicates) {
      console.warn(`  - ${name} <${email}>`);
    }
  }

  const missingCertificates = participants.filter(({ name }) => {
    const certPath = path.join(inputDir, `${name}.pdf`);
    return !fs.existsSync(certPath);
  });

  if (missingCertificates.length > 0) {
    console.warn(`\nTF participants missing a certificate (${missingCertificates.length}):`);
    for (const { name } of missingCertificates) {
      console.warn(`  - ${name}`);
    }
  } else {
    console.log('All TF participants have a certificate.');
  }

  console.log(`Found ${participants.length} TF participants.`)

  return participants;
}

readTFParticipants()

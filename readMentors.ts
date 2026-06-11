import * as XLSX from 'xlsx';
import * as path from 'path';

export interface MentorRow {
  email: string;
  discord_join_token: string;
}

export function readMentors(filePath?: string): MentorRow[] {
  const xlsxFile = filePath || path.join(process.cwd(), 'mentors.xlsx');

  const workbook = XLSX.readFile(xlsxFile);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  const mentors: MentorRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const match = row['match'];

    if (match !== true && String(match).toUpperCase() !== 'TRUE') {
      console.error(`Row ${i + 1} has match = "${match}" — expected TRUE. Stopping.`);
      process.exit(1);
    }

    const email = String(row['имейл'] ?? '').trim();
    const discord_join_token = String(row['discord_join_token'] ?? '').trim();

    mentors.push({ email, discord_join_token });
  }

  return mentors;
}

console.log('Mentors:', readMentors());

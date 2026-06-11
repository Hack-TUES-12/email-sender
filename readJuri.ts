import * as XLSX from 'xlsx';
import * as path from 'path';

export interface JuriRow {
  name: string;
  email: string;
}

export function readJuri(filePath?: string): JuriRow[] {
  const xlsxFile = filePath || path.join(process.cwd(), 'juri.xlsx');

  const workbook = XLSX.readFile(xlsxFile);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  return rows.map((row) => ({
    name: String(row['Име'] ?? '').trim(),
    email: String(row['Имейл'] ?? '').trim(),
  }));
}

console.log('Juri:', readJuri());

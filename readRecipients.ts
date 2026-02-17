import fs from 'fs';
import path from 'path';

/**
 * Reads email recipients from input.txt file
 * Each recipient should be on a new line
 * @param filePath - Optional path to the input file (defaults to 'input.txt' in project root)
 * @returns Array of email addresses (trimmed and filtered for empty lines)
 */
export function readRecipients(filePath?: string): string[] {
  const inputFile = filePath || path.join(process.cwd(), 'input.txt');
  
  try {
    // Read the file
    const fileContent = fs.readFileSync(inputFile, 'utf-8');
    
    // Split by newlines and process
    const recipients = fileContent
      .split(/\r?\n/) // Handle both Windows (\r\n) and Unix (\n) line endings
      .map(line => line.trim()) // Remove leading/trailing whitespace
      .filter(line => line.length > 0 && line.includes('@')); // Filter out empty lines and invalid emails
    
    console.log(`Read ${recipients.length} recipient(s) from ${inputFile}`);
    
    return recipients;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Input file not found: ${inputFile}`);
    }
    throw new Error(`Error reading recipients file: ${error.message}`);
  }
}

readRecipients()
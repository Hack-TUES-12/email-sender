# Email Sender

A TypeScript email sending library built with nodemailer, designed for sending bulk emails via SMTP with support for Hack TUES email configuration.

## Features

- ✅ Send emails via SMTP using nodemailer
- ✅ Environment variable-based configuration
- ✅ Hack TUES email integration with automatic sender address construction
- ✅ Bulk email sending with recipient file support
- ✅ Interactive bulk sending workflow with verification steps
- ✅ Automatic transport creation from environment variables
- ✅ Support for both text and HTML emails
- ✅ Reply-to address configuration
- ✅ Rate limiting (2-second pause every 5 emails)

## Installation

```bash
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the project root (use `.env.example` as a template):

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com          # Required: SMTP server hostname
SMTP_PORT=587                      # Required: SMTP server port
SMTP_SECURE=false                  # Optional: true for 465, false for 587 (auto-detected if not set)
SMTP_USER=your-email@gmail.com     # Required: SMTP username
SMTP_PASS=your-app-password         # Required: SMTP password or app password

# Email Configuration
EMAIL_DOMAIN=mail.hack-tues.com    # Required: Domain for sender addresses
REPLY_TO_ADDRESS=hacktues@elsys-bg.org  # Optional: Reply-to address

# Test Configuration
TEST_RECIPIENT=test@example.com    # Required: Test email for verification
```

### Recipients File

Create an `input.txt` file with one email address per line:

```
recipient1@example.com
recipient2@example.com
recipient3@example.com
```

## Project Structure

```
email-sender/
├── sendEmail.ts          # Core email sending functions
├── transport.ts          # SMTP transport creation
├── readRecipients.ts     # Read recipients from file
├── bulkSendHT.ts         # Bulk email sending workflow
├── sendDeclarations.ts   # Declaration email sender
├── example.ts            # Basic usage example
├── input.txt             # Recipient email addresses (one per line)
├── .env                  # Environment variables (create from .env.example)
└── package.json
```

## Usage

### Basic Email Sending

```typescript
import { createTransportFromEnv } from './transport';
import { sendEmail } from './sendEmail';

// Create transport from environment variables
const transport = await createTransportFromEnv();

// Send email
await sendEmail(transport, {
  to: 'recipient@example.com',
  subject: 'Test Email',
  from: 'sender@example.com',
  text: 'Plain text content',
  html: '<p>HTML content</p>',
  replyTo: 'reply@example.com',
});
```

### Hack TUES Email Sending

```typescript
import { createTransportFromEnv } from './transport';
import { sendHackTUESEmail } from './sendEmail';

const transport = await createTransportFromEnv();

// Send Hack TUES email (from address auto-constructed as {fromName}@{EMAIL_DOMAIN})
await sendHackTUESEmail(transport, {
  to: 'recipient@example.com',
  subject: 'Welcome to Hack TUES',
  fromName: 'team', // Optional, defaults to 'team'
  text: 'Welcome message',
  html: '<h1>Welcome!</h1><p>We\'re excited to have you.</p>',
});
```

### Bulk Email Sending

```typescript
import { bulkSendHT } from './bulkSendHT';

// Send bulk emails with interactive workflow
await bulkSendHT({
  subject: 'Hack TUES Newsletter',
  html: '<p>Newsletter content here</p>',
  fromName: 'newsletter', // Optional
});
```

The `bulkSendHT` function will:
1. Read recipients from `input.txt`
2. Prompt for verification
3. Create SMTP transport
4. Display transport configuration
5. Send test email to `TEST_RECIPIENT`
6. Prompt for confirmation
7. Send emails to all recipients (with 2-second pause every 5 emails)

### Reading Recipients from File

```typescript
import { readRecipients } from './readRecipients';

// Read from default input.txt
const recipients = readRecipients();

// Or specify custom path
const recipients = readRecipients('./data/emails.txt');
```

## Scripts

### Development

```bash
# Run example script
npm run example

# Run declaration email sender
npm run send-declarations

# Build TypeScript
npm run build
```

## API Reference

### `createTransport(smtpConfig, verify?)`

Creates a nodemailer transport with SMTP configuration.

**Parameters:**
- `smtpConfig`: SMTP configuration object
  - `host`: string - SMTP server hostname
  - `port`: number - SMTP server port
  - `secure?`: boolean - Use secure connection (auto-detected for port 465)
  - `auth`: { user: string, pass: string }
- `verify?`: boolean - Verify connection on creation (default: false)

**Returns:** `Promise<Transporter>`

### `createTransportFromEnv(verify?)`

Creates a transport from environment variables.

**Parameters:**
- `verify?`: boolean - Verify connection (default: false)

**Returns:** `Promise<Transporter>`

**Required Env Vars:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

### `sendEmail(transport, emailOptions)`

Sends an email using a nodemailer transport.

**Parameters:**
- `transport`: Transporter - Nodemailer transport instance
- `emailOptions`: EmailOptions
  - `to`: string | string[] - Recipient(s)
  - `subject`: string - Email subject
  - `text?`: string - Plain text content
  - `html?`: string - HTML content
  - `from?`: string - Sender address
  - `replyTo?`: string - Reply-to address

**Returns:** `Promise<void>`

### `sendHackTUESEmail(transport, emailOptions)`

Sends an email with Hack TUES configuration.

**Parameters:**
- `transport`: Transporter - Nodemailer transport instance
- `emailOptions`: HackTUESEmailOptions
  - `to`: string | string[] - Recipient(s)
  - `subject`: string - Email subject
  - `text?`: string - Plain text content
  - `html?`: string - HTML content
  - `fromName?`: string - Sender name part (default: "team")

**Returns:** `Promise<void>`

**Note:** From address is constructed as `{fromName}@{EMAIL_DOMAIN}`. Reply-to uses `REPLY_TO_ADDRESS` env var.

### `readRecipients(filePath?)`

Reads email recipients from a file.

**Parameters:**
- `filePath?`: string - Path to file (default: "input.txt")

**Returns:** `string[]` - Array of email addresses

### `bulkSendHT(emailOptions)`

Sends bulk emails with interactive workflow.

**Parameters:**
- `emailOptions`: Omit<HackTUESEmailOptions, 'to'>
  - `subject`: string - Email subject
  - `text?`: string - Plain text content
  - `html?`: string - HTML content
  - `fromName?`: string - Sender name (default: "team")

**Returns:** `Promise<void>`

**Workflow:**
1. Reads recipients from `input.txt`
2. Prompts for verification
3. Creates transport from env vars
4. Displays configuration
5. Sends test email
6. Prompts for confirmation
7. Sends to all recipients (pauses every 5 emails)

## Error Handling

- All functions throw errors on failure
- `bulkSendHT` exits immediately if any email fails to send
- Missing environment variables throw descriptive errors
- File read errors are caught and re-thrown with context

## Examples

See:
- `example.ts` - Basic email sending example
- `sendDeclarations.ts` - Declaration email sender implementation

## License

ISC

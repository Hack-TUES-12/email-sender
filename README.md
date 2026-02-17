# Email Sender

TypeScript script to send emails via SMTP using nodemailer.

## Installation

```bash
npm install
```

## Usage

```typescript
import { createTransport, sendEmail } from './sendEmail';

// Configure your SMTP settings
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password',
  },
};

// Create transport (optionally verify connection)
const transport = await createTransport(smtpConfig, true);

// Send email using the transport
await sendEmail(transport, {
  to: 'recipient@example.com',
  subject: 'Test Email',
  from: 'your-email@gmail.com',
  text: 'This is a test email',
  html: '<p>This is a test email</p>',
});
```

## Example

See `example.ts` for a complete example.

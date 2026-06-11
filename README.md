# Email Sender

A TypeScript bulk email tool for Hack TUES events, built on nodemailer. Supports sending declarations, certificates, mentor invites, gratitude emails, and TUES Fest photo links.

## Prerequisites

- Node.js 18+
- npm

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `SMTP_HOST` | Yes | SMTP server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | Yes | SMTP port (`587` for STARTTLS, `465` for SSL) |
| `SMTP_SECURE` | No | `true`/`false` — auto-detected from port if omitted |
| `SMTP_USER` | Yes | SMTP login username |
| `SMTP_PASS` | Yes | SMTP password or app password |
| `EMAIL_DOMAIN` | Yes | Sender domain — emails go out as `{fromName}@{EMAIL_DOMAIN}` |
| `REPLY_TO_ADDRESS` | No | Reply-to address for all outgoing emails |
| `TEST_RECIPIENT` | Yes | Your own address for test email verification before bulk sends |

> For Gmail, generate an [App Password](https://myaccount.google.com/apppasswords) and use it as `SMTP_PASS`.

## Input files

Each script reads recipients from a specific file. Prepare the relevant file before running.

| Script | Input file | Format |
|---|---|---|
| `send-declarations` | `input.txt` | One email per line |
| `send-tf-info` | `input.txt` | One email per line |
| `send-tf-photos` | `tf-participant-emails.txt` | One email per line |
| `send-mentor-invites` | `mentors.xlsx` | Excel sheet with mentor data |
| `send-mentor-gratitude` | `mentors.xlsx` | Excel sheet with mentor data |
| `send-juri-gratitude` | `juri.xlsx` | Excel sheet with jury data |
| `send-participant-certificates` | `participants.xlsx` | Excel sheet with participant data |
| `send-tf-certificates` | `tf-participants.xlsx` + `input-tf/` | Excel sheet + PDF certificates in `input-tf/` named `{Име и Фамилия}.pdf` |

### `input.txt` format

```
recipient1@example.com
recipient2@example.com
```

### Excel file columns

- **`mentors.xlsx`** / **`juri.xlsx`**: columns expected by `readMentors.ts` / `readJuri.ts`
- **`participants.xlsx`**: columns expected by `readParticipants.ts`
- **`tf-participants.xlsx`**: `Име и Фамилия`, `Email address`

Use the provided `*-fake.xlsx` files as reference examples.

## Running a script

Every script follows an interactive workflow:

1. Reads and displays recipients
2. Pauses — press **Enter** to continue
3. Creates SMTP transport and shows configuration
4. Pauses — press **Enter** to send a test email to `TEST_RECIPIENT`
5. Pauses — press **Enter** to confirm and send to all recipients
6. Sends in batches with a short pause every 5 emails to avoid rate limits

```bash
npm run send-declarations
npm run send-tf-info
npm run send-tf-photos
npm run send-mentor-invites
npm run send-mentor-gratitude
npm run send-juri-gratitude
npm run send-participant-certificates
npm run send-tf-certificates
```

## Project structure

```
email-sender/
├── transport.ts              # SMTP transport factory
├── sendEmail.ts              # Core send functions
├── bulkSendHT.ts             # Generic bulk send workflow
├── readRecipients.ts         # Read emails from .txt file
├── readMentors.ts            # Read mentors from .xlsx
├── readJuri.ts               # Read jury from .xlsx
├── readParticipants.ts       # Read participants from .xlsx
├── readTFParticipants.ts     # Read TF participants from .xlsx
├── sendDeclarations.ts       # Send declaration emails
├── sendMentorInvites.ts      # Send Discord invites to mentors
├── sendMentorGratitude.ts    # Send gratitude emails to mentors
├── sendJuriGratitude.ts      # Send gratitude emails to jury
├── sendCertificates.ts       # Send certificates to participants
├── sendTF.ts                 # Send TF info emails
├── sendTFCertificates.ts     # Send certificates to TF participants
├── sendTFPhotos.ts           # Send TUES Fest photo album link
├── example.ts                # Minimal usage example
├── input.txt                 # Recipient list (one email per line)
├── tf-participant-emails.txt # TF recipient list
├── input-tf/                 # PDF certificates for TF participants
├── .env.example              # Environment variable template
└── tsconfig.json
```

## Building

```bash
npm run build
```

Compiles TypeScript to `dist/`.

## License

ISC

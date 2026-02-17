import nodemailer, { Transporter } from 'nodemailer';

interface SMTPConfig {
    host: string;
    port: number;
    secure?: boolean; // true for 465, false for other ports
    auth: {
      user: string;
      pass: string;
    };
}



/**
 * Creates and returns a nodemailer transport configured with SMTP settings
 * @param smtpConfig - SMTP server configuration
 * @param verify - Whether to verify the connection (default: false)
 * @returns Promise that resolves with the configured transporter
 */
export async function createTransport(
    smtpConfig: SMTPConfig,
    verify: boolean = false
  ): Promise<Transporter> {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure ?? false, // true for 465, false for other ports
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass,
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000, // 60 seconds
      debug: true, // Enable debug output
      logger: true, // Enable logging
      tls: {
        // Don't reject unauthorized certificates (useful for some SMTP servers)
        rejectUnauthorized: false,
        // Allow legacy TLS versions if needed
        minVersion: 'TLSv1',
      },
      // For port 587, require TLS upgrade
      requireTLS: smtpConfig.port === 587,
    });
  
    if (verify) {
      await transporter.verify();
    }
  
    return transporter;
}



/**
 * Creates and returns a nodemailer transport using credentials from environment variables
 * Required environment variables:
 *   - SMTP_HOST: SMTP server hostname
 *   - SMTP_PORT: SMTP server port (as string, will be parsed to number)
 *   - SMTP_USER: SMTP authentication username
 *   - SMTP_PASS: SMTP authentication password
 * Optional environment variables:
 *   - SMTP_SECURE: Whether to use secure connection (default: false, accepts "true"/"false" or "1"/"0")
 * @param verify - Whether to verify the connection (default: false)
 * @returns Promise that resolves with the configured transporter
 * @throws Error if required environment variables are missing
 */
export async function createTransportFromEnv(
    verify: boolean = false
): Promise<Transporter> {
    const host = process.env.SMTP_HOST;
    const portStr = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secureStr = process.env.SMTP_SECURE;

    if (!host) {
        throw new Error('SMTP_HOST environment variable is required');
    }
    if (!portStr) {
        throw new Error('SMTP_PORT environment variable is required');
    }
    if (!user) {
        throw new Error('SMTP_USER environment variable is required');
    }
    if (!pass) {
        throw new Error('SMTP_PASS environment variable is required');
    }

    const port = parseInt(portStr, 10);
    if (isNaN(port)) {
        throw new Error(`SMTP_PORT must be a valid number, got: ${portStr}`);
    }

    // Auto-detect secure based on port if not explicitly set
    // Port 465 uses implicit TLS (secure), port 587 uses STARTTLS (not secure initially)
    let secure: boolean | undefined;
    if (secureStr !== undefined) {
        secure = secureStr === 'true' || secureStr === '1';
    } else {
        // Auto-detect: port 465 = secure, others = not secure
        secure = port === 465;
    }

    const smtpConfig: SMTPConfig = {
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
    };

    return createTransport(smtpConfig, verify);
}
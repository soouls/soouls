import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

/**
 * Centralized Resend SDK provider.
 *
 * Creates singleton instances for different API scopes:
 * - `sending`: For `resend.emails.send()` — uses `RESEND_API_KEY`
 * - `contacts`: For contacts, segments, events, automations — uses a full-access key
 *
 * Per the Resend skill: "A sending-only API key was used on a non-sending endpoint
 * (domains, contacts, etc.). Create a full-access key instead."
 *
 * @see https://resend.com/api-keys for key permission scoping
 */
@Injectable()
export class ResendProvider {
  /** Resend client for email sending. Uses the primary sending key. */
  readonly sending: Resend | null;

  /** Resend client for contacts, segments, events, automations. Uses full-access key. */
  readonly contacts: Resend | null;

  /** The raw API key used for contacts/events (for edge cases needing direct API calls). */
  readonly contactsApiKey: string | null;

  /** Whether any Resend key is configured at all. */
  readonly isConfigured: boolean;

  /** Tracks whether we've already warned about restricted keys to avoid log spam. */
  private warnedRestricted = false;

  constructor() {
    const sendingKey = process.env.RESEND_API_KEY || null;
    const fullAccessKey =
      process.env.RESEND_AUTOMATION_API_KEY ||
      process.env.RESEND_MARKETING_API_KEY ||
      process.env.RESEND_CONTACTS_API_KEY ||
      sendingKey;

    this.sending = sendingKey ? new Resend(sendingKey) : null;
    this.contacts = fullAccessKey ? new Resend(fullAccessKey) : null;
    this.contactsApiKey = fullAccessKey;
    this.isConfigured = sendingKey !== null;

    if (!sendingKey) {
      console.warn('[Resend] No RESEND_API_KEY configured. Email sending is disabled.');
    }

    if (sendingKey && fullAccessKey === sendingKey) {
      console.info(
        '[Resend] Using a single API key for both sending and contacts. ' +
          'For best security, set RESEND_AUTOMATION_API_KEY with full-access permissions.',
      );
    }
  }

  /** From address formatted as `Name <email>`. */
  get fromAddress(): string {
    const email = process.env.MESSAGING_FROM_EMAIL || 'hello@soouls.in';
    const name = process.env.MESSAGING_FROM_NAME || 'Soouls';
    return `${name} <${email}>`;
  }

  /** Reply-to address, if configured. */
  get replyTo(): string | undefined {
    return process.env.MESSAGING_REPLY_TO_EMAIL || undefined;
  }

  /**
   * Check if an error indicates a restricted (sending-only) API key.
   *
   * Per Resend skill mistake #14: "401 restricted_api_key — A sending-only API key
   * was used on a non-sending endpoint."
   */
  isRestrictedKeyError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error ?? '');
    return (
      message.toLowerCase().includes('restricted') && message.toLowerCase().includes('send email')
    );
  }

  /** Log a one-time warning about restricted key (prevents log spam). */
  warnRestricted(feature: string): void {
    if (this.warnedRestricted) {
      return;
    }

    this.warnedRestricted = true;
    console.warn(
      `[Resend] ${feature} skipped — the configured key can only send emails. Create a full-access key at https://resend.com/api-keys and set RESEND_AUTOMATION_API_KEY.`,
    );
  }
}

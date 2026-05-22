import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';
import { buildExcerpt, markdownToHtml, markdownToText } from '@soouls/logic/messaging';
import React from 'react';
import { getCommandCenterUrl, makeAbsoluteUrl } from './notification.constants';
import {
  BRAND_PRESETS,
  type MessageTemplate,
  type UserMessagingProfile,
  getBrandPreset,
} from './notification.types';

function renderMarkdownEmailContent(markdown: string) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const nodes: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }

    key += 1;
    nodes.push(
      React.createElement(
        Text,
        {
          key: `paragraph-${key}`,
          style: {
            margin: '0 0 16px',
            lineHeight: '1.75',
            color: '#e2e8f0',
          },
        },
        paragraphBuffer.join(' '),
      ),
    );
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listBuffer.length === 0) {
      return;
    }

    key += 1;
    nodes.push(
      React.createElement(
        Section,
        {
          key: `list-${key}`,
          style: {
            margin: '0 0 18px',
            paddingLeft: '18px',
          },
        },
        ...listBuffer.map((item, index) =>
          React.createElement(
            Text,
            {
              key: `item-${key}-${index}`,
              style: {
                margin: '0 0 8px',
                lineHeight: '1.7',
                color: '#e2e8f0',
              },
            },
            `• ${item}`,
          ),
        ),
      ),
    );
    listBuffer = [];
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      listBuffer.push(trimmed.slice(2));
      continue;
    }

    flushList();

    if (trimmed.startsWith('# ')) {
      flushParagraph();
      key += 1;
      nodes.push(
        React.createElement(
          Heading,
          {
            key: `h1-${key}`,
            as: 'h1',
            style: {
              margin: '0 0 14px',
              color: '#ffffff',
              fontSize: '30px',
              lineHeight: '1.2',
            },
          },
          trimmed.slice(2),
        ),
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      key += 1;
      nodes.push(
        React.createElement(
          Heading,
          {
            key: `h2-${key}`,
            as: 'h2',
            style: {
              margin: '0 0 12px',
              color: '#fff7ed',
              fontSize: '24px',
              lineHeight: '1.3',
            },
          },
          trimmed.slice(3),
        ),
      );
      continue;
    }

    paragraphBuffer.push(
      trimmed
        .replaceAll('**', '')
        .replaceAll('*', '')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)'),
    );
  }

  flushParagraph();
  flushList();

  return nodes;
}

function TransactionalEmailShell(props: {
  brandKey?: string;
  eyebrow: string;
  title: string;
  previewText: string;
  bodyMarkdown: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footer?: string;
}) {
  const brand = getBrandPreset(props.brandKey);
  const footer = props.footer ?? brand.footer;
  const bodyNodes = renderMarkdownEmailContent(props.bodyMarkdown);

  return React.createElement(
    Html,
    null,
    React.createElement(Head),
    React.createElement(Preview, null, props.previewText),
    React.createElement(
      Body,
      {
        style: {
          backgroundColor: '#020617',
          margin: '0',
          padding: '32px 16px',
          fontFamily: 'Inter, Arial, sans-serif',
          color: '#e2e8f0',
        },
      },
      React.createElement(
        Container,
        {
          style: {
            maxWidth: '680px',
            margin: '0 auto',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '28px',
            overflow: 'hidden',
            background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 48%, #020617 100%)',
            boxShadow: '0 30px 80px rgba(15,23,42,0.45)',
          },
        },
        React.createElement(
          Section,
          {
            style: {
              padding: '32px 32px 12px',
              background: 'linear-gradient(180deg, rgba(249,115,22,0.22), rgba(15,23,42,0))',
            },
          },
          React.createElement(
            Text,
            {
              style: {
                display: 'inline-block',
                margin: '0',
                padding: '8px 12px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                color: '#fdba74',
                fontSize: '12px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              },
            },
            props.eyebrow,
          ),
          React.createElement(
            Heading,
            {
              as: 'h1',
              style: {
                margin: '22px 0 12px',
                color: '#fff7ed',
                fontSize: '34px',
                lineHeight: '1.1',
                fontFamily: "Georgia, 'Times New Roman', serif",
              },
            },
            props.title,
          ),
          React.createElement(
            Text,
            {
              style: {
                margin: '0',
                color: '#cbd5e1',
                fontSize: '16px',
                lineHeight: '1.7',
              },
            },
            props.previewText,
          ),
        ),
        React.createElement(
          Section,
          { style: { padding: '12px 32px 32px' } },
          React.createElement(
            Section,
            {
              style: {
                padding: '24px',
                borderRadius: '24px',
                background: 'rgba(15,23,42,0.55)',
                border: '1px solid rgba(255,255,255,0.08)',
              },
            },
            ...bodyNodes,
            props.ctaLabel && props.ctaUrl
              ? React.createElement(
                  Section,
                  { style: { marginTop: '28px' } },
                  React.createElement(
                    Button,
                    {
                      href: props.ctaUrl,
                      style: {
                        display: 'inline-block',
                        padding: '14px 20px',
                        borderRadius: '999px',
                        background: 'linear-gradient(135deg,#f97316,#fb923c)',
                        color: '#0f172a',
                        fontWeight: '700',
                        textDecoration: 'none',
                      },
                    },
                    props.ctaLabel,
                  ),
                )
              : null,
          ),
          React.createElement(
            Text,
            {
              style: {
                marginTop: '24px',
                paddingTop: '18px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                fontSize: '13px',
                lineHeight: '1.7',
                color: '#94a3b8',
              },
            },
            footer,
          ),
        ),
      ),
    ),
  );
}

async function renderTransactionalTemplate(options: {
  brandKey?: string;
  eyebrow: string;
  title: string;
  previewText: string;
  bodyMarkdown: string;
  bodyText: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footer?: string;
  whatsappBody: string;
}) {
  const reactTree = React.createElement(TransactionalEmailShell, {
    brandKey: options.brandKey,
    eyebrow: options.eyebrow,
    title: options.title,
    previewText: options.previewText,
    bodyMarkdown: options.bodyMarkdown,
    ctaLabel: options.ctaLabel,
    ctaUrl: options.ctaUrl,
    footer: options.footer,
  });

  const html = await render(reactTree);
  const text = options.ctaUrl
    ? `${options.bodyText}\n\n${options.ctaLabel ?? 'Open Soouls'}: ${options.ctaUrl}`
    : options.bodyText;

  return {
    subject: options.title,
    previewText: options.previewText,
    html,
    text,
    whatsappBody: options.whatsappBody,
  } satisfies MessageTemplate;
}

export function buildCampaignTemplate(input: {
  brandKey?: string;
  subject: string;
  markdownBody: string;
  ctaLabel?: string;
  ctaUrl?: string;
  whatsappBody?: string;
}) {
  const brand = getBrandPreset(input.brandKey);
  const previewText = buildExcerpt(input.markdownBody, 120);
  const textBody = markdownToText(input.markdownBody);
  const htmlBody = markdownToHtml(input.markdownBody);
  const ctaBlock =
    input.ctaLabel && input.ctaUrl
      ? `<div style="margin-top:28px;"><a href="${input.ctaUrl}" style="display:inline-block;padding:14px 20px;border-radius:999px;background:linear-gradient(135deg,#f97316,#fb923c);color:#0f172a;text-decoration:none;font-weight:700;">${input.ctaLabel}</a></div>`
      : '';

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${input.subject}</title>
        <meta name="description" content="${previewText}" />
      </head>
      <body style="margin:0;padding:32px 16px;background:#020617;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
        <div style="max-width:680px;margin:0 auto;background:radial-gradient(circle at top,#1e293b 0%,#0f172a 48%,#020617 100%);border:1px solid rgba(255,255,255,0.08);border-radius:28px;overflow:hidden;box-shadow:0 30px 80px rgba(15,23,42,0.45);">
          <div style="padding:32px 32px 12px;background:linear-gradient(180deg,rgba(249,115,22,0.22),rgba(15,23,42,0));">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,0.08);font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#fdba74;">
              ${brand.eyebrow}
            </div>
            <h1 style="margin:22px 0 12px;font-size:34px;line-height:1.1;color:#fff7ed;font-family:Georgia,'Times New Roman',serif;">
              ${input.subject}
            </h1>
            <p style="margin:0;color:#cbd5e1;font-size:16px;line-height:1.7;max-width:560px;">
              ${previewText}
            </p>
          </div>
          <div style="padding:12px 32px 32px;">
            <div style="padding:24px;border-radius:24px;background:rgba(15,23,42,0.55);border:1px solid rgba(255,255,255,0.08);">
              ${htmlBody}
              ${ctaBlock}
            </div>
            <div style="margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.08);font-size:13px;line-height:1.7;color:#94a3b8;">
              ${brand.footer}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const whatsappBody = [input.whatsappBody?.trim() || textBody, input.ctaUrl]
    .filter(Boolean)
    .join('\n\n');

  return {
    subject: input.subject,
    previewText,
    html,
    text: input.ctaUrl
      ? `${textBody}\n\n${input.ctaLabel ?? 'Open Soouls'}: ${input.ctaUrl}`
      : textBody,
    whatsappBody,
  } satisfies MessageTemplate;
}

export async function buildWelcomeTemplate(recipient: UserMessagingProfile) {
  void recipient;

  const subject = 'Welcome to Soouls';
  const calendlyLink =
    process.env.RESEND_CALENDLY_LINK || process.env.CALENDLY_LINK || 'https://cal.com/nava-mcarro';
  const previewText =
    'You are in the first circle. Your Soouls sanctuary is ready, and we would love your feedback.';
  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection" />
    <title>Welcome to Soouls</title>
    <style>
      body, table, td { margin:0; padding:0; }
      img { border:0; display:block; }
      body { background-color:#111010 !important; }
      u + #body { background-color:#111010 !important; }
      #MessageViewBody { background-color:#111010 !important; }
    </style>
  </head>
  <body id="body" style="margin:0;padding:0;background-color:#111010;min-width:100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#111010" style="background-color:#111010;width:100%;min-width:100%;">
      <tr>
        <td align="center" bgcolor="#111010" style="background-color:#111010;padding:0;">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:640px;">
            <tr>
              <td bgcolor="#0d0c0c" style="background-color:#0d0c0c;padding:16px 36px;border-bottom:1px solid #1e1c1b;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <a href="https://soouls.in" style="text-decoration:none;">
                        <span style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#c4bcb4;letter-spacing:0.05em;">Soouls</span>
                      </a>
                    </td>
                    <td align="right">
                      <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#3a3530;letter-spacing:0.1em;text-transform:uppercase;">Welcome &nbsp;/&nbsp; </span><span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#e8602c;letter-spacing:0.1em;text-transform:uppercase;">First Circle</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="#111010" style="background-color:#111010;padding:28px 24px 0 24px;">
                <p style="margin:0 0 -14px 8px;font-family:Georgia,'Times New Roman',serif;font-size:80px;font-weight:700;color:#191716;line-height:1;letter-spacing:-0.03em;">Soouls</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1e1c1b;border-radius:22px;">
                  <tr>
                    <td style="padding:40px 40px 36px 40px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                        <tr>
                          <td bgcolor="#2a1508" style="background-color:#2a1508;border:1px solid #5a2e18;border-radius:30px;padding:5px 16px;">
                            <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.14em;color:#e8602c;text-transform:uppercase;font-weight:700;">You're In</span>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 2px 0;font-family:Georgia,'Times New Roman',serif;font-size:40px;font-weight:700;line-height:1.12;color:#f0ebe4;letter-spacing:-0.025em;">Welcome to Soouls,</p>
                      <p style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:40px;font-weight:700;font-style:italic;line-height:1.12;color:#e8602c;letter-spacing:-0.025em;">.</p>
                      <p style="margin:0 0 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#6b6560;line-height:1.85;">We are so incredibly grateful to have you in our digital sanctuary. You're part of something intentional, privacy-first, and built with real care.</p>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td bgcolor="#e8602c" style="background-color:#e8602c;border-radius:100px;">
                            <a href="https://soouls.in" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;padding:15px 32px;letter-spacing:0.03em;">Open Your Sanctuary</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:10px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#3a3530;">Available on desktop &amp; mobile &nbsp;&middot;&nbsp; <a href="https://soouls.in" style="color:#3a3530;text-decoration:none;">soouls.in</a></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="#111010" style="background-color:#111010;padding:10px 24px 0 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#181614" style="background-color:#181614;border-radius:18px;border:1px solid #1e1c1b;">
                  <tr>
                    <td style="padding:32px 36px;text-align:center;">
                      <p style="margin:0 0 12px 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-style:italic;color:#d4ccc4;">We built this for you.</p>
                      <p style="margin:0 auto;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5a5450;line-height:1.85;max-width:460px;">Soouls is a deeply personal, privacy-first 3D journaling space, and the best way for us to make it perfect is by listening to the people using it. That's you. We literally can't do this without you.</p>
                      <p style="margin:14px 0 0 0;font-family:Georgia,serif;font-size:17px;font-style:italic;color:#8a8278;">Welcome home.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="#111010" style="background-color:#111010;padding:32px 36px 14px 36px;">
                <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#3a3530;">A small ask &middot; Big impact</p>
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-style:italic;color:#c4bcb4;">Can we hop on a quick call?</p>
              </td>
            </tr>
            <tr>
              <td bgcolor="#111010" style="background-color:#111010;padding:0 24px 0 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="49%" valign="top" bgcolor="#1e1c1b" style="background-color:#1e1c1b;border-radius:18px;padding:26px 22px;vertical-align:top;">
                      <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#3a3530;">10-15 mins. No agenda.</p>
                      <p style="margin:0 0 10px 0;font-family:Georgia,serif;font-size:16px;color:#d4ccc4;line-height:1.3;">Quick chat with us?</p>
                      <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;color:#5a5450;line-height:1.8;">No rigid surveys, just a friendly conversation to understand your routine and hear your honest feedback.</p>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td bgcolor="#e8602c" style="background-color:#e8602c;border-radius:100px;">
                            <a href="${calendlyLink}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#ffffff;text-decoration:none;padding:10px 20px;letter-spacing:0.03em;">Schedule a Call</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td width="2%">&nbsp;</td>
                    <td width="49%" valign="top" bgcolor="#1e1c1b" style="background-color:#1e1c1b;border-radius:18px;padding:26px 22px;vertical-align:top;">
                      <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#3a3530;">Share the love</p>
                      <p style="margin:0 0 10px 0;font-family:Georgia,serif;font-size:16px;color:#d4ccc4;line-height:1.3;">Show your sanctuary</p>
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12.5px;color:#5a5450;line-height:1.8;">Screenshot your favourite view and share it on X, Instagram, or LinkedIn. Tag <strong style="color:#e8602c;">@Soouls_in</strong>. We amplify every post.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="#190e07" style="background-color:#190e07;padding:44px 40px;text-align:center;">
                <p style="margin:0 0 8px 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-style:italic;color:#b8a898;line-height:1.55;">Your feedback shapes <span style="color:#e8602c;">everything we build.</span></p>
                <p style="margin:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5a4a3a;line-height:1.8;max-width:400px;margin-left:auto;margin-right:auto;">Tell us what works, what doesn't, and what you wish Soouls could do. Every message goes straight to the founders.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                  <tr>
                    <td style="background-color:#2a1508;border:1px solid #5a2e18;border-radius:100px;">
                      <a href="mailto:team@soouls.in" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#e8602c;text-decoration:none;padding:12px 28px;letter-spacing:0.03em;">team@soouls.in</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="#111010" style="background-color:#111010;padding:10px 24px 0 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#1e1c1b" style="background-color:#1e1c1b;border-radius:20px;">
                  <tr>
                    <td style="padding:32px 28px;text-align:center;">
                      <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:#3a3530;">Stay Connected</p>
                      <p style="margin:0 0 22px 0;font-family:Georgia,serif;font-size:20px;font-style:italic;color:#d4ccc4;">Come say hi everywhere</p>
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:2;">
                        <a href="https://www.instagram.com/soouls.in/" style="color:#c4bcb4;text-decoration:none;">Instagram</a>
                        &nbsp;&middot;&nbsp;
                        <a href="https://x.com/Soouls_in" style="color:#c4bcb4;text-decoration:none;">X / Twitter</a>
                        &nbsp;&middot;&nbsp;
                        <a href="https://www.linkedin.com/company/soouls/" style="color:#c4bcb4;text-decoration:none;">LinkedIn</a>
                        &nbsp;&middot;&nbsp;
                        <a href="https://chat.whatsapp.com/FbOlj3NEtbh3AsnIPRyYAd" style="color:#c4bcb4;text-decoration:none;">WhatsApp Circle</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="#0d0c0c" style="background-color:#0d0c0c;padding:40px 36px;text-align:center;">
                <p style="margin:0 0 6px 0;font-family:Georgia,serif;font-size:16px;font-style:italic;color:#6b6560;line-height:1.9;">Thank you for being part of the <strong style="color:#8a8278;font-style:normal;">first circle</strong>.</p>
                <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5a5450;">We can't wait to grow with you inside.</p>
                <p style="margin:16px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#4a4540;line-height:1.8;">Warmly,<br/><strong style="color:#6b6560;font-size:16px;font-family:Georgia,serif;font-style:italic;">Rudra &amp; Bhargav</strong><br/><span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#3a3530;">Founders, Soouls</span></p>
              </td>
            </tr>
            <tr>
              <td bgcolor="#080807" style="background-color:#080807;padding:24px 36px 32px 36px;text-align:center;border-top:1px solid #181614;">
                <p style="margin:0 0 12px 0;font-family:Georgia,serif;font-size:18px;color:#2e2b28;letter-spacing:0.06em;">Soouls</p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#222020;line-height:1.8;">You received this because you signed up at Soouls.<br/><a href="https://soouls.in/privacy" style="color:#2e2b28;text-decoration:underline;">Privacy Policy</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  const text = `Welcome to Soouls.\n\nYou are in the first circle. Your Soouls sanctuary is ready.\n\nSchedule a quick call: ${calendlyLink}\n\nSend feedback to team@soouls.in`;

  return {
    subject,
    previewText,
    html,
    text,
    whatsappBody: text,
  } satisfies MessageTemplate;
}

export async function buildSecureAccessTemplate(
  recipient: UserMessagingProfile,
  secureLink: string,
) {
  const brand = BRAND_PRESETS.soouls;
  const firstName = recipient.name?.split(' ')[0] || 'there';
  const settingsUrl = makeAbsoluteUrl('/home/settings');
  const markdownBody = `# Secure access for your Soouls account

Hi **${firstName}**,

Use the secure link below to get back into your account. Once you're inside, head to [Settings](${settingsUrl}) to update your password or account details.

- This link expires soon for safety
- If you didn't request this, you can ignore this message
- Support can always help if something looks off`;

  return renderTransactionalTemplate({
    brandKey: brand.key,
    eyebrow: brand.eyebrow,
    title: 'Your Soouls secure access link',
    previewText:
      'Use this secure access link to get back into Soouls and refresh your password safely.',
    bodyMarkdown: markdownBody,
    bodyText: markdownToText(markdownBody),
    ctaLabel: 'Open Secure Access Link',
    ctaUrl: secureLink,
    footer: brand.footer,
    whatsappBody:
      'Here is your Soouls secure access link. Open it soon, then update your password from Settings once you are signed in.',
  });
}

export async function buildAdminInviteTemplate(input: {
  email: string;
  role: 'support' | 'engineer' | 'super_admin';
  inviterName?: string | null;
  inviterEmail?: string | null;
  expiresAt: Date;
}) {
  const roleLabel =
    input.role === 'super_admin'
      ? 'Super Admin'
      : input.role === 'engineer'
        ? 'Senior Engineer'
        : 'Tier 1 Support';
  const commandCenterUrl = new URL('/sign-in', getCommandCenterUrl()).toString();
  const inviter = input.inviterName?.trim() || input.inviterEmail || 'SoulLabs leadership';
  const expiryText = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(input.expiresAt);
  const markdownBody = `# Your SoulLabs Command Center invite

Hi,

**${inviter}** invited **${input.email}** to the SoulLabs Command Center as **${roleLabel}**.

- Sign in with your @soullabs.com Google Workspace account
- Access is role-based and every action is audit logged
- This invite is ready until ${expiryText}

Once you sign in, your invite will be activated automatically.`;

  return renderTransactionalTemplate({
    brandKey: 'founder-desk',
    eyebrow: 'SoulLabs Internal',
    title: 'You have been invited to SoulLabs Command Center',
    previewText: `${roleLabel} access is ready for the SoulLabs internal operating system.`,
    bodyMarkdown: markdownBody,
    bodyText: markdownToText(markdownBody),
    ctaLabel: 'Open Command Center',
    ctaUrl: commandCenterUrl,
    footer:
      'SoulLabs Command Center is an internal operations surface for support, engineering, and secure admin workflows.',
    whatsappBody:
      'You have a SoulLabs Command Center invite. Sign in with your @soullabs.com Google Workspace account to activate access.',
  });
}

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Mail, MessageSquareShare, RefreshCw, Search, Send, Zap } from 'lucide-react';
import { useState } from 'react';
import { useShell } from '../components/ClientShell';
import { PermissionGate } from '../components/PermissionGate';
import { ActionButton, Panel, StatusBadge } from '../components/ui';
import { type Messaging, api, formatRelativeTime } from '../lib/api';

const ACTIVE_SENDER_EMAIL = 'team@soouls.in';
const ACTIVE_SENDER_LABEL = `Soouls Team <${ACTIVE_SENDER_EMAIL}>`;
const SELECT_CLASS =
  'w-full rounded-xl border border-white/[0.08] bg-[#111827] px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-amber-400/30';
const SMALL_SELECT_CLASS =
  'rounded-md border border-white/[0.08] bg-[#111827] px-2 py-1 text-xs text-slate-200 outline-none transition-colors focus:border-amber-400/30';
const OPTION_CLASS = 'bg-[#111827] text-slate-100';

const SOOULS_LINKS = {
  instagram: 'https://www.instagram.com/soouls.in/',
  x: 'https://x.com/Soouls_in',
  linkedin: 'https://www.linkedin.com/company/soouls/?viewAsMember=true',
  website: 'https://soouls.in',
  source: 'https://source.in',
  whatsappGroup: 'https://chat.whatsapp.com/FbOlj3NEtbh3AsnIPRyYAd',
};

const CAMPAIGN_PRESETS = [
  {
    key: 'waitlist-community',
    label: 'Waitlist community invite',
    title: 'Waitlist community links launch',
    subject: 'Soouls is opening up for our waitlist',
    body: `# Soouls is opening up for our waitlist

Hi there,

You joined the Soouls waitlist early, and we are grateful you are part of the first circle.

The first version of Soouls is live for you to explore. Start with one honest entry, come back when your thoughts feel loud, and help us shape a calmer way to reflect.

- Website: ${SOOULS_LINKS.website}
- Source: ${SOOULS_LINKS.source}
- Instagram: ${SOOULS_LINKS.instagram}
- X: ${SOOULS_LINKS.x}
- LinkedIn: ${SOOULS_LINKS.linkedin}
- WhatsApp community: ${SOOULS_LINKS.whatsappGroup}

Thank you for being here at the beginning.`,
    whatsapp: `Soouls is opening up for our waitlist.

Website: ${SOOULS_LINKS.website}
Source: ${SOOULS_LINKS.source}
Instagram: ${SOOULS_LINKS.instagram}
X: ${SOOULS_LINKS.x}
LinkedIn: ${SOOULS_LINKS.linkedin}
WhatsApp community: ${SOOULS_LINKS.whatsappGroup}

Thank you for being part of the beginning.`,
    ctaLabel: 'Join the Soouls Community',
    ctaUrl: SOOULS_LINKS.whatsappGroup,
    targetBillingTier: 'waitlist_all',
    channels: ['email', 'whatsapp'],
  },
  {
    key: 'thank-you',
    label: 'Signup thank you',
    title: 'Thank you message for new Soouls users',
    subject: 'Thank you for joining Soouls',
    body: `# Thank you for joining Soouls

Hi there,

Thank you for signing up and trusting Soouls with your reflective space. We are building this slowly and carefully so journaling feels calm, private, and genuinely useful.

- Your workspace is ready
- Your entries stay personal
- More thoughtful updates are coming soon

We are grateful you are here.`,
    whatsapp:
      'Thank you for joining Soouls. Your reflective workspace is ready, and we are grateful you are here.',
    ctaLabel: 'Open Soouls',
    ctaUrl: 'https://soouls.in/home',
  },
  {
    key: 'waitlist',
    label: 'Waitlist welcome',
    title: 'Waitlist launch note',
    subject: 'Your Soouls early access is ready',
    body: `# Your early access is ready

Hi there,

You joined the Soouls waitlist early, and that means a lot. The first version is ready for you to explore.

- Start with one honest entry
- Try the Life Canvas
- Tell us what feels magical and what feels rough

Thank you for being part of the beginning.`,
    whatsapp: 'Your Soouls early access is ready. Thank you for being part of the beginning.',
    ctaLabel: 'Start Early Access',
    ctaUrl: 'https://soouls.in/sign-up',
  },
  {
    key: 'support',
    label: 'Support update',
    title: 'Product support update',
    subject: 'A quick Soouls support update',
    body: `# A quick Soouls support update

Hi there,

We are sharing a short update from the Soouls team.

- What changed:
- Who it affects:
- What you need to do:

Reply to this email if you need help. We will take care of it.`,
    whatsapp: 'A quick Soouls support update: reply if you need help and we will take care of it.',
    ctaLabel: 'Contact Support',
    ctaUrl: 'mailto:support@soouls.in',
  },
] as const;

export function MessagingSection() {
  const { setFlash } = useShell();
  const queryClient = useQueryClient();

  const { data: messaging } = useQuery({
    queryKey: ['messaging'],
    queryFn: () => api<Messaging>('/command-api/messaging'),
    refetchInterval: 5000, // Auto-refresh every 5s for live delivery tracking
  });

  const [isComposing, setIsComposing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const { data: campaignDetail } = useQuery({
    queryKey: ['campaign-detail', selectedCampaignId],
    queryFn: () => api<any>(`/command-api/messaging/campaigns/${selectedCampaignId}`),
    enabled: !!selectedCampaignId,
    refetchInterval: 5000,
  });

  const [composeBrand, setComposeBrand] = useState<'soouls' | 'soouls-studio' | 'founder-desk'>(
    'soouls',
  );
  const [composeTitle, setComposeTitle] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeWhatsappBody, setComposeWhatsappBody] = useState('');
  const [composeCtaLabel, setComposeCtaLabel] = useState('');
  const [composeCtaUrl, setComposeCtaUrl] = useState('');
  const [composeChannels, setComposeChannels] = useState<Array<'email' | 'whatsapp'>>(['email']);
  const [targetNodeCount, setTargetNodeCount] = useState<string>('any');
  const [targetSignupDate, setTargetSignupDate] = useState<string>('any');
  const [targetBillingTier, setTargetBillingTier] = useState<string>('all');

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['messaging'] });
  }

  function applyCampaignPreset(preset: (typeof CAMPAIGN_PRESETS)[number]) {
    setComposeTitle(preset.title);
    setComposeSubject(preset.subject);
    setComposeBody(preset.body);
    setComposeWhatsappBody(preset.whatsapp);
    setComposeCtaLabel(preset.ctaLabel);
    setComposeCtaUrl(preset.ctaUrl);
    if ('targetBillingTier' in preset) {
      setTargetBillingTier(preset.targetBillingTier);
    }
    if ('channels' in preset) {
      setComposeChannels([...preset.channels]);
    }
    setIsComposing(true);
  }

  async function handleSendTest() {
    if (!testEmail || !composeSubject || !composeBody) return;

    setSendingTest(true);
    try {
      await api('/command-api/messaging/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          subject: composeSubject,
          markdownBody: composeBody,
          ctaLabel: composeCtaLabel,
          ctaUrl: composeCtaUrl,
          brandKey: composeBrand,
        }),
      });
      setFlash(`Test email sent to ${testEmail}`);
      setShowTestDialog(false);
      setTestEmail('');
    } catch {
      setFlash('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  }

  async function handleQueue() {
    if (!composeTitle || !composeSubject || !composeBody) return;

    try {
      await api('/command-api/messaging/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandKey: composeBrand,
          title: composeTitle,
          subject: composeSubject,
          markdownBody: composeBody,
          whatsappBody: composeWhatsappBody || undefined,
          ctaLabel: composeCtaLabel || undefined,
          ctaUrl: composeCtaUrl || undefined,
          channels: composeChannels,
          targeting: {
            nodeCount: targetNodeCount,
            signupDate: targetSignupDate,
            billingTier: targetBillingTier,
          },
        }),
      });

      setFlash('Campaign queued for processing.');
      setIsComposing(false);
      setComposeTitle('');
      setComposeSubject('');
      setComposeBody('');
      setComposeWhatsappBody('');
      setComposeCtaLabel('');
      setComposeCtaUrl('');
      invalidate();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : 'Failed to queue campaign');
    }
  }

  async function handleStopCampaign(campaignId: string) {
    try {
      await api(`/command-api/messaging/campaigns/${campaignId}/stop`, { method: 'POST' });
      setFlash('Campaign stopped successfully.');
      invalidate();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : 'Failed to stop campaign');
    }
  }

  if (!messaging) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 w-full rounded-2xl bg-white/[0.03]" />
        <div className="h-64 rounded-2xl bg-white/[0.03]" />
      </div>
    );
  }

  const estimatedAudience =
    targetBillingTier === 'waitlist_all'
      ? messaging.stats.waitlistReachable
      : targetBillingTier === 'waitlist'
        ? Math.min(messaging.stats.waitlistReachable, messaging.stats.totalUsers)
        : composeChannels.includes('whatsapp') && !composeChannels.includes('email')
          ? messaging.stats.whatsappReachable
          : messaging.stats.emailReachable;
  const canSendSelectedChannels =
    (!composeChannels.includes('email') || messaging.providerHealth.emailConfigured) &&
    (!composeChannels.includes('whatsapp') || messaging.providerHealth.whatsappConfigured);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Central Messaging</h1>
          <p className="mt-1 text-sm text-slate-500">
            Broadcast emails, manage campaigns, and track deliveries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGate permission="mutate:messaging">
            <ActionButton
              variant="default"
              onClick={() => setShowTestDialog(true)}
              disabled={!composeSubject || !composeBody}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Send Test
              </div>
            </ActionButton>
          </PermissionGate>
          <PermissionGate permission="mutate:messaging">
            {!isComposing && (
              <ActionButton variant="primary" onClick={() => setIsComposing(true)}>
                <div className="flex items-center gap-2">
                  <MessageSquareShare className="h-4 w-4" />
                  New Campaign
                </div>
              </ActionButton>
            )}
          </PermissionGate>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Email Status</h3>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                messaging.providerHealth.emailConfigured
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : 'bg-rose-400 shadow-sm shadow-rose-400/50'
              }`}
            />
            <span className="text-xs text-slate-400">
              {messaging.providerHealth.emailConfigured ? 'Connected' : 'Not configured'}
            </span>
          </div>
          <div className="mt-3 text-[10px] text-slate-500">
            Via Resend API
            <br />
            Sender: {ACTIVE_SENDER_EMAIL}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">WhatsApp Status</h3>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                messaging.providerHealth.whatsappConfigured
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                  : 'bg-slate-400 shadow-sm shadow-slate-400/50'
              }`}
            />
            <span className="text-xs text-slate-400">
              {messaging.providerHealth.whatsappConfigured ? 'Connected' : 'Not configured'}
            </span>
          </div>
          <div className="mt-3 text-[10px] text-slate-500">Via Twilio</div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Total Campaigns</h3>
          </div>
          <div className="font-display text-3xl font-bold text-white">
            {messaging.campaigns.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {messaging.campaigns.filter((c) => c.status === 'sent').length} sent
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Campaign Starters">
          <div className="grid gap-3 sm:grid-cols-3">
            {CAMPAIGN_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyCampaignPreset(preset)}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-amber-400/25 hover:bg-amber-400/[0.04]"
              >
                <div className="text-sm font-medium text-white">{preset.label}</div>
                <div className="mt-1 text-xs text-slate-500">{preset.subject}</div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Domain Sender Setup">
          <div className="grid gap-2 text-xs">
            {[
              {
                label: 'Verified sending domain',
                value: messaging.providerHealth.emailConfigured ? 'Ready' : 'Needs Resend setup',
              },
              { label: 'Active sender', value: ACTIVE_SENDER_EMAIL },
              { label: 'Recommended aliases', value: 'support@, updates@, founder@, security@' },
              { label: 'Reply routing', value: 'Set MESSAGING_REPLY_TO_EMAIL for team inbox' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg bg-white/[0.025] px-3 py-2"
              >
                <span className="text-slate-500">{item.label}</span>
                <span className="text-right text-slate-300">{item.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {isComposing && (
        <Panel title="Compose Campaign">
          <div className="grid gap-6">
            <div>
              <label
                htmlFor="composeWhatsappBody"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                WhatsApp Body{' '}
                <span className="text-slate-500">(optional channel-specific copy)</span>
              </label>
              <textarea
                id="composeWhatsappBody"
                value={composeWhatsappBody}
                onChange={(e) => setComposeWhatsappBody(e.target.value)}
                placeholder="Short version for WhatsApp. If empty, Soouls will use the email text."
                rows={4}
                className="w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
              />
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                <span>Keep it short, direct, and reply-friendly.</span>
                <span>{composeWhatsappBody.length} chars</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="composeTitle"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  Internal Title *
                </label>
                <input
                  id="composeTitle"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  placeholder="e.g. March Feature Announcement"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
                />
              </div>
              <div>
                <label
                  htmlFor="composeBrand"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  Brand Persona
                </label>
                <select
                  id="composeBrand"
                  value={composeBrand}
                  onChange={(e) =>
                    setComposeBrand(e.target.value as 'soouls' | 'soouls-studio' | 'founder-desk')
                  }
                  className={SELECT_CLASS}
                >
                  {messaging.brands.map((b) => (
                    <option key={b.key} value={b.key} className={OPTION_CLASS}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sender Email Selection */}
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <label
                htmlFor="composeSender"
                className="mb-2 block text-xs font-medium text-slate-400"
              >
                Send From (Email)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { email: ACTIVE_SENDER_EMAIL, label: 'Team', default: true },
                  { email: 'hello@soouls.in', label: 'Hello', default: false },
                  { email: 'updates@soouls.in', label: 'Updates', default: false },
                ].map((sender) => (
                  <button
                    key={sender.email}
                    type="button"
                    disabled={!sender.default}
                    title={
                      sender.default
                        ? 'Active sender configured on the backend'
                        : 'Verify this sender in Resend and set MESSAGING_FROM_EMAIL before using it'
                    }
                    className={`rounded-lg px-3 py-2 text-xs transition-all border ${
                      sender.default
                        ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                        : 'cursor-not-allowed border-white/[0.08] bg-white/[0.03] text-slate-500 opacity-70'
                    }`}
                  >
                    <span className="font-medium">{sender.label}</span>
                    <span className="ml-1.5 text-[10px] opacity-60">&lt;{sender.email}&gt;</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                Actual sender is enforced by backend env MESSAGING_FROM_EMAIL after Resend domain
                verification. Currently active: {ACTIVE_SENDER_EMAIL}
              </p>
            </div>

            <div>
              <label
                htmlFor="composeSubject"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                Email Subject / Header *
              </label>
              <input
                id="composeSubject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="What's new in Soouls - March 2026"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
              />
            </div>

            <div>
              <label
                htmlFor="composeBody"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                Message Body (Markdown) *
              </label>

              {/* Rich Text Toolbar */}
              <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-white/[0.08] bg-white/[0.02] px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setComposeBody((b) => `${b}**bold**`)}
                  className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors font-bold"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => setComposeBody((b) => `${b}*italic*`)}
                  className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors italic"
                  title="Italic"
                >
                  I
                </button>
                <div className="mx-1 h-4 w-px bg-white/[0.08]" />
                <button
                  type="button"
                  onClick={() => setComposeBody((b) => `${b}\n# `)}
                  className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => setComposeBody((b) => `${b}\n## `)}
                  className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => setComposeBody((b) => `${b}\n### `)}
                  className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                  title="Heading 3"
                >
                  H3
                </button>
                <div className="mx-1 h-4 w-px bg-white/[0.08]" />
                <button
                  type="button"
                  onClick={() => setComposeBody((b) => `${b}\n- `)}
                  className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                  title="Bullet List"
                >
                  - List
                </button>
                <button
                  type="button"
                  onClick={() => setComposeBody((b) => `${b}\n1. `)}
                  className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                  title="Numbered List"
                >
                  1. List
                </button>
                <div className="mx-1 h-4 w-px bg-white/[0.08]" />
                <button
                  type="button"
                  onClick={() => setComposeBody((b) => `${b}[link text](https://)`)}
                  className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                  title="Insert Link"
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => setComposeBody((b) => `${b}\n---\n`)}
                  className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                  title="Horizontal Rule"
                >
                  HR
                </button>
                <button
                  type="button"
                  onClick={() => setComposeBody((b) => `${b}\n> `)}
                  className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                  title="Blockquote"
                >
                  Quote
                </button>

                <div className="ml-auto flex items-center gap-2">
                  <select className={SMALL_SELECT_CLASS}>
                    <option value="normal" className={OPTION_CLASS}>
                      Normal
                    </option>
                    <option value="large" className={OPTION_CLASS}>
                      Large Text
                    </option>
                    <option value="small" className={OPTION_CLASS}>
                      Small Text
                    </option>
                  </select>
                </div>
              </div>

              <textarea
                id="composeBody"
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder={
                  '# Hello\n\nWrite your message here using **markdown** formatting...\n\nTry the toolbar above for quick formatting.'
                }
                rows={12}
                className="w-full resize-y rounded-b-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm font-mono text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
              />
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-[10px] text-slate-500">
                  Supports: **bold**, *italic*, # headings, - lists, [links](url), &gt; quotes
                </p>
                <p className="text-[10px] text-slate-500">
                  {composeBody.length} chars - ~{Math.ceil(composeBody.length / 250)} min read
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="composeCtaLabel"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  CTA Button Label <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  id="composeCtaLabel"
                  value={composeCtaLabel}
                  onChange={(e) => setComposeCtaLabel(e.target.value)}
                  placeholder="Get Started"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
                />
              </div>
              <div>
                <label
                  htmlFor="composeCtaUrl"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  CTA URL <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  id="composeCtaUrl"
                  value={composeCtaUrl}
                  onChange={(e) => setComposeCtaUrl(e.target.value)}
                  placeholder="https://soouls.app/dashboard"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
                />
              </div>
            </div>

            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
              <h3 className="mb-4 text-sm font-semibold text-amber-200">Audience Targeting</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="targetBillingTier"
                    className="mb-1.5 block text-xs font-medium text-slate-400"
                  >
                    Billing Tier
                  </label>
                  <select
                    id="targetBillingTier"
                    value={targetBillingTier}
                    onChange={(e) => setTargetBillingTier(e.target.value)}
                    className={SELECT_CLASS}
                  >
                    <option value="all" className={OPTION_CLASS}>
                      All Users
                    </option>
                    <option value="waitlist" className={OPTION_CLASS}>
                      Signed-up waitlist users
                    </option>
                    <option value="waitlist_all" className={OPTION_CLASS}>
                      Full waitlist audience
                    </option>
                    <option value="premium" className={OPTION_CLASS}>
                      Premium Only
                    </option>
                    <option value="enterprise" className={OPTION_CLASS}>
                      Enterprise Only
                    </option>
                    <option value="free" className={OPTION_CLASS}>
                      Free Only
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="targetSignupDate"
                    className="mb-1.5 block text-xs font-medium text-slate-400"
                  >
                    Signup Date
                  </label>
                  <select
                    id="targetSignupDate"
                    value={targetSignupDate}
                    onChange={(e) => setTargetSignupDate(e.target.value)}
                    className={SELECT_CLASS}
                  >
                    <option value="any" className={OPTION_CLASS}>
                      Any Time
                    </option>
                    <option value="last_7_days" className={OPTION_CLASS}>
                      Last 7 Days
                    </option>
                    <option value="last_30_days" className={OPTION_CLASS}>
                      Last 30 Days
                    </option>
                    <option value="older_than_30" className={OPTION_CLASS}>
                      Older than 30 Days
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="targetNodeCount"
                    className="mb-1.5 block text-xs font-medium text-slate-400"
                  >
                    Node Count
                  </label>
                  <select
                    id="targetNodeCount"
                    value={targetNodeCount}
                    onChange={(e) => setTargetNodeCount(e.target.value)}
                    className={SELECT_CLASS}
                  >
                    <option value="any" className={OPTION_CLASS}>
                      Any
                    </option>
                    <option value="gt_5" className={OPTION_CLASS}>
                      More than 5 nodes
                    </option>
                    <option value="gt_50" className={OPTION_CLASS}>
                      Power users (&gt; 50)
                    </option>
                    <option value="eq_0" className={OPTION_CLASS}>
                      Zero nodes
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                <span className="text-xs text-amber-300">
                  Estimated recipients: ~{estimatedAudience.toLocaleString()}
                </span>
              </div>
              {!canSendSelectedChannels && (
                <div className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
                  Connect the selected provider first. Email requires Resend env values; WhatsApp
                  requires Twilio WhatsApp env values.
                </div>
              )}
              <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-3">
                <div className="rounded-lg bg-black/15 px-3 py-2">
                  <div className="text-slate-500">Email reachable</div>
                  <div className="font-mono text-slate-200">
                    {messaging.stats.emailReachable.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg bg-black/15 px-3 py-2">
                  <div className="text-slate-500">WhatsApp reachable</div>
                  <div className="font-mono text-slate-200">
                    {messaging.stats.whatsappReachable.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg bg-black/15 px-3 py-2">
                  <div className="text-slate-500">Waitlist records</div>
                  <div className="font-mono text-slate-200">
                    {messaging.stats.waitlistReachable.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] pt-5">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={composeChannels.includes('email')}
                    onChange={(e) => {
                      if (e.target.checked) setComposeChannels((prev) => [...prev, 'email']);
                      else setComposeChannels((prev) => prev.filter((c) => c !== 'email'));
                    }}
                    className="accent-amber-400"
                  />
                  Email
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={composeChannels.includes('whatsapp')}
                    onChange={(e) => {
                      if (e.target.checked) setComposeChannels((prev) => [...prev, 'whatsapp']);
                      else setComposeChannels((prev) => prev.filter((c) => c !== 'whatsapp'));
                    }}
                    className="accent-amber-400"
                  />
                  WhatsApp
                </label>
              </div>
              <div className="flex items-center gap-3">
                <ActionButton onClick={() => setIsComposing(false)}>Cancel</ActionButton>
                <ActionButton
                  variant="default"
                  onClick={() => setShowPreview(true)}
                  disabled={!composeSubject || !composeBody}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </div>
                </ActionButton>
                <PermissionGate permission="mutate:messaging">
                  <ActionButton
                    variant="primary"
                    onClick={handleQueue}
                    disabled={
                      !composeTitle ||
                      !composeSubject ||
                      !composeBody ||
                      composeChannels.length === 0 ||
                      !canSendSelectedChannels
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Queue Campaign
                    </div>
                  </ActionButton>
                </PermissionGate>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {showPreview && (
        <Panel title="Email Preview">
          <div className="rounded-xl border border-white/[0.08] bg-gradient-to-b from-slate-900 to-slate-950 p-6">
            <div className="mb-4 border-b border-white/[0.06] pb-4">
              <div className="text-xs text-slate-500">From</div>
              <div className="text-sm text-white">{ACTIVE_SENDER_LABEL}</div>
            </div>
            <div className="mb-4 border-b border-white/[0.06] pb-4">
              <div className="text-xs text-slate-500">Subject</div>
              <div className="text-lg font-medium text-white">{composeSubject}</div>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm text-slate-300">{composeBody}</div>
            </div>
            {composeCtaLabel && composeCtaUrl && (
              <div className="mt-6">
                <a
                  href={composeCtaUrl}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-medium text-black transition-colors hover:bg-amber-300"
                >
                  {composeCtaLabel} →
                </a>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <ActionButton onClick={() => setShowPreview(false)}>Close Preview</ActionButton>
          </div>
        </Panel>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <Panel
          title="Campaigns"
          action={
            <button
              type="button"
              onClick={() => invalidate()}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          }
        >
          <div className="mt-4 space-y-2">
            {messaging.campaigns.length === 0 ? (
              <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-sm text-slate-500">
                No campaigns yet. Create your first campaign above.
              </div>
            ) : (
              messaging.campaigns.map((campaign) => {
                const sent = (campaign as unknown as { sentCount?: number }).sentCount ?? 0;
                const total =
                  (campaign as unknown as { totalRecipients?: number }).totalRecipients ?? 0;
                const pct = total > 0 ? Math.round((sent / total) * 100) : 0;
                const channels = (campaign as unknown as { channels?: string[] }).channels ?? [
                  'email',
                ];

                return (
                  <div
                    key={campaign.id}
                    className="rounded-xl bg-white/[0.02] px-5 py-4 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-white">{campaign.title}</div>
                        <div className="mt-0.5 text-xs text-slate-400">{campaign.subject}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={campaign.status} />
                        {(campaign.status === 'sending' || campaign.status === 'queued') && (
                          <PermissionGate permission="mutate:messaging">
                            <button
                              type="button"
                              onClick={() => handleStopCampaign(campaign.id)}
                              className="rounded bg-rose-500/10 px-2 py-1 text-[10px] font-medium text-rose-400 transition-colors hover:bg-rose-500/20"
                            >
                              Stop
                            </button>
                          </PermissionGate>
                        )}
                      </div>
                    </div>

                    {/* Delivery Progress */}
                    {total > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span>
                            {sent} of {total} delivered
                          </span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          {channels.includes('email') && <Mail className="h-3 w-3" />}
                          {channels.includes('whatsapp') && (
                            <MessageSquareShare className="h-3 w-3" />
                          )}
                          {channels.join(' + ')}
                        </span>
                        <span>·</span>
                        <span>{formatRelativeTime(campaign.createdAt)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCampaignId(campaign.id)}
                        className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>

        <Panel
          title="Recent Deliveries"
          action={
            <span className="text-xs text-slate-500">
              {messaging.recentDeliveries.length} recent
            </span>
          }
        >
          <div className="space-y-3">
            {messaging.recentDeliveries.length === 0 ? (
              <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-sm text-slate-500">
                No deliveries yet.
              </div>
            ) : (
              messaging.recentDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-start justify-between border-l-2 border-amber-400/50 pl-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {delivery.channel === 'email' ? (
                        <Mail className="h-3 w-3 text-slate-400" />
                      ) : (
                        <MessageSquareShare className="h-3 w-3 text-slate-400" />
                      )}
                      <span className="text-xs text-white">{delivery.recipient}</span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      {formatRelativeTime(delivery.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={delivery.status} />
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {showTestDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0a0f1e] p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-white">Send Test Email</h3>
            <p className="mb-4 text-sm text-slate-400">
              Enter an email address to receive a test preview of your campaign.
            </p>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="mb-4 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-amber-400/30"
            />
            <div className="flex justify-end gap-3">
              <ActionButton onClick={() => setShowTestDialog(false)}>Cancel</ActionButton>
              <ActionButton
                variant="primary"
                onClick={handleSendTest}
                disabled={!testEmail || sendingTest}
              >
                {sendingTest ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Send Test
                  </div>
                )}
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {selectedCampaignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-white/[0.1] bg-[#0a0f1e] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.08] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">Campaign Details</h3>
                <p className="text-sm text-slate-400">
                  {campaignDetail?.campaign?.title || 'Loading...'}
                </p>
              </div>
              <ActionButton onClick={() => setSelectedCampaignId(null)}>Close</ActionButton>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {!campaignDetail ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-amber-400" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="text-xs text-slate-500 mb-1">Status</div>
                      <div className="font-medium text-white capitalize">{campaignDetail.campaign.status}</div>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="text-xs text-slate-500 mb-1">Total Target</div>
                      <div className="font-medium text-white">{campaignDetail.campaign.totalRecipients || 0}</div>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="text-xs text-slate-500 mb-1">Sent</div>
                      <div className="font-medium text-white">{campaignDetail.campaign.sentCount || 0}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Delivery Logs</h4>
                    {campaignDetail.deliveries?.length === 0 ? (
                      <p className="text-sm text-slate-500">No deliveries recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {campaignDetail.deliveries?.map((delivery: any) => (
                          <div key={delivery.id} className="flex flex-col gap-1 rounded-lg border border-white/[0.04] bg-white/[0.01] p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {delivery.channel === 'email' ? <Mail className="h-3 w-3 text-slate-400" /> : <MessageSquareShare className="h-3 w-3 text-slate-400" />}
                                <span className="text-sm text-white">{delivery.recipient}</span>
                              </div>
                              <StatusBadge status={delivery.status} />
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>User ID: {delivery.userId || 'N/A'}</span>
                              <span>{new Date(delivery.createdAt).toLocaleString()}</span>
                            </div>
                            {delivery.errorDetails && (
                              <div className="mt-1 text-xs text-rose-400 bg-rose-500/10 p-2 rounded">
                                {delivery.errorDetails}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

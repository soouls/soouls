'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Database,
  FileText,
  Mail,
  Shield,
  ShieldAlert,
  ToggleRight,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useShell } from '../components/ClientShell';
import { ActionButton, Panel, StatCard, StatusBadge, ToggleSwitch } from '../components/ui';
import { type HealthPayload, type Overview, api, formatRelativeTime } from '../lib/api';

interface DashboardSectionProps {
  onNavigate?: (section: string | SectionName) => void;
}

import type { SectionName } from './index';

export function DashboardSection({ onNavigate }: DashboardSectionProps) {
  const { viewer, setFlash } = useShell();
  const queryClient = useQueryClient();

  const { data: overview, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api<Overview>('/command-api/overview'),
    refetchInterval: 15_000,
  });
  const { data: health } = useQuery({
    queryKey: ['dashboard-health'],
    queryFn: () => api<HealthPayload>('/command-api/health'),
    refetchInterval: 20_000,
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['overview'] });
  }

  const canManageEngineering = viewer?.permissions?.includes('mutate:feature_flags');
  const queueTotal =
    (overview?.queue.waiting ?? 0) + (overview?.queue.active ?? 0) + (overview?.queue.delayed ?? 0);
  const providerReadiness = [
    health?.messaging.providerHealth.emailConfigured,
    health?.messaging.providerHealth.whatsappConfigured,
    health?.messaging.providerHealth.newsletterConfigured,
    health?.messaging.providerHealth.queueConfigured,
  ].filter(Boolean).length;
  const operationalScore = Math.round(
    ([
      overview?.telemetry.databaseHealthy,
      health?.redis.connected,
      overview?.queue.failed === 0,
      providerReadiness >= 3,
    ].filter(Boolean).length /
      4) *
      100,
  );

  if (isLoading || !overview) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 w-64 rounded-xl bg-white/[0.03]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.03]" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-72 rounded-2xl bg-white/[0.03]" />
          <div className="h-72 rounded-2xl bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">Command Center</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time platform overview · Auto-refreshes every 15s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">
              Live
            </span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-amber-300/10 bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(15,23,42,0.55)_42%,rgba(4,8,15,0.92))] p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-300" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">
                Internal Control Center
              </span>
            </div>
            <h2 className="mt-4 max-w-2xl font-display text-2xl text-white">
              Monitor the app, message users, manage incidents, and route team action from one
              surface.
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Operational Score',
                  value: `${operationalScore}%`,
                  tone: operationalScore >= 75 ? 'text-emerald-300' : 'text-amber-300',
                },
                {
                  label: 'Provider Readiness',
                  value: `${providerReadiness}/4`,
                  tone: providerReadiness >= 3 ? 'text-emerald-300' : 'text-amber-300',
                },
                {
                  label: 'Queue Failures',
                  value: overview.queue.failed,
                  tone: overview.queue.failed > 0 ? 'text-rose-300' : 'text-emerald-300',
                },
                {
                  label: 'Audit Events',
                  value: overview.recentAuditLogs.length,
                  tone: 'text-sky-300',
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-black/20 px-4 py-3">
                  <div className={`font-mono text-2xl font-bold ${item.tone}`}>{item.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            {[
              {
                label: 'Open Messaging',
                detail: 'Broadcast, test, and inspect campaign delivery.',
                href: '/messaging',
                icon: Mail,
              },
              {
                label: 'Resolve Incidents',
                detail: 'Check Redis, queues, database latency, and providers.',
                href: '/health',
                icon: ShieldAlert,
              },
              {
                label: 'Track Issues',
                detail: 'GitHub Issues is the source of truth for team work.',
                href: 'https://github.com/soouls/soouls/issues',
                icon: FileText,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 transition-colors hover:border-amber-300/20 hover:bg-white/[0.06]"
                >
                  <Icon className="h-4 w-4 text-amber-300" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.detail}</div>
                  </div>
                  <span className="text-xs text-slate-600 transition-colors group-hover:text-amber-300">
                    Open
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button type="button" onClick={() => onNavigate?.('users')} className="group text-left">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]">
            <Users className="h-5 w-5 text-amber-300/80" />
            <div className="mt-3 font-display text-3xl font-bold text-white">
              {overview.stats.totalUsers.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Total Users
              </span>
            </div>
          </div>
        </button>

        <button type="button" onClick={() => onNavigate?.('users')} className="group text-left">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]">
            <Users className="h-5 w-5 text-emerald-300/80" />
            <div className="mt-3 font-display text-3xl font-bold text-white">
              {overview.stats.activeUsers.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Active Users
              </span>
              <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                {overview.stats.totalUsers > 0
                  ? `${Math.round((overview.stats.activeUsers / overview.stats.totalUsers) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </button>

        <button type="button" onClick={() => onNavigate?.('team')} className="group text-left">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]">
            <Shield className="h-5 w-5 text-blue-300/80" />
            <div className="mt-3 font-display text-3xl font-bold text-white">
              {overview.stats.activeAdmins}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Active Admins
              </span>
            </div>
          </div>
        </button>

        <button type="button" onClick={() => onNavigate?.('team')} className="group text-left">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]">
            <Mail className="h-5 w-5 text-amber-300/80" />
            <div className="mt-3 font-display text-3xl font-bold text-white">
              {overview.stats.pendingInvites}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Pending Invites
              </span>
            </div>
          </div>
        </button>

        <button type="button" onClick={() => onNavigate?.('health')} className="group text-left">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]">
            <Activity className="h-5 w-5 text-orange-300/80" />
            <div className="mt-3 font-display text-3xl font-bold text-white">{queueTotal}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Queue Jobs</span>
              {overview.queue.failed > 0 && (
                <span className="rounded-full bg-rose-400/10 px-2 py-0.5 text-[10px] font-medium text-rose-400">
                  {overview.queue.failed} failed
                </span>
              )}
            </div>
          </div>
        </button>

        <button type="button" onClick={() => onNavigate?.('health')} className="group text-left">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.05]">
            <Database className="h-5 w-5 text-sky-300/80" />
            <div className="mt-3 font-display text-3xl font-bold text-white">
              {overview.telemetry.databaseLatencyMs ?? 0}ms
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">DB Latency</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  overview.telemetry.databaseHealthy
                    ? 'bg-emerald-400/10 text-emerald-400'
                    : 'bg-rose-400/10 text-rose-400'
                }`}
              >
                {overview.telemetry.databaseHealthy ? 'Healthy' : 'Degraded'}
              </span>
            </div>
          </div>
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="mb-4 flex items-center gap-3">
          <Zap className="h-5 w-5 text-amber-300" />
          <h2 className="font-display text-lg text-white">BullMQ Radar</h2>
          <Link
            href="/health"
            className="ml-auto text-xs text-slate-500 hover:text-amber-400 transition-colors"
          >
            View Health →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Waiting',
              value: overview.queue.waiting,
              color: 'text-slate-300 bg-slate-400/10 border-slate-400/20',
            },
            {
              label: 'Active',
              value: overview.queue.active,
              color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
            },
            {
              label: 'Delayed',
              value: overview.queue.delayed,
              color: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
            },
            {
              label: 'Failed',
              value: overview.queue.failed,
              color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border px-4 py-3 text-center ${item.color}`}
            >
              <div className="font-mono text-2xl font-bold">{item.value}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest opacity-70">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Feature Flags"
          action={
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ToggleRight className="h-3.5 w-3.5" />
              <span>
                {overview.featureFlags.filter((f) => f.enabled).length}/
                {overview.featureFlags.length} enabled
              </span>
              <Link href="/feature-flags" className="ml-2 text-amber-400 hover:text-amber-300">
                Manage →
              </Link>
            </div>
          }
        >
          <div className="space-y-2">
            {overview.featureFlags.slice(0, 5).map((flag) => (
              <div
                key={flag.id}
                className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
              >
                <div>
                  <div className="text-sm text-white">{flag.key}</div>
                  <div className="text-xs text-slate-500">{flag.description}</div>
                </div>
                <ToggleSwitch
                  enabled={flag.enabled}
                  disabled={!canManageEngineering}
                  onToggle={() => {
                    void api(`/command-api/feature-flags/${flag.key}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ enabled: !flag.enabled }),
                    }).then(() => {
                      setFlash(`${flag.key} → ${!flag.enabled ? 'enabled' : 'disabled'}`);
                      invalidate();
                    });
                  }}
                />
              </div>
            ))}
            {overview.featureFlags.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-600">No feature flags defined.</p>
            )}
          </div>
        </Panel>

        <Panel
          title="Recent Activity"
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {overview.recentAuditLogs.length} events
              </span>
              <Link href="/audit-logs" className="text-xs text-amber-400 hover:text-amber-300">
                View All →
              </Link>
            </div>
          }
        >
          <div className="space-y-2">
            {overview.recentAuditLogs.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-600">No activity yet.</p>
            ) : (
              overview.recentAuditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-xl bg-white/[0.02] px-4 py-3"
                >
                  <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400/50" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm text-white">{log.actorEmail}</span>
                      <StatusBadge status={log.action.split('.').pop() ?? log.action} />
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {log.targetType} · {formatRelativeTime(log.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <Panel
        title="Emergency Kill Switches"
        action={
          <div className="flex items-center gap-1.5 text-xs">
            <Link href="/service-controls" className="text-amber-400 hover:text-amber-300">
              View All →
            </Link>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {overview.serviceControls.map((control) => (
            <div
              key={control.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      control.enabled
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                        : 'bg-rose-400 shadow-sm shadow-rose-400/50'
                    }`}
                  />
                  <span className="text-sm text-white">{control.label}</span>
                </div>
                <div className="mt-0.5 text-xs text-slate-500">{control.description}</div>
              </div>
              <ToggleSwitch
                enabled={control.enabled}
                disabled={!canManageEngineering}
                onToggle={() => {
                  void api(`/command-api/service-controls/${control.key}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enabled: !control.enabled }),
                  }).then(() => {
                    setFlash(`${control.label} → ${!control.enabled ? 'online' : 'paused'}`);
                    invalidate();
                  });
                }}
              />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

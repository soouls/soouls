'use client';

import {
  Activity,
  Bell,
  Cpu,
  CreditCard,
  FileText,
  Heart,
  KeyRound,
  LayoutDashboard,
  Mail,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  ToggleRight,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { AdminRole, Viewer } from '../lib/api';
import {
  AiSection,
  ApiKeysSection,
  AuditLogsSection,
  BillingSection,
  DashboardSection,
  EntriesSection,
  FeatureFlagsSection,
  HealthSection,
  MessagingSection,
  RateLimitsSection,
  SECTION_TITLES,
  type SectionName,
  ServiceControlsSection,
  TeamSection,
  UsersSection,
} from '../sections';

type NavItem = {
  label: string;
  section: SectionName | '';
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: string;
  divider?: boolean;
  groupLabel?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', section: 'dashboard', icon: LayoutDashboard },
  { label: 'Platform', section: '', icon: Activity, divider: true, groupLabel: true },
  { label: 'Users', section: 'users', icon: Users },
  { label: 'Entries', section: 'entries', icon: FileText },
  { label: 'Communication', section: '', icon: Activity, divider: true, groupLabel: true },
  { label: 'Messaging', section: 'messaging', icon: Mail },
  { label: 'Access & Security', section: '', icon: Activity, divider: true, groupLabel: true },
  { label: 'Team', section: 'team', icon: Shield },
  { label: 'Feature Flags', section: 'feature-flags', icon: ToggleRight },
  { label: 'Service Controls', section: 'service-controls', icon: Settings },
  { label: 'API Keys', section: 'api-keys', icon: KeyRound },
  { label: 'Operations', section: '', icon: Activity, divider: true, groupLabel: true },
  { label: 'Health', section: 'health', icon: Heart },
  { label: 'Billing', section: 'billing', icon: CreditCard },
  { label: 'AI Telemetry', section: 'ai', icon: Cpu },
  { label: 'Rate Limits', section: 'rate-limits', icon: ShieldAlert },
  { label: 'Audit Logs', section: 'audit-logs', icon: FileText },
];

const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: 'bg-amber-400/15 text-amber-300 border-amber-400/20',
  engineer: 'bg-blue-400/15 text-blue-300 border-blue-400/20',
  support: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
};

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  engineer: 'Engineer',
  support: 'Support',
};

const SECTION_ROUTE_MAP: Record<SectionName, string> = {
  dashboard: '/',
  users: '/users',
  entries: '/entries',
  messaging: '/messaging',
  team: '/settings/team',
  billing: '/billing',
  ai: '/ai-telemetry',
  health: '/health',
  'rate-limits': '/rate-limits',
  'feature-flags': '/feature-flags',
  'service-controls': '/service-controls',
  'api-keys': '/api-keys',
  'audit-logs': '/audit-logs',
};

function getActiveSectionFromPath(pathname: string): SectionName {
  const path = pathname.replace(/^\/+|\/+$/g, '');

  const sectionMap: Record<string, SectionName> = {
    '': 'dashboard',
    dashboard: 'dashboard',
    users: 'users',
    entries: 'entries',
    messaging: 'messaging',
    'settings/team': 'team',
    billing: 'billing',
    'ai-telemetry': 'ai',
    health: 'health',
    'rate-limits': 'rate-limits',
    'feature-flags': 'feature-flags',
    'service-controls': 'service-controls',
    'api-keys': 'api-keys',
    'audit-logs': 'audit-logs',
    'dashboard/settings': 'team',
  };

  return sectionMap[path] ?? 'dashboard';
}

interface DashboardShellProps {
  viewer: Viewer | null;
}

export function DashboardShell({ viewer }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeSection = getActiveSectionFromPath(pathname);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.divider || item.groupLabel) return true;
    return true;
  });

  const handleNavigate = (section: string) => {
    const route = SECTION_ROUTE_MAP[section as SectionName];
    if (route) {
      router.push(route);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection onNavigate={handleNavigate} />;
      case 'users':
        return <UsersSection />;
      case 'entries':
        return <EntriesSection />;
      case 'messaging':
        return <MessagingSection />;
      case 'team':
        return <TeamSection />;
      case 'billing':
        return <BillingSection />;
      case 'ai':
        return <AiSection />;
      case 'health':
        return <HealthSection />;
      case 'rate-limits':
        return <RateLimitsSection />;
      case 'feature-flags':
        return <FeatureFlagsSection />;
      case 'service-controls':
        return <ServiceControlsSection />;
      case 'api-keys':
        return <ApiKeysSection />;
      case 'audit-logs':
        return <AuditLogsSection />;
      default:
        return <DashboardSection onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-transparent" data-admin-layer>
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-amber-300 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
      >
        Skip To Main Content
      </a>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-[100dvh] w-[280px] flex-col border-r border-white/[0.07] bg-[#070b13]/82 shadow-[inset_-1px_0_0_rgba(255,255,255,0.035)] backdrop-blur-2xl lg:flex">
        {/* Logo */}
        <div className="px-5 py-5">
          <div className="admin-glass flex items-center gap-3 rounded-[1.25rem] px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d5a147] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
              <Activity className="h-5 w-5 text-slate-950" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white">SoulLabs</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Command Center
              </div>
            </div>
          </div>
        </div>

        <div className="admin-hairline mx-5 h-px" />

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {visibleItems.map((item, index) => {
            if (item.groupLabel) {
              const prevItem = visibleItems[index - 1];
              const nextItem = visibleItems[index + 1];
              if (nextItem?.section && (prevItem?.groupLabel || !prevItem)) {
                return (
                  <div key={item.label} className="pt-4 first:pt-0">
                    <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      {item.label}
                    </div>
                  </div>
                );
              }
              return null;
            }

            if (item.divider) {
              return (
                <div
                  key={item.label}
                  className="my-2 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
                />
              );
            }

            const isActive = activeSection === item.section;
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  item.section && router.push(SECTION_ROUTE_MAP[item.section as SectionName])
                }
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-[background-color,color,transform] duration-200 active:translate-y-px ${
                  isActive
                    ? 'bg-[#d5a147]/12 text-amber-100 shadow-[inset_1px_0_0_rgba(213,161,71,0.75)]'
                    : 'text-slate-400 hover:bg-white/[0.045] hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] transition-colors ${
                    isActive ? 'text-amber-200' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                  aria-hidden="true"
                />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="admin-hairline mx-5 h-px" />

        {/* User info */}
        {viewer && (
          <div className="px-4 py-4">
            <div className="admin-glass flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-white/[0.05]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300/14 text-xs font-bold text-amber-100">
                {(viewer.name || viewer.email)[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-white">
                  {viewer.name || viewer.email}
                </div>
                <div
                  className={`mt-0.5 inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${ROLE_COLORS[viewer.role]}`}
                >
                  {ROLE_LABELS[viewer.role]}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main id="admin-main" className="min-w-0 flex-1 overflow-auto px-4 py-5 lg:ml-[280px] lg:p-8">
        <div className="mx-auto max-w-[1500px]">
          <header className="admin-glass mb-6 flex items-center justify-between gap-4 rounded-[1.35rem] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-amber-200">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {SECTION_TITLES[activeSection]}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {viewer?.email ?? 'Internal operations'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/8 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-300 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Live Ops
              </div>
              <button
                type="button"
                aria-label="View command notifications"
                className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition-colors duration-200 hover:bg-white/[0.07] hover:text-white"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </header>
          <nav
            aria-label="Mobile sections"
            className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden"
          >
            {visibleItems
              .filter((item) => item.section)
              .map((item) => {
                const isActive = activeSection === item.section;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={SECTION_ROUTE_MAP[item.section as SectionName]}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors duration-200 ${
                      isActive
                        ? 'border-amber-300/30 bg-amber-300/12 text-amber-100'
                        : 'border-white/10 bg-white/[0.03] text-slate-400'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
          </nav>
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

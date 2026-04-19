'use client';

import { motion } from 'framer-motion';
import {
  CircleUserRound,
  Grid2x2,
  Settings,
  Sparkles,
  SquarePen,
  Waypoints,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

const menuItems = [
  { icon: Grid2x2, label: 'Dashboard', href: '/dashboard' },
  { icon: Sparkles, label: 'Insights', href: '/dashboard/calendar' },
  { icon: Waypoints, label: 'Clusters', href: '/dashboard/clusters' },
  { icon: SquarePen, label: 'Canvas', href: '/dashboard/new-entry' },
  { icon: CircleUserRound, label: 'Account', href: '/dashboard/settings#account' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings#preferences' },
];

export function Sidebar({
  profileSlot,
  footerSlot,
}: {
  profileSlot?: ReactNode;
  footerSlot?: ReactNode;
}) {
  const pathname = usePathname();
  const [hash, setHash] = useState('');

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[288px] flex-col border-r border-white/6 bg-[linear-gradient(180deg,#070708_0%,#0a0a0c_100%)] px-5 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="h-8 w-8 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--app-accent-strong),var(--app-accent))] shadow-[0_0_24px_var(--app-glow)]" />
        <span className="font-urbanist text-xl font-semibold text-[var(--app-text)]">Soouls</span>
      </div>

      {profileSlot ? <div className="mb-8">{profileSlot}</div> : null}

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const targetPath = item.href.split('#')[0];
          const targetHash = item.href.includes('#') ? `#${item.href.split('#')[1]}` : '';
          const isActive =
            pathname === targetPath && (targetHash ? hash === targetHash : targetPath !== '/dashboard/settings');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative group flex items-center gap-3 rounded-[1.2rem] px-4 py-3 transition-all ${
                isActive
                  ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] text-white shadow-[0_20px_40px_-30px_var(--app-glow)]'
                  : 'text-[var(--app-text-muted)] hover:bg-white/5 hover:text-[var(--app-text)]'
              }`}
            >
              <item.icon
                className={`h-5 w-5 transition-colors ${
                  isActive
                    ? 'text-[var(--app-accent)]'
                    : 'text-[var(--app-text-muted)] group-hover:text-[var(--app-text)]'
                }`}
              />
              <span className="font-clarity text-sm font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 h-8 w-1 rounded-r-full bg-[var(--app-accent)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {footerSlot ? <div className="mt-8 border-t border-white/8 pt-6">{footerSlot}</div> : null}
    </aside>
  );
}

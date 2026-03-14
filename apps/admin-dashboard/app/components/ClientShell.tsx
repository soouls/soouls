'use client';

import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Viewer } from '../lib/api';
import { api } from '../lib/api';
import Sidebar from './Sidebar';

type ShellContextValue = {
  viewer: Viewer | null;
  flash: string | null;
  setFlash: (msg: string | null) => void;
  refreshViewer: () => Promise<void>;
};

const ShellContext = createContext<ShellContextValue>({
  viewer: null,
  flash: null,
  setFlash: () => {},
  refreshViewer: async () => {},
});

export function useShell() {
  return useContext(ShellContext);
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  // Redirect authenticated users trying to access /sign-in page
  useEffect(() => {
    if (authLoaded && isSignedIn && pathname.startsWith('/sign-in')) {
      router.replace('/');
    }
  }, [authLoaded, isSignedIn, pathname, router]);

  const loadViewer = useCallback(async () => {
    if (pathname.startsWith('/sign-in')) {
      setLoading(false);
      return;
    }
    const me = await api<{ viewer: Viewer }>('/command-api/me');
    setViewer(me.viewer);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        setLoading(true);
        await loadViewer();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load Command Center.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [loadViewer]);

  // Auto-dismiss flash
  useEffect(() => {
    if (!flash) return;
    const timeout = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(timeout);
  }, [flash]);

  if (pathname.startsWith('/sign-in')) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl" />
            <Loader2 className="relative h-10 w-10 animate-spin text-amber-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">Loading Command Center</p>
            <p className="mt-1 text-xs text-slate-500">Authenticating & fetching telemetry…</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !viewer) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-rose-400/20 bg-rose-400/5 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-400/10">
            <span className="text-2xl">🚫</span>
          </div>
          <p className="text-lg font-medium text-rose-200">{error ?? 'Access denied.'}</p>
          <p className="mt-2 text-sm text-slate-500">
            Sign in with an email that has been invited to the Command Center.
          </p>
        </div>
      </main>
    );
  }

  return (
    <ShellContext.Provider value={{ viewer, flash, setFlash, refreshViewer: loadViewer }}>
      <div className="flex min-h-screen">
        <Sidebar viewer={viewer} />
        <main className="ml-[260px] flex-1 overflow-y-auto">
          {/* Flash notification */}
          {flash && (
            <div className="fixed right-6 top-6 z-50 animate-fade-in rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm text-emerald-200 shadow-lg shadow-emerald-500/10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {flash}
              </div>
            </div>
          )}
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ShellContext.Provider>
  );
}

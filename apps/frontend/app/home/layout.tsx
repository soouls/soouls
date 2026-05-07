'use client';

import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect } from 'react';
import { SidebarProvider, useSidebar } from '../../src/providers/sidebar-provider';
import { trpc } from '../../src/utils/trpc';
import { LogoutModal } from '../components/LogoutModal';
import { ProfileSidebar } from '../components/ProfileSidebar';

function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen, isLogoutOpen, setIsLogoutOpen, openLogout } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const { data: onboardingStatus } = trpc.private.home.getOnboardingStatus.useQuery(undefined);

  useEffect(() => {
    if (!onboardingStatus || onboardingStatus.completed) return;
    if (pathname.startsWith('/home')) {
      router.replace('/onboarding');
    }
  }, [onboardingStatus, pathname, router]);

  return (
    <>
      {children}
      <ProfileSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} onLogoutClick={openLogout} />
      <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
    </>
  );
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarWrapper>{children}</SidebarWrapper>
    </SidebarProvider>
  );
}

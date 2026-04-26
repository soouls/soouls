'use client';

import React from 'react';
import { SidebarProvider, useSidebar } from '../../src/providers/sidebar-provider';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { LogoutModal } from '../components/LogoutModal';

function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen, isLogoutOpen, setIsLogoutOpen, openLogout, closeAll } = useSidebar();

  return (
    <>
      {children}
      <ProfileSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onLogoutClick={openLogout}
      />
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
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

import { redirect } from 'next/navigation';

export default function LegacyDashboardSettingsPage() {
  redirect('/settings/team');
}

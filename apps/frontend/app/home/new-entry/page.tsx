import { Suspense } from 'react';
import NewEntryClientPage from './new-entry-page';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <NewEntryClientPage />
    </Suspense>
  );
}

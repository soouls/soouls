import { Suspense } from 'react';
import AccountPageClient from './account-page';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountPageClient />
    </Suspense>
  );
}

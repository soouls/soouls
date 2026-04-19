'use client';

import Avatar, { genConfig } from 'react-nice-avatar';

export function NiceAvatar({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  return <Avatar className={className} {...genConfig(seed)} />;
}

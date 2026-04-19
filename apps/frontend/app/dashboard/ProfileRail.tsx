'use client';

import { NiceAvatar } from '../../../components/profile/NiceAvatar';

export function ProfileRail({
  name,
  greeting,
  streakLabel,
  avatarUrl,
  avatarSeed,
}: {
  name: string;
  greeting: string;
  streakLabel: string;
  avatarUrl?: string | null;
  avatarSeed: string;
}) {
  return (
    <div className="space-y-5 rounded-[2rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_-52px_var(--app-glow)]">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${name} avatar`}
            className="h-20 w-20 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <NiceAvatar seed={avatarSeed} className="h-20 w-20 rounded-full border border-white/10" />
        )}
        <div className="space-y-1">
          <p className="font-editorial text-2xl text-white/80">{greeting}</p>
          <h2 className="font-urbanist text-4xl font-semibold leading-none text-[var(--app-accent)]">
            {name}
          </h2>
        </div>
      </div>
      <p className="font-editorial text-3xl leading-tight text-white/70">{streakLabel}</p>
    </div>
  );
}

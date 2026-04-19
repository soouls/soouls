'use client';

import { RoseLoader } from './loaders/RoseLoader';

type CurveLoaderProps = {
  className?: string;
  accentClassName?: string;
  label?: string;
};

export function CurveLoader({ className, accentClassName, label }: CurveLoaderProps) {
  return (
    <RoseLoader
      className={className}
      accentClassName={accentClassName}
      label={label ?? 'Aligning your universe'}
    />
  );
}

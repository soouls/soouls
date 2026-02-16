'use client';

import React from 'react';
import { ArtifactsSection } from './ArtifactsSection';
import { HeroSection } from './HeroSection';
import { MinimalFooter } from './MinimalFooter';
import { SundayReviewSection } from './SundayReviewSection';
import { TimelineSection } from './TimelineSection';
import { VaultSection } from './VaultSection';

export function GalaxyView() {
  return (
    <>
      <HeroSection />
      <TimelineSection />
      <VaultSection />
      <ArtifactsSection />
      <SundayReviewSection />
      <MinimalFooter />
    </>
  );
}

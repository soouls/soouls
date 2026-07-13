'use client';

import { Cookie, ShieldAlert } from 'lucide-react';

export default function CookiePolicySection() {
  return (
    <section id="cookie-policy" className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto">
        <div className="max-w-[800px] mx-auto reveal">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E07A5F]/10 mb-6">
              <Cookie className="w-6 h-6 text-[#E07A5F]" />
            </div>
            <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-6 block">
              Cookie Policy
            </span>
            <h1 className="font-playfair text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--ink)] leading-[1.1] mb-8">
              A policy of <br /> <em className="italic text-[#E07A5F]">nothing</em>
            </h1>
          </div>

          <div className="relative p-6 sm:p-8 md:p-16 rounded-3xl md:rounded-[3rem] bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 shadow-[0_10px_40px_rgba(22,19,15,0.03)] overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E07A5F]/5 blur-[60px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 space-y-12 font-urbanist text-[var(--ink-soft)] text-lg leading-relaxed max-w-2xl mx-auto">
              <p className="text-xl text-[var(--ink)] font-medium">
                At Soouls, we believe in radical transparency. Most websites use cookies to track
                your behavior across the web. We don't.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-[#e3dbcd] pb-4">
                  <ShieldAlert className="w-6 h-6 text-[#E07A5F]" />
                  <h3 className="text-[var(--ink)] text-2xl font-playfair font-bold">
                    Strictly Necessary Cookies
                  </h3>
                </div>
                <p>
                  We only use cookies that are absolutely essential for the site to function — such
                  as maintaining your authentication session so you stay logged in. These do not
                  track your activity, build an advertising profile, or identify you for any purpose
                  other than providing our core service.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-[#e3dbcd] pb-4">
                  <Cookie className="w-6 h-6 text-[#E07A5F]" />
                  <h3 className="text-[var(--ink)] text-2xl font-playfair font-bold">
                    No Marketing or Analytics
                  </h3>
                </div>
                <p>
                  We do not use third-party analytics cookies or marketing cookies. We don't care
                  where you click or how long you scroll. Your digital thoughts remain entirely
                  undisturbed by trackers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

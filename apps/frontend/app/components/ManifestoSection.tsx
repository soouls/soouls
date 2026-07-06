'use client';

import React from 'react';

export function ManifestoSection() {
  return (
    <>
      <style>{`
        /* ===== manifesto letter ===== */
        .letter { position: relative; max-width: 640px; background: var(--card); border: 1px solid var(--line); border-radius: 24px; padding: 56px 52px 46px; transform: rotate(-.6deg); box-shadow: 0 30px 70px rgba(22, 19, 15, .1); transition: transform .6s var(--ease); }
        .letter:hover { transform: rotate(0) translateY(-4px); }
        .letter .stamp { position: absolute; top: -18px; right: 34px; width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, var(--amber), var(--rose)); color: #fff; display: grid; place-items: center; font-size: 1.3rem; box-shadow: 0 10px 24px rgba(217, 138, 75, .4); animation: stampFloat 5s ease-in-out infinite; }
        @keyframes stampFloat { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(6deg) translateY(-4px); } }
        .lp { font-family: 'Fraunces', serif; font-size: 1.12rem; line-height: 1.9; color: var(--ink-soft); margin-bottom: 18px; }
        .dropcap { float: left; font-size: 3.2rem; line-height: .9; padding: 6px 10px 0 0; color: var(--amber); font-style: italic; }
        .sig { font-family: 'Fraunces', serif; font-style: italic; text-align: right; color: var(--ink); font-size: 1.05rem; margin-top: 8px; }
      `}</style>

      <section className="block" id="manifesto">
        <div className="wrap" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="letter reveal">
            <span className="stamp" aria-hidden="true">✦</span>
            <p className="kicker" style={{ justifyContent: 'center', display: 'flex' }}>Why we built this</p>
            <h2 style={{ textAlign: 'center', marginBottom: '26px' }}>A letter, before you scroll on.</h2>
            <p className="lp reveal d1">
              <span className="dropcap">W</span>e kept losing ourselves in productivity apps built for output — streaks, dashboards, guilt. Our thoughts deserved better than a to-do list with a diary bolted on.
            </p>
            <p className="lp reveal d2">
              So we built the thing we needed: a room with no audience, where a voice note at 3am and a doodle on a napkin matter as much as a perfect paragraph. Where a life doesn't have to be linear to make sense.
            </p>
            <p className="lp reveal d3">
              Soouls is our love letter to the wandering mind. We hope it becomes yours.
            </p>
            <p className="sig reveal d4">— the Soouls team ✦</p>
          </div>
        </div>
      </section>
    </>
  );
}

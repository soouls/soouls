'use client';

export default function FooterSection() {
    const marqueeText = 'Soulcanvas';
    const REPEATS = 8;

    return (
        <footer id="footer" style={{ backgroundColor: '#181511' }}>
            {/* Scrolling Soulcanvas text */}
            <div
                style={{
                    overflow: 'hidden',
                    width: '100%',
                    padding: '40px 0',
                    background: '#181511',
                    borderTop: '1px solid rgba(214,194,163,0.08)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: '60px',
                        width: 'max-content',
                        animation: 'scroll-marquee 18s linear infinite',
                    }}
                >
                    {Array.from({ length: REPEATS * 2 }).map((_, i) => (
                        <span
                            key={i}
                            className="font-playfair"
                            style={{
                                fontSize: 'clamp(60px, 7vw, 120px)',
                                lineHeight: '1em',
                                letterSpacing: '-0.035em',
                                color: 'transparent',
                                WebkitTextStroke: '1px rgba(214,194,163,0.35)',
                                whiteSpace: 'nowrap',
                                userSelect: 'none',
                            }}
                        >
                            {marqueeText}
                        </span>
                    ))}
                </div>
            </div>

            {/* Bottom footer nav */}
            <div
                style={{
                    backgroundColor: '#181511',
                    borderTop: '1px solid rgba(214,194,163,0.06)',
                    padding: '40px 60px',
                }}
            >
                <div
                    style={{
                        maxWidth: '1392px',
                        margin: '0 auto',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '40px',
                    }}
                >
                    {/* Left: Logo + tagline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '340px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Clover icon placeholder */}
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <circle cx="9" cy="9" r="8" stroke="#A8A8A8" strokeWidth="0.8" strokeOpacity="0.6" />
                                <circle cx="19" cy="9" r="8" stroke="#A8A8A8" strokeWidth="0.8" strokeOpacity="0.6" />
                                <circle cx="14" cy="18" r="8" stroke="#A8A8A8" strokeWidth="0.8" strokeOpacity="0.6" />
                            </svg>
                            <span
                                className="font-playfair"
                                style={{ fontSize: '22px', color: '#A8A8A8', lineHeight: '1em' }}
                            >
                                Soulcanvas
                            </span>
                        </div>
                        <p
                            className="font-urbanist"
                            style={{ fontSize: '14px', lineHeight: '1.6em', color: '#A8A8A8', opacity: 0.7 }}
                        >
                            Transforming the act of daily documentation into a highly aesthetic, deeply meaningful experience
                        </p>
                    </div>

                    {/* Nav links */}
                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                        {['TEAM', 'PHILOSOPHY', 'PRIVACY'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="font-urbanist"
                                style={{
                                    fontSize: '13px',
                                    letterSpacing: '0.1em',
                                    color: '#A8A8A8',
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#EFEBDD')}
                                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#A8A8A8')}
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* Copyright */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Social icons placeholder */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['X', 'IG'].map((s) => (
                                <div
                                    key={s}
                                    style={{
                                        width: 32, height: 32,
                                        border: '1px solid rgba(168,168,168,0.2)',
                                        borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#A8A8A8',
                                        fontSize: '11px',
                                        fontFamily: 'Urbanist',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {s}
                                </div>
                            ))}
                        </div>
                        <p
                            className="font-urbanist"
                            style={{ fontSize: '13px', color: '#A8A8A8', opacity: 0.6 }}
                        >
                            All rights reserved © SOULCANVAS 2026
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

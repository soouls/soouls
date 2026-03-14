'use client';

import { SiDiscord, SiInstagram, SiLinkedin, SiX } from 'react-icons/si';

const links = {
  PRODUCT: ['Features', 'Downloads', 'Release Notes'],
  COMPANY: ['About Us', 'Careers', 'Contact'],
  RESOURCES: ['Documentation', 'Blog', 'Community'],
  'LEGAL & COMPLIANCE': ['Privacy Policy', 'Terms & Services', 'Cookie Policy', 'Security'],
};

export default function FooterSection() {
  return (
    <footer
      className="relative flex flex-col overflow-hidden font-urbanist"
      style={{
        backgroundColor: '#111111', // Deep dark background
        paddingTop: '80px',
      }}
    >
      {/* Top content container */}
      <div className="relative z-20 w-full max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col pb-16">
        {/* Main Grid */}
        <div className="flex flex-col lg:flex-row justify-between w-full gap-16 lg:gap-8 mb-24">
          {/* Brand Column */}
          <div className="flex flex-col items-start lg:w-1/4">
            <div className="mb-4">
              <svg
                width="80"
                height="80"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Four hearts making a clover, simple outline match */}
                <path
                  d="M48 48 C 20 8, -5 40, 48 48 Z"
                  stroke="#E6D3B8"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinejoin="round"
                />
                <path
                  d="M52 48 C 80 8, 105 40, 52 48 Z"
                  stroke="#E6D3B8"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinejoin="round"
                />
                <path
                  d="M52 52 C 80 92, 105 60, 52 52 Z"
                  stroke="#E6D3B8"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinejoin="round"
                />
                <path
                  d="M48 52 C 20 92, -5 60, 48 52 Z"
                  stroke="#E6D3B8"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className="font-playfair font-normal"
              style={{ fontSize: '32px', color: '#E0DECE', letterSpacing: '-0.02em' }}
            >
              Soulcanvas
            </span>
          </div>

          {/* Links Columns */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {Object.entries(links).map(([title, items]) => (
              <div key={title} className="flex flex-col gap-4">
                <h4 className="text-[#FFFFFF] text-[13px] font-bold tracking-wider uppercase mb-1">
                  {title}
                </h4>
                {items.map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-[#999999] text-[14px] hover:text-[#e07a5f] hover:drop-shadow-[0_0_8px_rgba(224,122,95,0.5)] transition-all duration-300"
                  >
                    {item}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Socials and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 w-full">
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-white opacity-70 hover:opacity-100 hover:text-[#e07a5f] hover:drop-shadow-[0_0_8px_rgba(224,122,95,0.5)] transition-all duration-300"
            >
              <SiX size={20} className="fill-current" />
            </a>
            <a
              href="#"
              className="text-white opacity-70 hover:opacity-100 hover:text-[#e07a5f] hover:drop-shadow-[0_0_8px_rgba(224,122,95,0.5)] transition-all duration-300"
            >
              <SiLinkedin size={22} className="fill-current" />
            </a>
            <a
              href="#"
              className="text-white opacity-70 hover:opacity-100 hover:text-[#e07a5f] hover:drop-shadow-[0_0_8px_rgba(224,122,95,0.5)] transition-all duration-300"
            >
              <SiInstagram size={22} className="fill-current" />
            </a>
            <a
              href="#"
              className="text-white opacity-70 hover:opacity-100 hover:text-[#e07a5f] hover:drop-shadow-[0_0_8px_rgba(224,122,95,0.5)] transition-all duration-300"
            >
              <SiDiscord size={22} className="fill-current" />
            </a>
          </div>

          <span className="text-[#777777] text-[13px] tracking-wide text-center md:text-right italic md:not-italic">
            All rights reserved © SOULCANVAS 2026
          </span>
        </div>
      </div>

      {/* Repeating Outlined Background Text */}
      <div
        className="relative w-full h-[250px] overflow-hidden flex flex-col justify-end pointer-events-none select-none opacity-40 mt-[-60px]"
        style={{
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        <div className="flex flex-col items-center whitespace-nowrap leading-[0.7]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-row justify-center w-full">
              {Array.from({ length: 4 }).map((_, j) => (
                <span
                  key={`${i}-${j}`}
                  className="font-playfair font-normal px-4"
                  style={{
                    fontSize: 'clamp(100px, 16vw, 240px)',
                    color: 'transparent',
                    WebkitTextStroke: '1px rgba(255, 255, 255, 0.4)',
                  }}
                >
                  Soulcanvas
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

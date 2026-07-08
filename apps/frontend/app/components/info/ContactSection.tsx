'use client';

import { Mail, Send, MessageSquare } from 'lucide-react';
import { SiX } from 'react-icons/si';

export default function ContactSection() {
  return (
    <section id="contact" className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[1240px] mx-auto">
        
        <div className="mb-16 md:mb-24 max-w-[800px] reveal">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E07A5F]/10 mb-6">
            <MessageSquare className="w-6 h-6 text-[#E07A5F]" />
          </div>
          <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] tracking-[0.3em] uppercase mb-6 block">
            Contact
          </span>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--ink)] leading-tight mb-8">
            Reach out from <br /> <em className="italic text-[#E07A5F]">the silence</em>
          </h1>
          <p className="font-urbanist text-xl text-[var(--ink-soft)] mb-12 max-w-xl leading-relaxed">
            Whether you have a question, a suggestion, or just want to share your thoughts — we are always listening.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start mb-20 md:mb-32">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 flex flex-col gap-10 reveal" style={{ transitionDelay: '100ms' }}>
            
            <a href="mailto:hello@soouls.in" className="group p-8 rounded-3xl md:rounded-[2.5rem] bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 hover:bg-white hover:border-[#E07A5F]/30 hover:shadow-[0_20px_40px_rgba(224,122,95,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden relative flex flex-col items-start">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E07A5F]/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10 w-full">
                <div className="w-12 h-12 rounded-2xl bg-[#E07A5F]/10 text-[#E07A5F] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-urbanist text-[11px] font-bold text-[var(--ink-soft)] tracking-[0.3em] uppercase mb-2 block">
                  Email
                </span>
                <span className="font-playfair text-3xl font-bold text-[var(--ink)] group-hover:text-[#E07A5F] transition-colors break-all">
                  hello@soouls.in
                </span>
              </div>
            </a>

            <a href="https://x.com/Soouls_in" target="_blank" rel="noreferrer" className="group p-8 rounded-3xl md:rounded-[2.5rem] bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 hover:bg-white hover:border-[#E07A5F]/30 hover:shadow-[0_20px_40px_rgba(224,122,95,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden relative flex flex-col items-start">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E07A5F]/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10 w-full">
                <div className="w-12 h-12 rounded-2xl bg-black/5 text-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <SiX className="w-5 h-5" />
                </div>
                <span className="font-urbanist text-[11px] font-bold text-[var(--ink-soft)] tracking-[0.3em] uppercase mb-2 block">
                  X (Twitter)
                </span>
                <span className="font-playfair text-3xl font-bold text-[var(--ink)] group-hover:text-[#E07A5F] transition-colors break-all">
                  @sooulsapp
                </span>
              </div>
            </a>

          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 md:p-14 rounded-3xl md:rounded-[3rem] bg-[#fdfaf6]/80 backdrop-blur-3xl border border-[#e3dbcd]/60 relative overflow-hidden shadow-[0_10px_40px_rgba(22,19,15,0.03)] reveal group" style={{ transitionDelay: '200ms' }}>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E07A5F]/10 blur-[80px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10">
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-3">
                    <label htmlFor="contactName" className="font-urbanist text-[11px] font-bold text-[var(--ink-soft)] tracking-widest uppercase ml-4">
                      Name
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      className="bg-white/50 border border-[#e3dbcd] rounded-3xl px-8 py-5 text-[var(--ink)] font-urbanist focus:outline-none focus:border-[#E07A5F] focus:ring-4 focus:ring-[#E07A5F]/10 focus:bg-white transition-all shadow-sm"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label htmlFor="contactEmail" className="font-urbanist text-[11px] font-bold text-[var(--ink-soft)] tracking-widest uppercase ml-4">
                      Email
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      className="bg-white/50 border border-[#e3dbcd] rounded-3xl px-8 py-5 text-[var(--ink)] font-urbanist focus:outline-none focus:border-[#E07A5F] focus:ring-4 focus:ring-[#E07A5F]/10 focus:bg-white transition-all shadow-sm"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <label htmlFor="contactMessage" className="font-urbanist text-[11px] font-bold text-[var(--ink-soft)] tracking-widest uppercase ml-4">
                    Message
                  </label>
                  <textarea
                    id="contactMessage"
                    rows={6}
                    className="bg-white/50 border border-[#e3dbcd] rounded-3xl px-8 py-6 text-[var(--ink)] font-urbanist focus:outline-none focus:border-[#E07A5F] focus:ring-4 focus:ring-[#E07A5F]/10 focus:bg-white resize-none transition-all shadow-sm leading-relaxed"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>

                <button
                  type="button"
                  className="group/btn w-full py-6 bg-[var(--ink)] text-[#f7f3ec] font-urbanist font-bold tracking-widest uppercase text-sm rounded-full hover:bg-black hover:shadow-[0_10px_30px_rgba(22,19,15,0.2)] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  Send Message
                  <Send className="w-4 h-4 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 group-hover/btn:text-[#E07A5F] transition-all" />
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

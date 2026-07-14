export default function CTASection() {
  return (
    <section className="py-24 px-6 relative z-10 flex justify-center">
      <div className="bg-[#e6e2f8] relative overflow-hidden w-full max-w-6xl rounded-[2rem] md:rounded-[3rem] py-16 px-6 md:py-28 md:px-8 flex flex-col items-center text-center shadow-sm">
        {/* Peach gradient blur */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-[#fde1d3] rounded-full blur-[80px] opacity-80 pointer-events-none" />

        <span className="text-[#6450d6] text-[10px] font-bold tracking-[0.2em] uppercase mb-8 z-10">Start Now</span>

        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-[#16130f] max-w-3xl leading-[1.1] mb-6 tracking-tight z-10">
          Your mind has been waiting for a page that <em className="font-playfair font-normal italic text-[#6450d6]">moves</em> like it does
        </h2>

        <p className="text-[#4a4237] text-lg mb-10 z-10">
          Free to start. No credit card, no ads, no straight lines.
        </p>

        {/* Platform Availability Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-14 z-10 w-full max-w-2xl">
          <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.7)] px-4 py-2.5 rounded-xl border border-white shadow-sm backdrop-blur-md transition-transform hover:-translate-y-1 cursor-default">
            <span className="relative flex h-2.5 w-2.5 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <svg className="w-4 h-4 text-[#16130f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span className="text-sm font-semibold text-[#16130f]">Web App Available</span>
          </div>

          <div className="flex items-center gap-2 bg-white/30 px-4 py-2.5 rounded-xl border border-white/40 backdrop-blur-sm transition-transform hover:-translate-y-1 cursor-default text-sm text-[#4a4237]">
            <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91 1.65.17 2.79.85 3.51 2.05-3.1 1.9-2.58 5.75.52 7-1.12 1.34-2.18 2.61-3.24 3.61zM12.03 7.25c-.15-1.54 1.15-3.13 2.77-3.32.29 1.66-1.15 3.16-2.77 3.32z" /></svg>
            <span className="font-medium">iOS Soon</span>
          </div>

          <div className="flex items-center gap-2 bg-white/30 px-4 py-2.5 rounded-xl border border-white/40 backdrop-blur-sm transition-transform hover:-translate-y-1 cursor-default text-sm text-[#4a4237]">
            <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414c-.0661 0-.1291.0263-.1759.0732l-1.6372 1.6372c-.0469.0469-.0732.1098-.0732.1759v2.1035c0 .1379.1119.249.249.249h4.3725c.137 0 .249-.1111.249-.249v-2.1035c0-.0661-.0263-.129-.0732-.1759l-1.6372-1.6372c-.0468-.0469-.1098-.0732-.1759-.0732h-1.0978zM6.5413 15.3414c-.066 0-.129.0263-.1758.0732l-1.6372 1.6372c-.0469.0469-.0732.1098-.0732.1759v2.1035c0 .1379.1118.249.249.249h4.3725c.1371 0 .249-.1111.249-.249v-2.1035c0-.0661-.0263-.129-.0732-.1759L7.8152 15.4146c-.0468-.0469-.1098-.0732-.1759-.0732H6.5413zm12.3168-5.3216c.3215-1.579.5298-3.2359.5298-4.9575 0-1.7216-.2083-3.3785-.5298-4.9575L15.3674.195C14.7303 3.3106 13.5684 6.223 11.9791 8.7831l6.879 1.2367zM5.1419 5.0623C4.8204 6.6413 4.6121 8.2982 4.6121 10.0198c0 1.7216.2083 3.3785.5298 4.9575l3.4907-1.2367C7.0433 11.1804 5.8814 8.268 5.2443 5.1524l-1.1024-.0901zm6.8372-4.0487L8.9863 1.9429 8.941 2.227c-1.3934 8.7906-1.5772 16.7115-.5581 21.0563l2.8464-.5379c-1.0261-4.3752-.8572-12.277.525-21.0116l-3.003-1.0664-3.5283.3323 11.6033-1.8953-.7871 1.9082z" /></svg>
            <span className="font-medium">Android Soon</span>
          </div>

          <div className="flex items-center gap-2 bg-white/30 px-4 py-2.5 rounded-xl border border-white/40 backdrop-blur-sm transition-transform hover:-translate-y-1 cursor-default text-sm text-[#4a4237]">
            <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            <span className="font-medium">Desktop Soon</span>
          </div>
        </div>

        <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-4 mb-16 z-10 px-4 sm:px-0">
          <button className="bg-[#16130f] text-[#f7f3ec] px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform shadow-md">
            Start your first entry
          </button>
          <button className="border border-[#16130f]/20 text-[#16130f] bg-transparent px-8 py-4 rounded-full font-medium hover:bg-[#16130f]/5 transition-colors">
            Watch a 90-second tour
          </button>
        </div>

        <div className="flex flex-col items-center z-10">
          <p className="text-[#4a4237] text-sm mb-6 font-medium">Still deciding? Ask an AI what it thinks of Soouls.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white px-6 py-3 rounded-full shadow-sm text-sm font-semibold text-[#16130f] flex items-center gap-3 hover:-translate-y-1 transition-transform">
              <span className="w-3 h-3 rounded-full bg-[#10a37f]" /> Ask ChatGPT
            </button>
            <button className="bg-white px-6 py-3 rounded-full shadow-sm text-sm font-semibold text-[#16130f] flex items-center gap-3 hover:-translate-y-1 transition-transform">
              <span className="w-3 h-3 rounded-full bg-[#d97757]" /> Ask Claude
            </button>
            <button className="bg-white px-6 py-3 rounded-full shadow-sm text-sm font-semibold text-[#16130f] flex items-center gap-3 hover:-translate-y-1 transition-transform">
              <span className="w-3 h-3 rounded-full bg-[#228496]" /> Ask Perplexity
            </button>
          </div>
          <p className="text-[10px] text-[#4a4237]/50 mt-5 tracking-wide">Opens in a new tab — no account needed to ask.</p>
        </div>
      </div>
    </section>
  );
}

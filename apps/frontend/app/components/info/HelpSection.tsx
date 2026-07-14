'use client';

import { useState } from 'react';
import { 
  SearchIcon, 
  GridIcon, 
  UserCircleIcon, 
  CreditCardIcon, 
  LockIcon,
  PlusIcon,
  LifeBuoy
} from 'lucide-react';

export default function HelpSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});

  const toggleFaq = (id: string) => {
    setOpenFaqs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { id: 'all', title: 'All topics', desc: 'Browse everything', icon: GridIcon, color: 'text-[var(--soouls-accent)]', bgHover: 'hover:border-[var(--soouls-accent)]' },
    { id: 'account', title: 'Account', desc: 'Sign in, sync, delete', icon: UserCircleIcon, color: 'text-[#6450d6]', bgHover: 'hover:border-[#6450d6]' },
    { id: 'billing', title: 'Billing', desc: 'Plans, cancel, refunds', icon: CreditCardIcon, color: 'text-[var(--soouls-accent)]', bgHover: 'hover:border-[var(--soouls-accent)]' },
    { id: 'privacy', title: 'Privacy & data', desc: 'Encryption, export', icon: LockIcon, color: 'text-[#4ea896]', bgHover: 'hover:border-[#4ea896]' },
  ];

  const faqs = [
    { id: 'acc-1', category: 'account', q: 'How do I sync my entries across devices?', a: 'Signing in with the same account on web, iOS, and Android automatically syncs your entries. Sync happens in the background whenever you have an internet connection.' },
    { id: 'acc-2', category: 'account', q: 'Can I change my email address?', a: "Yes, from Settings → Account. You'll need to verify the new address before the change takes effect." },
    { id: 'acc-3', category: 'account', q: 'How do I permanently delete my account?', a: 'Go to Account → Data & Ownership → Delete account. This is permanent and removes your entries from active systems within 30 days. We recommend exporting your data first.' },
    { id: 'bil-1', category: 'billing', q: 'How do I cancel my subscription?', a: 'Settings → Billing → Cancel plan. Your access continues until the end of the current billing period, and your entries are never affected.' },
    { id: 'bil-2', category: 'billing', q: 'What happens to my entries if I downgrade?', a: "Nothing is deleted. You'll lose access to features tied to the higher tier, like Sunday Review or unlimited clusters, but every entry stays readable and exportable." },
    { id: 'bil-3', category: 'billing', q: 'Do you offer refunds?', a: 'Yes — a full refund within 14 days of your first payment on any paid plan, no questions asked. Contact support to request one.' },
    { id: 'pri-1', category: 'privacy', q: 'Is my journal actually private?', a: 'Yes. Entries are encrypted at rest and in transit, and access to production data is restricted and audit-logged. We never sell your data or use it for advertising.' },
    { id: 'pri-2', category: 'privacy', q: 'Are my entries used to train any AI model?', a: 'No, on any plan, ever. Insight generation processes your entries to serve you personally and is never retained to train models.' },
    { id: 'pri-3', category: 'privacy', q: 'How do I export all of my data?', a: "Settings → Data & Ownership → Download your data. You'll get a complete export in an open, portable format within a few minutes." }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[900px] mx-auto">
        
        {/* Hero */}
        <div className="mb-20 text-center reveal">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#6450d6]/10 mb-6">
            <LifeBuoy className="w-6 h-6 text-[#6450d6]" />
          </div>
          <span className="font-urbanist text-[11px] font-bold text-[#6450d6] font-semibold tracking-tight mb-4 block">
            Support Center
          </span>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--ink)] leading-tight mb-8">
            How can we <span className="italic text-[#6450d6]">help</span> you?
          </h1>
          
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6450d6]/20 to-[var(--soouls-accent)]/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative flex items-center bg-[rgba(var(--soouls-bg-elevated-rgb),0.8)] backdrop-blur-md border border-[var(--soouls-border)] rounded-full p-2 shadow-sm focus-within:border-[#6450d6] focus-within:shadow-[0_8px_30px_rgba(100,80,214,0.15)] transition-colors transition-transform transition-shadow duration-300">
              <SearchIcon className="w-5 h-5 text-[var(--ink-faint)] ml-4 shrink-0" />
              <input 
                type="text" 
                placeholder="Search for an answer…" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-3 px-4 font-urbanist text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {!searchQuery && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20 reveal" style={{ transitionDelay: '100ms' }}>
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`group relative p-6 rounded-2xl md:rounded-[2rem] border text-left transition-colors transition-transform transition-shadow duration-300 overflow-hidden ${
                    isActive 
                      ? 'bg-[var(--ink)] border-[var(--ink)] text-[var(--paper)] shadow-xl scale-105 z-10' 
                      : `bg-[rgba(var(--soouls-bg-elevated-rgb),0.6)] backdrop-blur-md border-[var(--soouls-border)] text-[var(--ink)] ${cat.bgHover} hover:-translate-y-1 hover:shadow-lg`
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity duration-300 ${isActive ? 'bg-[rgba(var(--soouls-bg-elevated-rgb),1)] opacity-10' : cat.color.replace('text-', 'bg-')} group-hover:opacity-30`} />
                  
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-active:scale-95 ${
                    isActive ? 'bg-[rgba(var(--soouls-bg-elevated-rgb),0.1)]' : 'bg-[rgba(var(--soouls-bg-elevated-rgb),1)] border border-[var(--soouls-border)] shadow-sm'
                  }`}>
                    <Icon size={20} strokeWidth={2} className={isActive ? 'text-white' : cat.color} />
                  </div>
                  <h4 className="relative z-10 font-playfair font-bold text-xl mb-2">{cat.title}</h4>
                  <p className={`relative z-10 font-urbanist text-sm leading-snug ${isActive ? 'text-white/70' : 'text-[var(--ink-faint)]'}`}>
                    {cat.desc}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* FAQs */}
        <div className="reveal" style={{ transitionDelay: '200ms' }}>
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-20 bg-[rgba(var(--soouls-bg-elevated-rgb),0.6)] backdrop-blur-md border border-[var(--soouls-border)] rounded-3xl md:rounded-[3rem] font-urbanist text-lg text-[var(--ink-soft)] shadow-inner">
              <SearchIcon className="w-12 h-12 text-[var(--ink-faint)] mx-auto mb-4 opacity-50" />
              No results found for "<span className="italic">{searchQuery}</span>"
              <br />
              <span className="text-sm mt-2 block">Try a different term or contact support below.</span>
            </div>
          ) : (
            <div className="space-y-8">
              {['account', 'billing', 'privacy'].map((category, catIdx) => {
                const categoryFaqs = filteredFaqs.filter(f => f.category === category);
                if (categoryFaqs.length === 0) return null;
                
                const catInfo = categories.find(c => c.id === category);

                return (
                  <div key={category} className="mb-12 last:mb-0 reveal" style={{ transitionDelay: `${catIdx * 100}ms` }}>
                    <div className="flex items-center gap-3 mb-6 pl-2">
                      <div className={`w-2 h-2 rounded-full ${catInfo?.color.replace('text-', 'bg-')}`} />
                      <h3 className={`font-urbanist text-xs font-bold font-semibold tracking-tight ${catInfo?.color}`}>
                        {catInfo?.title}
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      {categoryFaqs.map((faq, faqIdx) => {
                        const isOpen = openFaqs[faq.id];
                        return (
                          <div 
                            key={faq.id} 
                            className={`group border rounded-[1.5rem] overflow-hidden transition-colors transition-transform transition-shadow duration-300 ${
                              isOpen 
                                ? `bg-[rgba(var(--soouls-bg-elevated-rgb),1)] border-[var(--soouls-border)] shadow-[0_10px_30px_rgba(0,0,0,0.03)]` 
                                : 'bg-[rgba(var(--soouls-bg-elevated-rgb),0.4)] backdrop-blur-sm border-[var(--soouls-border)] hover:bg-[rgba(var(--soouls-bg-elevated-rgb),1)] hover:border-[var(--soouls-border)] hover:shadow-md'
                            }`}
                          >
                            <button 
                              onClick={() => toggleFaq(faq.id)}
                              className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none"
                            >
                              <span className="font-playfair font-bold text-xl text-[var(--ink)] pr-8 group-hover:text-[var(--soouls-accent)] transition-colors">
                                {faq.q}
                              </span>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors transition-transform transition-shadow duration-300 ${
                                isOpen 
                                  ? `rotate-45 ${catInfo?.color.replace('text-', 'bg-')} text-white shadow-lg scale-110` 
                                  : 'bg-[rgba(var(--soouls-bg-elevated-rgb),1)] border border-[var(--soouls-border)] text-[var(--ink-soft)] group-active:scale-95'
                              }`}>
                                <PlusIcon size={18} strokeWidth={2} />
                              </div>
                            </button>
                            <div 
                              className={`px-6 md:px-8 font-urbanist text-base text-[var(--ink-soft)] leading-relaxed transition-colors transition-transform transition-shadow duration-300 overflow-hidden ${
                                isOpen ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0 pb-0'
                              }`}
                            >
                              <div className="pt-2 border-t border-[var(--line)] border-dashed mt-2">
                                {faq.a}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-24 max-w-4xl mx-auto text-center reveal" style={{ transitionDelay: '400ms' }}>
          <div className="relative bg-gradient-to-br from-[rgba(var(--soouls-bg-elevated-rgb),0.8)] to-[rgba(var(--soouls-bg-elevated-rgb),0.4)] backdrop-blur-3xl border border-[var(--soouls-border)] shadow-[0_8px_32px_rgba(100,80,214,0.06)] rounded-3xl md:rounded-[3rem] p-8 sm:p-12 md:p-20 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#6450d6]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h3 className="font-playfair text-4xl font-bold text-[var(--ink)] mb-4">
                Still <span className="italic text-[#6450d6]">stuck?</span>
              </h3>
              <p className="font-urbanist text-lg text-[var(--ink-soft)] mb-10 max-w-md mx-auto">
                Real humans read every message, usually within a day. We're here for you.
              </p>
              <a href="mailto:support@soouls.in" className="inline-block px-10 py-4 bg-[var(--ink)] text-[var(--paper)] rounded-full font-urbanist font-bold text-sm font-semibold tracking-tight active:scale-[0.97] transition-all duration-200">
                Contact support
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

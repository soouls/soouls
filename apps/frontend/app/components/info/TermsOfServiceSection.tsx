'use client';

import { Scale, Users, CreditCard, ShieldAlert, Database, Power, AlertTriangle, AlertOctagon, Scale3D, Mail } from 'lucide-react';

export default function TermsOfServiceSection() {
  const sections = [
    {
      id: 'acceptance',
      icon: Scale,
      title: 'Acceptance of terms',
      short: 'By using Soouls, you agree to these terms.',
      content: (
        <p>These Terms of Service govern your use of Soouls, including the web application, iOS app, and Android app (together, the "Service"). By creating an account or using the Service, you agree to be bound by these terms. If you don't agree, please don't use Soouls.</p>
      )
    },
    {
      id: 'accounts',
      icon: Users,
      title: 'Accounts',
      short: 'You must be at least 16 to create an account.',
      content: (
        <p>You must be at least 16 years old to create a Soouls account. You're responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately if you suspect unauthorized access.</p>
      )
    },
    {
      id: 'subscriptions',
      icon: CreditCard,
      title: 'Subscriptions & billing',
      short: "Cancel anytime. Your entries stay yours on any plan.",
      content: (
        <>
          <p className="mb-4">Node is free indefinitely. Soul and Universe are paid subscriptions billed monthly or annually. Subscriptions renew automatically until cancelled. You can cancel at any time from Settings; cancellation takes effect at the end of the current billing period, and we do not provide partial-period refunds except where required by law (such as our 14-day money-back window).</p>
          <p>Prices may change with at least 30 days' notice. Downgrading a plan never deletes your existing entries — you simply lose access to higher-tier features.</p>
        </>
      )
    },
    {
      id: 'acceptable-use',
      icon: ShieldAlert,
      title: 'Acceptable use',
      short: 'Do not misuse the platform or violate laws.',
      content: (
        <>
          <p className="mb-4">You agree not to use Soouls to:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><span className="text-[#E07A5F]">•</span> Violate any applicable law or the rights of others.</li>
            <li className="flex gap-2"><span className="text-[#E07A5F]">•</span> Attempt to gain unauthorized access to other accounts.</li>
            <li className="flex gap-2"><span className="text-[#E07A5F]">•</span> Reverse-engineer, scrape, or interfere with infrastructure.</li>
            <li className="flex gap-2"><span className="text-[#E07A5F]">•</span> Upload malicious code or disrupt the Service.</li>
          </ul>
        </>
      )
    },
    {
      id: 'your-content',
      icon: Database,
      title: 'Your content',
      short: 'You own everything you write. We claim no ownership.',
      content: (
        <p>You retain full ownership of everything you write, record, or draw in Soouls. By using the Service, you grant us a limited license to store, encrypt, transmit, and process your content <em>solely</em> to provide the features you use (like generating your Sunday Review).</p>
      )
    },
    {
      id: 'availability',
      icon: Power,
      title: 'Availability & changes',
      short: 'We aim for high uptime but do not guarantee it.',
      content: (
        <p>We aim for high availability but don't guarantee the Service will be uninterrupted or error-free. We may update, modify, or discontinue features over time; where a change materially reduces functionality on a paid plan, we'll provide reasonable notice.</p>
      )
    },
    {
      id: 'termination',
      icon: AlertTriangle,
      title: 'Termination',
      short: 'We can suspend accounts that violate these terms.',
      content: (
        <p>You may delete your account at any time from Settings. We may suspend or terminate accounts that violate these terms, with notice where practical. Upon termination, your right to use the Service ends, though your data deletion rights remain unaffected.</p>
      )
    },
    {
      id: 'disclaimers',
      icon: AlertOctagon,
      title: 'Disclaimers',
      short: 'Soouls is not a substitute for professional medical advice.',
      content: (
        <p>Soouls is a personal reflection tool. It is not a substitute for professional medical, psychological, or psychiatric advice, diagnosis, or treatment. If you're experiencing a mental health crisis, please contact a licensed professional or local emergency services. The Service is provided "as is" without warranties of any kind.</p>
      )
    },
    {
      id: 'liability',
      icon: Scale3D,
      title: 'Limitation of liability',
      short: 'Our liability is limited to the amount you paid us.',
      content: (
        <p>To the maximum extent permitted by law, Soouls and its team will not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability for any claim relating to the Service is limited to the amount you paid us in the 12 months preceding the claim.</p>
      )
    },
    {
      id: 'contact',
      icon: Mail,
      title: 'Contact us',
      short: 'legal@soouls.in',
      content: (
        <p>Questions about these terms can be sent to <a href="mailto:legal@soouls.in" className="text-[#E07A5F] hover:underline font-bold">legal@soouls.in</a>.</p>
      )
    }
  ];

  return (
    <section className="relative w-full py-10 bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-[900px] mx-auto">
        
        {/* Header */}
        <div className="mb-16 md:mb-24 text-center reveal">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E07A5F]/10 mb-6">
            <Scale className="w-6 h-6 text-[#E07A5F]" />
          </div>
          <span className="font-urbanist text-[11px] font-bold text-[#E07A5F] font-semibold tracking-tight mb-4 block">
            Legal & Trust
          </span>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--ink)] leading-tight mb-6">
            Terms of <span className="italic text-[#E07A5F]">Service</span>
          </h1>
          <p className="font-urbanist text-lg text-[var(--ink-soft)] max-w-xl mx-auto">
            Last updated July 1, 2026. By using Soouls, you agree to these terms.
          </p>
        </div>

        {/* Animated Staggered Cards */}
        <div className="space-y-6">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div 
                key={sec.id} 
                id={sec.id}
                className="group relative bg-[#fdfaf6]/60 backdrop-blur-md border border-[#e3dbcd]/50 rounded-2xl md:rounded-[2rem] p-6 md:p-10 transition-colors transition-transform transition-shadow duration-300 hover:bg-white/90 hover:shadow-[0_20px_40px_rgba(224,122,95,0.08)] hover:-translate-y-1 reveal"
                style={{ transitionDelay: `${(idx % 5) * 100}ms` }}
              >
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#E07A5F]/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  <div className="md:w-1/3 shrink-0">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#e3dbcd] flex items-center justify-center shadow-sm group-active:scale-95 transition-transform duration-300">
                        <Icon className="w-5 h-5 text-[var(--ink)] group-hover:text-[#E07A5F] transition-colors duration-300" />
                      </div>
                      <h2 className="font-playfair text-2xl font-bold text-[var(--ink)]">
                        {sec.title}
                      </h2>
                    </div>
                    <div className="p-4 bg-[#E07A5F]/5 rounded-xl border border-[#E07A5F]/10">
                      <p className="font-urbanist text-sm font-bold text-[#E07A5F] leading-snug m-0">
                        {sec.short}
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 font-urbanist text-[var(--ink-soft)] leading-relaxed pt-2">
                    {sec.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

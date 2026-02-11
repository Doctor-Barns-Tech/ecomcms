'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { useRecaptcha } from '@/hooks/useRecaptcha';

function FooterSection({ title, children }: { title: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 lg:border-none last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left lg:py-0 lg:cursor-default lg:mb-6"
      >
        <h4 className="font-semibold text-[11px] uppercase tracking-[0.25em] text-slate-600">{title}</h4>
        <i className={`ri-arrow-down-s-line text-slate-400 text-lg transition-transform duration-300 lg:hidden ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0 lg:max-h-full lg:overflow-visible'}`}>
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  const { getSetting, getSettingJSON } = useCMS();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { getToken } = useRecaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // reCAPTCHA verification
    const isHuman = await getToken('newsletter');
    if (!isHuman) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Newsletter simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setEmail('');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const siteName = getSetting('site_name') || 'StandardStore';
  const siteTagline = getSetting('site_tagline') || 'Uncompromising Quality.';
  const contactEmail = getSetting('contact_email') || '';
  const contactPhone = getSetting('contact_phone') || '';

  // CMS-driven footer config
  const footerLogo = getSetting('footer_logo') || getSetting('site_logo') || '/logo.png';
  const showNewsletter = getSetting('footer_show_newsletter') !== 'false';
  const newsletterTitle = getSetting('footer_newsletter_title') || 'Stay Connected';
  const newsletterSubtitle = getSetting('footer_newsletter_subtitle') || 'Join our exclusive list for early access to new collections and events.';
  const poweredBy = getSetting('footer_powered_by') || 'Doctor Barns Tech';
  const poweredByLink = getSetting('footer_powered_by_link') || 'https://doctorbarns.com';

  const col1Title = getSetting('footer_col1_title') || 'Shop';
  const col1Links = getSettingJSON<{ label: string; href: string }[]>('footer_col1_links_json', [
    { label: 'All Products', href: '/shop' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'Best Sellers', href: '/shop?sort=popular' },
    { label: 'Collections', href: '/shop' }
  ]);
  const col2Title = getSetting('footer_col2_title') || 'Support';
  const col2Links = getSettingJSON<{ label: string; href: string }[]>('footer_col2_links_json', [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping & Delivery', href: '/shipping' },
    { label: 'Returns & Exchanges', href: '/returns' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Track Order', href: '/order-tracking' }
  ]);
  const col3Title = getSetting('footer_col3_title') || 'Legal';
  const col3Links = getSettingJSON<{ label: string; href: string }[]>('footer_col3_links_json', [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Accessibility', href: '/accessibility' }
  ]);
  const socialLinks = [
    { icon: 'ri-instagram-line', href: getSetting('social_instagram') },
    { icon: 'ri-facebook-circle-line', href: getSetting('social_facebook') },
    { icon: 'ri-twitter-x-line', href: getSetting('social_twitter') },
    { icon: 'ri-tiktok-line', href: getSetting('social_tiktok') },
    { icon: 'ri-youtube-line', href: getSetting('social_youtube') },
    { icon: 'ri-whatsapp-line', href: getSetting('social_whatsapp') }
  ].filter((item) => item.href);

  return (
    <footer className="bg-gradient-to-b from-white via-stone-50 to-stone-100 text-slate-700 pt-20 pb-10 border-t border-slate-200">
      {showNewsletter && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm px-6 sm:px-10 py-10 flex flex-col lg:flex-row gap-10 items-center">
            <div className="max-w-xl text-center lg:text-left space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">Stay in the loop</p>
              <h3 className="font-serif text-3xl text-slate-900">{newsletterTitle}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{newsletterSubtitle}</p>
              {submitStatus === 'success' && (
                <p className="text-emerald-600 text-xs uppercase tracking-[0.3em]">You are on the list ✨</p>
              )}
              {submitStatus === 'error' && (
                <p className="text-red-500 text-xs uppercase tracking-[0.3em]">Please try again.</p>
              )}
            </div>

            <div className="w-full max-w-md">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 bg-stone-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-semibold uppercase tracking-[0.3em] hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? '...' : 'Join'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
                <img src={footerLogo} alt={siteName} className="h-10 w-auto object-contain" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-semibold tracking-[0.3em] uppercase text-slate-900">{siteName}</span>
                <span className="text-xs tracking-[0.4em] uppercase text-slate-400">Since {new Date().getFullYear()}</span>
              </div>
            </Link>

            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">{siteTagline}</p>

            <div className="space-y-3 text-sm text-slate-600">
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-3 hover:text-emerald-700 transition-colors">
                  <i className="ri-phone-line text-emerald-600" />
                  {contactPhone}
                </a>
              )}
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 hover:text-emerald-700 transition-colors">
                  <i className="ri-mail-line text-emerald-600" />
                  {contactEmail}
                </a>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.icon}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                  >
                    <i className={`${social.icon} text-lg`}></i>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FooterSection title={col1Title}>
              <ul className="space-y-3 pb-6 lg:pb-0">
                {col1Links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterSection>

            <FooterSection title={col2Title}>
              <ul className="space-y-3 pb-6 lg:pb-0">
                {col2Links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterSection>

            <FooterSection title={col3Title}>
              <ul className="space-y-3">
                {col3Links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterSection>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-400">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {poweredBy && (
              <span className="flex items-center gap-1">
                Powered by <a href={poweredByLink} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-600 transition-colors">{poweredBy}</a>
              </span>
            )}
            <Link href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-emerald-600 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

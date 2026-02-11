'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { useRecaptcha } from '@/hooks/useRecaptcha';

function FooterSection({ title, children }: { title: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-800 lg:border-none last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left lg:py-0 lg:cursor-default lg:mb-8"
      >
        <h4 className="font-bold text-xs uppercase tracking-[0.15em] text-white">{title}</h4>
        <i className={`ri-arrow-down-s-line text-gray-500 text-lg transition-transform duration-300 lg:hidden ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0 lg:max-h-full lg:overflow-visible'}`}>
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

  return (
    <footer className="bg-black text-white pt-20 pb-8 border-t border-gray-900">

      {/* Newsletter - Top Bordered Section */}
      {showNewsletter && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 border-b border-gray-800 pb-20">
            <div className="max-w-xl text-center lg:text-left">
              <h3 className="font-serif text-3xl mb-4 text-white">{newsletterTitle}</h3>
              <p className="text-gray-400 font-light text-sm leading-relaxed">{newsletterSubtitle}</p>
              {submitStatus === 'success' && (
                <p className="text-emerald-500 text-xs mt-4 uppercase tracking-wider">
                  You have successfully joined the list.
                </p>
              )}
              {submitStatus === 'error' && (
                <p className="text-red-500 text-xs mt-4 uppercase tracking-wider">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>

            <div className="w-full max-w-md">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-transparent border-b border-gray-700 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors text-lg font-light"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="inline-block">
              {/* Using CSS filter to make logo white if needed, or rely on white version */}
              <img src={footerLogo} alt={siteName} className="h-20 w-auto object-contain brightness-0 invert opacity-90" />
            </Link>

            <p className="text-gray-400 text-sm font-light leading-relaxed max-w-xs">
              {siteTagline}
            </p>

            <div className="flex gap-6">
              {[
                { icon: 'ri-instagram-line', href: '#' },
                { icon: 'ri-facebook-fill', href: '#' },
                { icon: 'ri-twitter-x-line', href: '#' },
                { icon: 'ri-pinterest-line', href: '#' }
              ].map((social, i) => (
                <a key={i} href={social.href} className="text-gray-500 hover:text-white transition-colors">
                  <i className={`${social.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Links Columns */}
          <div className="lg:col-span-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <FooterSection title={col1Title}>
              <ul className="space-y-4">
                {col1Links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterSection>

            <FooterSection title={col2Title}>
              <ul className="space-y-4">
                {col2Links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterSection>

            <FooterSection title={col3Title}>
              <ul className="space-y-4">
                {col3Links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterSection>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-900 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-wider text-gray-600">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>

          <div className="flex items-center gap-6">
            {poweredBy && (
              <span className="flex items-center gap-1">
                Powered by <a href={poweredByLink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">{poweredBy}</a>
              </span>
            )}
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { useRecaptcha } from '@/hooks/useRecaptcha';

function FooterSection({ title, children }: { title: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-emerald-800/50 lg:border-none last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left lg:py-0 lg:cursor-default lg:mb-6"
      >
        <h4 className="font-bold text-lg text-white">{title}</h4>
        <i className={`ri-arrow-down-s-line text-emerald-400 text-xl transition-transform duration-300 lg:hidden ${isOpen ? 'rotate-180' : ''}`}></i>
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
  const siteTagline = getSetting('site_tagline') || 'Premium Shopping Experience';
  const contactEmail = getSetting('contact_email') || '';
  const contactPhone = getSetting('contact_phone') || '';
  const socialFacebook = getSetting('social_facebook') || '';
  const socialInstagram = getSetting('social_instagram') || '';
  const socialTwitter = getSetting('social_twitter') || '';
  const socialTiktok = getSetting('social_tiktok') || '';
  const socialYoutube = getSetting('social_youtube') || '';

  // CMS-driven footer config
  const footerLogo = getSetting('footer_logo') || getSetting('site_logo') || '/logo.png';
  const showNewsletter = getSetting('footer_show_newsletter') !== 'false';
  const newsletterTitle = getSetting('footer_newsletter_title') || 'Join Our Community';
  const newsletterSubtitle = getSetting('footer_newsletter_subtitle') || 'Get exclusive access to new arrivals, secret sales, and more.';
  const poweredBy = getSetting('footer_powered_by') || 'Doctor Barns Tech';
  const poweredByLink = getSetting('footer_powered_by_link') || 'https://doctorbarns.com';

  const col1Title = getSetting('footer_col1_title') || 'Shop';
  const col1Links = getSettingJSON<{ label: string; href: string }[]>('footer_col1_links_json', [
    { label: 'All Products', href: '/shop' },
    { label: 'Categories', href: '/categories' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'Best Sellers', href: '/shop?sort=bestsellers' }
  ]);
  const col2Title = getSetting('footer_col2_title') || 'Customer Care';
  const col2Links = getSettingJSON<{ label: string; href: string }[]>('footer_col2_links_json', [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Track My Order', href: '/order-tracking' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns Policy', href: '/returns' }
  ]);
  const col3Title = getSetting('footer_col3_title') || 'Company';
  const col3Links = getSettingJSON<{ label: string; href: string }[]>('footer_col3_links_json', [
    { label: 'Our Story', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' }
  ]);

  return (
    <footer className="bg-emerald-950 text-white rounded-t-[2.5rem] mt-8 lg:mt-0 overflow-hidden">

      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="bg-emerald-900/30 py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="w-16 h-16 bg-emerald-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
              <i className="ri-mail-star-line text-3xl text-emerald-300"></i>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 font-serif">{newsletterTitle}</h3>
            <p className="text-emerald-200 mb-8 max-w-md mx-auto leading-relaxed">
              {newsletterSubtitle}
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-6 pr-32 py-4 bg-white/10 border border-emerald-500/30 rounded-full text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/20 transition-all backdrop-blur-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-6 rounded-full transition-all disabled:opacity-75 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? '...' : 'Join'}
              </button>
            </form>

            {submitStatus === 'success' && (
              <p className="text-emerald-300 text-sm mt-4 animate-in fade-in slide-in-from-bottom-2">
                <i className="ri-checkbox-circle-line mr-1 align-middle"></i> You're on the list!
              </p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-4 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/" className="inline-block">
              <img src={footerLogo} alt={siteName} className="h-14 w-auto object-contain brightness-0 invert opacity-90" />
            </Link>
            <p className="text-emerald-200/80 leading-relaxed text-sm">
              {siteTagline.replace(/Less\.?$/i, '').trimEnd()}{' '}
              <Link href="/admin" className="text-inherit hover:text-inherit no-underline">Less.</Link>
            </p>

            <div className="flex gap-4 pt-2">
              {[
                { link: socialInstagram, icon: 'ri-instagram-line' },
                { link: socialFacebook, icon: 'ri-facebook-fill' },
                { link: socialTwitter, icon: 'ri-twitter-x-fill' },
                { link: socialTiktok, icon: 'ri-tiktok-fill' },
                { link: socialYoutube, icon: 'ri-youtube-fill' }
              ].map((social, i) => social.link && (
                <a
                  key={i}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-300 hover:bg-emerald-500 hover:text-emerald-950 transition-all hover:-translate-y-1"
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-emerald-800/50">
              {contactPhone && (
                <div className="flex flex-col gap-2">
                  <a href={`tel:${contactPhone}`} className="flex items-center gap-3 text-emerald-200 hover:text-white transition-colors text-sm">
                    <i className="ri-phone-line"></i> {contactPhone}
                  </a>
                </div>
              )}
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-emerald-200 hover:text-white transition-colors text-sm">
                  <i className="ri-mail-line"></i> {contactEmail}
                </a>
              )}
            </div>
          </div>

          {/* Links Sections (Accordion on Mobile) */}
          <div className="lg:col-span-3 grid lg:grid-cols-3 gap-8 lg:gap-12">

            <FooterSection title={col1Title}>
              <ul className="space-y-4 text-emerald-100/80">
                {col1Links.map((link, i) => (
                  <li key={i}><Link href={link.href} className="hover:text-emerald-300 transition-colors flex items-center gap-2"><i className="ri-arrow-right-s-line opacity-50"></i> {link.label}</Link></li>
                ))}
              </ul>
            </FooterSection>

            <FooterSection title={col2Title}>
              <ul className="space-y-4 text-emerald-100/80">
                {col2Links.map((link, i) => (
                  <li key={i}><Link href={link.href} className="hover:text-emerald-300 transition-colors flex items-center gap-2"><i className="ri-arrow-right-s-line opacity-50"></i> {link.label}</Link></li>
                ))}
              </ul>
            </FooterSection>

            <FooterSection title={col3Title}>
              <ul className="space-y-4 text-emerald-100/80">
                {col3Links.map((link, i) => (
                  <li key={i}><Link href={link.href} className="hover:text-emerald-300 transition-colors flex items-center gap-2"><i className="ri-arrow-right-s-line opacity-50"></i> {link.label}</Link></li>
                ))}
              </ul>
            </FooterSection>

          </div>
        </div>

        <div className="border-t border-emerald-800/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-emerald-400/60">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.{poweredBy && <> | Powered by <a href={poweredByLink} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-white transition-colors">{poweredBy}</a></>}</p>
          <div className="flex gap-4 grayscale opacity-50">
            <i className="ri-visa-line text-2xl"></i>
            <i className="ri-mastercard-line text-2xl"></i>
            <i className="ri-paypal-line text-2xl"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}

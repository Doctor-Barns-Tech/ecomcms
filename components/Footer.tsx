"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';

export default function Footer() {
  const { settings, getSetting } = useCMS();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Integrate with your newsletter service
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
  const siteTagline = getSetting('site_tagline') || 'Your trusted destination for premium products';
  const contactEmail = getSetting('contact_email') || '';
  const contactPhone = getSetting('contact_phone') || '';
  const socialFacebook = getSetting('social_facebook') || '';
  const socialInstagram = getSetting('social_instagram') || '';
  const socialTwitter = getSetting('social_twitter') || '';

  return (
    <footer className="bg-gray-900 text-white">
      <div className="bg-emerald-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay in the Loop</h3>
              <p className="text-emerald-100">Subscribe for exclusive deals and new arrivals</p>
            </div>
            <form id="newsletterForm" onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="px-6 py-3 rounded-full text-gray-900 focus:ring-2 focus:ring-white w-full md:w-80 text-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap w-full md:w-auto"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
          {submitStatus === 'success' && (
            <p className="text-white text-sm mt-3 text-center md:text-right">
              <i className="ri-check-line mr-1"></i>
              Successfully subscribed!
            </p>
          )}
          {submitStatus === 'error' && (
            <p className="text-red-200 text-sm mt-3 text-center md:text-right">
              <i className="ri-error-warning-line mr-1"></i>
              Failed to subscribe. Please try again.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-6">
              <img src="/sarahlawson.png" alt={siteName} className="h-12 w-auto object-contain bg-white px-2 py-1 rounded-lg" />
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {siteTagline}
            </p>
            <div className="flex gap-3">
              {socialFacebook && (
                <a href={socialFacebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors">
                  <i className="ri-facebook-fill"></i>
                </a>
              )}
              {socialTwitter && (
                <a href={socialTwitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors">
                  <i className="ri-twitter-fill"></i>
                </a>
              )}
              {socialInstagram && (
                <a href={socialInstagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors">
                  <i className="ri-instagram-line"></i>
                </a>
              )}
            </div>
            {(contactEmail || contactPhone) && (
              <div className="mt-6 space-y-2">
                {contactEmail && (
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <i className="ri-mail-line text-emerald-500"></i>
                    <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a>
                  </p>
                )}
                {contactPhone && (
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <i className="ri-phone-line text-emerald-500"></i>
                    <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">{contactPhone}</a>
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">Special Offers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Customer Service</h4>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/order-tracking" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white transition-colors">Returns</Link></li>
              <li><Link href="/faqs" className="text-gray-400 hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
}

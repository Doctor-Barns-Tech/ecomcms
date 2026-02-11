'use client';

import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { supabase } from '@/lib/supabase';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useRecaptcha } from '@/hooks/useRecaptcha';

interface TeamContact {
  name: string;
  phone: string;
  role: string;
}

function ContactAccordion({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-6 group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left focus:outline-none"
      >
        <span className="font-serif text-xl text-gray-900 group-hover:text-gray-600 transition-colors">{question}</span>
        <i className={`ri-arrow-down-s-line text-2xl text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-500 font-light leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function ContactPage() {
  usePageTitle('Contact Us');
  const { getSetting, getSettingJSON } = useCMS();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { getToken, verifying } = useRecaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // reCAPTCHA verification
    const isHuman = await getToken('contact');
    if (!isHuman) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Store in Supabase
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        });

      if (error) {
        console.log('Note: contact_submissions table may not exist');
      }

      // Send Contact Notification
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          payload: formData
        })
      }).catch(err => console.error('Contact notification error:', err));

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CMS-driven config
  const contactEmail = getSetting('contact_email') || 'support@standardstore.com';
  const contactPhone = getSetting('contact_phone') || '0546014734';
  const contactAddress = getSetting('contact_address') || 'Accra, Ghana';
  const heroTitle = getSetting('contact_hero_title') || 'Get in Touch';
  const heroSubtitle = getSetting('contact_hero_subtitle') || 'We are here to assist you with any inquiries.';
  const contactHours = getSetting('contact_hours') || 'Mon-Fri, 9am - 6pm GMT';
  const teamContacts = getSettingJSON<TeamContact[]>('contact_team_json', []);

  const faqs = [
    {
      question: 'What are your delivery times?',
      answer: 'Standard delivery takes 2-5 business days. Express delivery is available for next-day service in major cities.'
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Currently, we ship within Ghana only. We plan to expand to neighbouring countries soon.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept mobile money (MTN, Vodafone, AirtelTigo) and credit/debit cards through our secure payment gateway.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">

      {/* Minimalist Header */}
      <section className="pt-32 pb-20 px-4 text-center">
        <span className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Customer Service</span>
        <h1 className="font-serif text-5xl md:text-7xl mb-6">{heroTitle}</h1>
        <p className="text-gray-500 font-light max-w-xl mx-auto text-lg">{heroSubtitle}</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 border-b border-gray-100">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Contact Info Side */}
          <div className="lg:col-span-5 space-y-20">

            {/* Info Block */}
            <div className="space-y-12">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black pb-2 inline-block">Visit Us</h3>
                <p className="font-serif text-2xl leading-relaxed">{contactAddress}</p>
                <a href="#" className="text-sm underline text-gray-500 hover:text-black mt-2 inline-block">View on Map</a>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-black pb-2 inline-block">Contact</h3>
                <div className="space-y-2">
                  <p className="text-lg"><a href={`mailto:${contactEmail}`} className="hover:text-gray-600 transition-colors">{contactEmail}</a></p>
                  <p className="text-lg"><a href={`tel:${contactPhone}`} className="hover:text-gray-600 transition-colors">{contactPhone}</a></p>
                </div>
                <p className="text-gray-500 text-sm mt-4 font-light">{contactHours}</p>
              </div>
            </div>

            {/* Team Contacts */}
            {teamContacts.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-black pb-2 inline-block">Direct Lines</h3>
                <div className="grid gap-6">
                  {teamContacts.map((contact, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <div>
                        <p className="font-serif text-lg">{contact.name}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{contact.role}</p>
                      </div>
                      <div className="flex gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <a href={`tel:${contact.phone}`} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-black hover:text-white transition-colors"><i className="ri-phone-line"></i></a>
                        <a href={`https://wa.me/233${contact.phone.replace(/^0/, '')}`} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-black hover:text-white transition-colors"><i className="ri-whatsapp-line"></i></a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Form Side */}
          <div className="lg:col-span-7 bg-gray-50 p-8 md:p-16 rounded-sm">
            <h2 className="font-serif text-3xl mb-8">Send a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors"
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors"
                    placeholder="(Optional)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-transparent border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors"
                    placeholder="Inquiry Topic"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Message</label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-transparent border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors resize-none"
                  placeholder="How can we help?"
                ></textarea>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || verifying}
                  className="bg-black text-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>

              {submitStatus === 'success' && (
                <p className="text-emerald-600 text-sm mt-4">Message sent successfully.</p>
              )}
              {submitStatus === 'error' && (
                <p className="text-red-500 text-sm mt-4">Failed to send message. Please try again.</p>
              )}
            </form>
          </div>

        </div>
      </div>

      {/* FAQ Section - Bottom */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <ContactAccordion key={i} {...faq} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

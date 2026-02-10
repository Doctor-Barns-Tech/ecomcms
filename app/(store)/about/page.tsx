'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import PageHero from '@/components/PageHero';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AboutPage() {
  usePageTitle('Our Story');
  const { getSetting } = useCMS();
  const [activeTab, setActiveTab] = useState('story');

  const siteName = getSetting('site_name') || 'Our Store';
  const primaryColor = getSetting('primary_color') || '#059669';

  // CMS-driven content
  const heroTitle = getSetting('about_hero_title') || 'Our Story';
  const heroSubtitle = getSetting('about_hero_subtitle') || 'Learn about who we are and what we do.';
  const storyTitle = getSetting('about_story_title') || 'From Passion to Business';
  const storyContent = getSetting('about_story_content') || '';
  const storyImage = getSetting('about_story_image') || '/about.jpg';
  const founderName = getSetting('about_founder_name') || 'Founder';
  const founderTitle = getSetting('about_founder_title') || 'CEO';
  const mission1Title = getSetting('about_mission1_title') || 'Direct Sourcing';
  const mission1Content = getSetting('about_mission1_content') || '';
  const mission2Title = getSetting('about_mission2_title') || 'Quality For Everyone';
  const mission2Content = getSetting('about_mission2_content') || '';
  const valuesTitle = getSetting('about_values_title') || 'Why Shop With Us?';
  const valuesSubtitle = getSetting('about_values_subtitle') || 'Quality and value, guaranteed.';
  const ctaTitle = getSetting('about_cta_title') || 'Ready to experience the difference?';
  const ctaSubtitle = getSetting('about_cta_subtitle') || 'Join thousands of happy customers.';

  // Story paragraphs (split by newlines)
  const storyParagraphs = storyContent.split('\n').filter((p: string) => p.trim());

  const values = [
    {
      icon: 'ri-verified-badge-line',
      title: 'Authenticity',
      description: 'Handpicked with care. We document the sourcing journey so you know exactly what you are buying.'
    },
    {
      icon: 'ri-money-dollar-circle-line',
      title: 'Unbeatable Value',
      description: 'Direct from the factory to you. We cut out the middleman to offer premium quality at wholesale prices.'
    },
    {
      icon: 'ri-star-smile-line',
      title: 'Quality Assured',
      description: 'Every product is inspected personally. If it doesn\'t meet our standards, it doesn\'t make it to the store.'
    },
    {
      icon: 'ri-group-line',
      title: 'Community First',
      description: 'Built on trust and connection. We listen to our customers and find the products you actually want.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title={heroTitle}
        subtitle={heroSubtitle}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex border-b border-gray-200 mb-12 justify-center">
          <button
            onClick={() => setActiveTab('story')}
            className={`px-8 py-4 font-medium transition-colors text-lg cursor-pointer ${activeTab === 'story'
              ? 'text-emerald-700 border-b-4 border-emerald-700 font-bold'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Our Story
          </button>
          <button
            onClick={() => setActiveTab('mission')}
            className={`px-8 py-4 font-medium transition-colors text-lg cursor-pointer ${activeTab === 'mission'
              ? 'text-emerald-700 border-b-4 border-emerald-700 font-bold'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Our Mission
          </button>
        </div>

        {activeTab === 'story' && (
          <div className="grid md:grid-cols-2 gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">{storyTitle}</h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                {storyParagraphs.length > 0 ? (
                  storyParagraphs.map((p: string, i: number) => <p key={i}>{p}</p>)
                ) : (
                  <>
                    <p>
                      Our journey started with a simple vision: to bring quality products directly to you at prices that make sense.
                    </p>
                    <p>
                      By sourcing directly and cutting out middlemen, we pass the savings on to our customers while maintaining the highest quality standards.
                    </p>
                    <p>
                      <strong>{siteName}</strong> was born from this commitment to quality, value, and community.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 relative">
                <img
                  src={storyImage}
                  alt={`${founderName} - ${founderTitle}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                  <p className="text-white font-bold text-xl">{founderName}</p>
                  <p className="text-emerald-200">{founderTitle}</p>
                </div>
              </div>
              {/* Decorative Element */}
              <div className="absolute -z-10 top-10 -right-10 w-full h-full border-4 border-emerald-100 rounded-2xl hidden md:block"></div>
            </div>
          </div>
        )}

        {activeTab === 'mission' && (
          <div className="grid md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-emerald-50 p-10 rounded-3xl border border-emerald-100">
              <div className="w-16 h-16 bg-emerald-700 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <i className="ri-plane-line text-3xl text-white"></i>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{mission1Title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {mission1Content || 'We believe in going to the source. By visiting manufacturers directly, we eliminate middlemen who inflate prices. This hands-on approach guarantees that you aren\'t paying for invisible markups—just great products.'}
              </p>
            </div>
            <div className="bg-amber-50 p-10 rounded-3xl border border-amber-100">
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <i className="ri-heart-line text-3xl text-white"></i>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{mission2Title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {mission2Content || '"Luxury" shouldn\'t be exclusive. Our mission is to democratize access to quality goods. Whether it\'s skincare, fashion, or home essentials, we believe everyone deserves the best, regardless of their budget.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{valuesTitle}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{valuesSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <i className={`${value.icon} text-2xl text-emerald-700`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-emerald-900 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">{ctaTitle}</h2>
          <p className="text-xl text-emerald-100 mb-10 leading-relaxed max-w-2xl mx-auto">
            {ctaSubtitle}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 bg-white text-emerald-900 px-10 py-5 rounded-full font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            Start Shopping
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

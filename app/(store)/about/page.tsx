'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AboutPage() {
  usePageTitle('Our Story');
  const { getSetting } = useCMS();
  const [activeTab, setActiveTab] = useState('story');

  const siteName = getSetting('site_name') || 'Our Store';

  // CMS-driven content
  const heroTitle = getSetting('about_hero_title') || 'The Art of Hair';
  const heroSubtitle = getSetting('about_hero_subtitle') || 'A journey of uncompromising quality and timeless beauty.';
  const storyTitle = getSetting('about_story_title') || 'Founded on Passion';
  const storyContent = getSetting('about_story_content') || '';
  const storyImage = getSetting('about_story_image') || 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=2069&auto=format&fit=crop';
  const founderName = getSetting('about_founder_name') || 'Sarah Lawson';
  const founderTitle = getSetting('about_founder_title') || 'Founder & CEO';
  const mission1Title = getSetting('about_mission1_title') || 'Ethical Sourcing';
  const mission1Content = getSetting('about_mission1_content') || '';
  const mission2Title = getSetting('about_mission2_title') || 'Accessible Luxury';
  const mission2Content = getSetting('about_mission2_content') || '';
  const valuesTitle = getSetting('about_values_title') || 'Our Philosophy';

  // Story paragraphs (split by newlines)
  const storyParagraphs = storyContent.split('\n').filter((p: string) => p.trim());

  return (
    <div className="bg-white min-h-screen text-black selection:bg-black selection:text-white">

      {/* Editorial Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gray-100 z-0">
          <img src="https://images.unsplash.com/photo-1620331317312-74b88bf40907?q=80&w=2669&auto=format&fit=crop"
            alt="Luxury hair background"
            className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-white/40"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 text-gray-800">About {siteName}</span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl font-light text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Navigation / Intro */}
      <div className="border-b border-gray-100 sticky top-16 md:top-20 bg-white/95 backdrop-blur-md z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center gap-12 py-6">
          <button
            onClick={() => setActiveTab('story')}
            className={`text-sm uppercase tracking-widest transition-all ${activeTab === 'story'
              ? 'font-bold text-black border-b border-black pb-1'
              : 'text-gray-400 hover:text-black'
              }`}
          >
            Our Story
          </button>
          <button
            onClick={() => setActiveTab('mission')}
            className={`text-sm uppercase tracking-widest transition-all ${activeTab === 'mission'
              ? 'font-bold text-black border-b border-black pb-1'
              : 'text-gray-400 hover:text-black'
              }`}
          >
            Vision & Mission
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-32 transition-all duration-700 min-h-[600px]">
        {activeTab === 'story' && (
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="order-2 lg:order-1">
              <h2 className="font-serif text-4xl lg:text-5xl mb-8 leading-tight">{storyTitle}</h2>
              <div className="space-y-6 text-gray-600 font-light leading-relaxed text-lg">
                {storyParagraphs.length > 0 ? (
                  storyParagraphs.map((p: string, i: number) => <p key={i}>{p}</p>)
                ) : (
                  <>
                    <p>
                      {siteName} was born from a desire to redefine the standard of beauty. We believe that hair is not just an accessory, but a profound expression of identity and confidence.
                    </p>
                    <p>
                      Frustrated by the lack of transparency in the industry, we set out to build a brand rooted in integrity. We travel directly to the source, hand-selecting every strand to ensure it meets our uncompromising standards.
                    </p>
                    <p>
                      This is more than just business; it is a personal commitment to excellence. When you choose {siteName}, you are choosing quality that speaks for itself.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-12 flex items-center gap-4">
                <div className="h-px w-12 bg-black"></div>
                <div>
                  <p className="font-serif text-xl italic">{founderName}</p>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">{founderTitle}</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative group">
                <img
                  src={storyImage}
                  alt={founderName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Minimalist Border Frame */}
                <div className="absolute inset-4 border border-white/30 z-10 pointer-events-none"></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mission' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
              <div className="space-y-6">
                <div className="w-12 h-12 border border-gray-200 flex items-center justify-center rounded-full mb-6">
                  <span className="font-serif text-xl italic">01</span>
                </div>
                <h3 className="font-serif text-3xl">{mission1Title}</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  {mission1Content || 'We believe in going purely to the source. By visiting manufacturers directly, we eliminate middlemen who inflate prices. This hands-on approach guarantees that you align with the highest quality standards.'}
                </p>
              </div>

              <div className="space-y-6 md:mt-24">
                <div className="w-12 h-12 border border-black text-white bg-black flex items-center justify-center rounded-full mb-6">
                  <span className="font-serif text-xl italic">02</span>
                </div>
                <h3 className="font-serif text-3xl">{mission2Title}</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  {mission2Content || 'True luxury should be accessible. Our mission is to democratize access to premium hair. Whether for daily wear or special occasions, we believe everyone deserves to feel their absolute best.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Philosophy / Values - Parallax-like */}
      <section className="bg-black text-white py-32 px-4 sm:px-6 relative overflow-hidden">
        {/* Background pattern or subtle texture could go here */}
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-8">{valuesTitle}</span>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-24 w-full">
            {[
              { title: 'Authenticity', desc: '100% Verified Human Hair.' },
              { title: 'Craftsmanship', desc: 'Hand-finished for perfection.' },
              { title: 'Longevity', desc: 'Designed to last for years.' },
            ].map((val, i) => (
              <div key={i} className="text-center group cursor-default">
                <h3 className="font-serif text-4xl mb-4 text-gray-300 group-hover:text-white transition-colors">{val.title}</h3>
                <div className="h-px w-12 bg-gray-800 mx-auto mb-4 group-hover:w-24 group-hover:bg-white transition-all duration-500"></div>
                <p className="text-gray-500 font-light group-hover:text-gray-300 transition-colors">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial CTA */}
      <section className="relative py-32 px-4 text-center bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-5xl md:text-6xl mb-8 text-black">Experience the Difference</h2>
          <Link
            href="/shop"
            className="inline-block border-b border-black pb-1 text-sm uppercase tracking-widest font-bold hover:text-gray-600 hover:border-gray-600 transition-colors"
          >
            Explore Collection
          </Link>
        </div>
      </section>
    </div>
  );
}

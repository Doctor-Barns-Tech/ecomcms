'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import AnimatedSection, { AnimatedGrid } from '@/components/AnimatedSection';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Config State - Managed in Code
  const config: {
    hero: {
      headline: string;
      subheadline: string;
      primaryButtonText: string;
      primaryButtonLink: string;
      secondaryButtonText: string;
      secondaryButtonLink: string;
      backgroundImage?: string;
    };
    banners?: Array<{ text: string; active: boolean }>;
  } = {
    hero: {
      headline: 'Mannequins, Kitchen Essentials, Electronics & Dresses — All In One Store',
      subheadline: 'Verified quality China-sourced products at unbeatable prices. Perfect for homes, businesses, and resellers.',
      primaryButtonText: 'Shop Collections',
      primaryButtonLink: '/shop',
      secondaryButtonText: 'Our Story',
      secondaryButtonLink: '/about',
      // backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop' // Optional override
    },
    banners: [
      { text: '🚚 Free delivery on orders over GH₵ 500 within Accra!', active: true },
      { text: '✨ New stock arriving this weekend - Pre-order now!', active: false },
      { text: '💳 Secure payments via Mobile Money & Card', active: true }
    ]
  };

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_variants(*), product_images(*)')
          .eq('status', 'Active')
          .limit(8);

        if (error) throw error;
        setFeaturedProducts(data || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, []);

  const categories = [
    { name: 'Mannequins', image: 'https://readdy.ai/api/search-image?query=high%20quality%20retail%20mannequins%20display%20dummy%20fashion%20store%20setup%20professional%20lighting%20elegant%20pose&width=600&height=800&seq=1&orientation=portrait', link: '/shop?category=mannequins' },
    { name: 'Kitchen Utensiles', image: 'https://readdy.ai/api/search-image?query=modern%20premium%20kitchen%20utensils%20set%20stainless%20steel%20cooking%20tools%20marble%20countertop%20culinary%20essentials&width=600&height=800&seq=2&orientation=portrait', link: '/shop?category=kitchen-utensiles' },
    { name: 'Kitchen Appliances', image: 'https://readdy.ai/api/search-image?query=sleek%20modern%20kitchen%20appliances%20blender%20toaster%20coffee%20maker%20luxury%20kitchen%20interior&width=600&height=800&seq=3&orientation=portrait', link: '/shop?category=kitchen-appliances' },
    { name: 'Dresses', image: 'https://readdy.ai/api/search-image?query=elegant%20fashion%20dresses%20on%20rack%20boutique%20store%20interior%20stylish%20clothing%20collection&width=600&height=800&seq=4&orientation=portrait', link: '/shop?category=dresses' },
  ];

  const features = [
    { icon: 'ri-store-2-line', title: 'Free Store Pickup', desc: 'Pick up at our store' },
    { icon: 'ri-arrow-left-right-line', title: 'Easy Returns', desc: '30-day return policy' },
    { icon: 'ri-customer-service-2-line', title: '24/7 Support', desc: 'Dedicated service' },
    { icon: 'ri-shield-check-line', title: 'Secure Payment', desc: 'Safe checkout' },
  ];

  const getHeroImage = () => {
    if (config.hero.backgroundImage) return config.hero.backgroundImage;
    return "https://readdy.ai/api/search-image?query=elegant%20minimalist%20lifestyle%20flat%20lay%20composition%20featuring%20premium%20home%20decor%20items%20leather%20bag%20ceramic%20vases%20natural%20textiles%20on%20cream%20background%20with%20beautiful%20shadows%20sophisticated%20styling%20luxury%20product%20photography&width=1200&height=1400&seq=hero1&orientation=portrait";
  };

  const renderBanners = () => {
    const activeBanners = config.banners?.filter(b => b.active) || [];
    if (activeBanners.length === 0) return null;

    return (
      <div className="bg-emerald-900 text-white py-2 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {activeBanners.concat(activeBanners).map((banner, index) => (
            <span key={index} className="mx-8 text-sm font-medium tracking-wide flex items-center">
              {banner.text}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="flex-col items-center justify-between min-h-screen">
      {renderBanners()}

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden lg:bg-gradient-to-b lg:from-stone-50 lg:via-white lg:to-cream-50">

        {/* Mobile: Full Background Image with Gradient Overlay */}
        <div className="absolute inset-0 lg:hidden z-0">
          <img
            src={getHeroImage()}
            className="w-full h-full object-cover transition-opacity duration-1000"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
        </div>

        {/* Desktop Blobs */}
        <div className="hidden lg:block absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-amber-50 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-[85vh] lg:h-auto lg:py-24 flex flex-col justify-end lg:block pb-16 lg:pb-0">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Desktop: Image Layout (Hidden on Mobile) */}
            <div className="hidden lg:block order-last relative">
              <div className="relative aspect-[3/4] lg:aspect-auto lg:h-[650px] overflow-hidden rounded-[2rem] shadow-xl">
                <img
                  src={getHeroImage()}
                  alt="Hero Image"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-1000"
                />

                {/* Floating Badge (Desktop Only) */}
                <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl max-w-xs z-20 border border-white/50">
                  <p className="font-serif text-emerald-800 text-lg italic mb-1">Exclusive Offer</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">25% Off</p>
                  <p className="text-sm text-gray-600 font-medium">On your first dedicated order</p>
                </div>
              </div>
            </div>

            {/* Content Column - Adapts color for Mobile (White) vs Desktop (Dark) */}
            <div className="relative z-10 text-center lg:text-left transition-colors duration-300">

              <div className="inline-flex items-center space-x-2 mb-4 lg:mb-6 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <span className="h-px w-8 bg-white/70 lg:bg-emerald-800"></span>
                <span className="text-white lg:text-emerald-800 text-sm font-semibold tracking-widest uppercase drop-shadow-sm lg:drop-shadow-none">
                  New Collection
                </span>
                <span className="h-px w-8 bg-white/70 lg:hidden"></span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white lg:text-gray-900 leading-[1.1] mb-4 lg:mb-6 drop-shadow-lg lg:drop-shadow-none animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {config.hero.headline}
              </h1>

              <p className="text-lg text-white/90 lg:text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light mb-8 lg:mb-10 drop-shadow-md lg:drop-shadow-none animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                {config.hero.subheadline}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-4 lg:px-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link href={config.hero.primaryButtonLink || '/shop'} className="inline-flex items-center justify-center bg-white lg:bg-gray-900 text-gray-900 lg:text-white hover:bg-emerald-50 lg:hover:bg-emerald-800 px-10 py-4 rounded-full font-medium transition-all text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 btn-animate">
                  {config.hero.primaryButtonText}
                </Link>
                {config.hero.secondaryButtonText && (
                  <Link href={config.hero.secondaryButtonLink || '/shop'} className="inline-flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/50 lg:bg-white lg:border-gray-200 text-white lg:text-gray-900 hover:bg-white/30 lg:hover:text-emerald-800 lg:hover:border-emerald-800 px-10 py-4 rounded-full font-medium transition-colors text-lg btn-animate">
                    {config.hero.secondaryButtonText}
                  </Link>
                )}
              </div>

              {/* Stats - Visible on Desktop, Hidden on Mobile Hero */}
              <div className="mt-12 pt-8 border-t border-gray-200 hidden lg:grid grid-cols-3 gap-6">
                <div className="flex flex-col items-start text-left">
                  <p className="font-serif font-bold text-gray-900 text-lg">Direct Import</p>
                  <p className="text-sm text-gray-500">Sourced from China</p>
                </div>
                <div className="flex flex-col items-start text-left">
                  <p className="font-serif font-bold text-gray-900 text-lg">Verified Quality</p>
                  <p className="text-sm text-gray-500">Inspected by hand</p>
                </div>
                <div className="flex flex-col items-start text-left">
                  <p className="font-serif font-bold text-gray-900 text-lg">Best Prices</p>
                  <p className="text-sm text-gray-500">Unbeatable value</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-gray-600 text-lg max-w-md">Explore our carefully curated collections</p>
            </div>
            <Link href="/categories" className="hidden md:flex items-center text-emerald-800 font-medium hover:text-emerald-900 transition-colors">
              View All <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </AnimatedSection>

          <AnimatedGrid className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {categories.map((category) => (
              <Link href={category.link} key={category.name} className="group cursor-pointer block">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 relative shadow-md">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl text-center transform translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="font-serif font-bold text-gray-900 text-lg">{category.name}</h3>
                    <span className="text-xs text-emerald-800 font-medium uppercase tracking-wider mt-1 block">View Collection</span>
                  </div>
                </div>
              </Link>
            ))}
          </AnimatedGrid>
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/categories" className="inline-flex items-center text-emerald-800 font-medium hover:text-emerald-900 transition-colors">
              View All <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Handpicked for you</p>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AnimatedGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatedGrid>
          )}

          <div className="text-center mt-16">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-medium hover:bg-emerald-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 btn-animate"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Join Community Section */}
      <section className="py-24 bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <h2 className="font-serif text-4xl md:text-5xl mb-6 leading-tight">Join Our Community</h2>
              <p className="text-emerald-100 text-lg mb-8 leading-relaxed max-w-lg">
                Get exclusive access to new arrivals, secret sales, and sourcing stories from Sarah.
                We promise not to spam your inbox.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-4 max-w-md">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                  required
                />
                <button className="bg-white text-emerald-900 px-8 py-4 rounded-full font-bold hover:bg-emerald-50 transition-colors shadow-lg btn-animate">
                  Join
                </button>
              </form>
              
              <div className="mt-10 flex items-center space-x-8 text-emerald-200">
                <div className="flex items-center">
                  <i className="ri-check-line mr-2 bg-emerald-800 rounded-full p-1"></i>
                  <span className="text-sm">Weekly Updates</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-check-line mr-2 bg-emerald-800 rounded-full p-1"></i>
                  <span className="text-sm">No Spam</span>
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection className="relative hidden lg:block" delay={200}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-8">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl transform translate-y-4">
                     <img src="https://images.unsplash.com/photo-1595991209241-1e5e8a946d32?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Community" />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                     <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Community" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                     <img src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=1964&auto=format&fit=crop" className="w-full h-full object-cover" alt="Community" />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl transform -translate-y-4">
                     <img src="https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?q=80&w=1931&auto=format&fit=crop" className="w-full h-full object-cover" alt="Community" />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <AnimatedSection key={i} delay={i * 100} className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-700">
                  <i className={`${feature.icon} text-3xl`}></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

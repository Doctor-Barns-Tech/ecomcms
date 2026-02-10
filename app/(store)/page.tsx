'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useCMS } from '@/context/CMSContext';
import ProductCard, { type ColorVariant, getColorHex } from '@/components/ProductCard';
import AnimatedSection, { AnimatedGrid } from '@/components/AnimatedSection';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Home() {
  usePageTitle('');
  const { getSetting, getActiveBanners } = useCMS();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, product_variants(*), product_images(*)')
          .eq('status', 'active')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (productsError) throw productsError;
        setFeaturedProducts(productsData || []);

        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug, image_url, metadata')
          .eq('status', 'active')
          .order('name');

        if (categoriesError) throw categoriesError;

        const featuredCategories = (categoriesData || []).filter(
          (cat: any) => cat.metadata?.featured === true
        );
        setCategories(featuredCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ── CMS-driven config ────────────────────────────────────────────
  const heroHeadline = getSetting('hero_headline');
  const heroSubheadline = getSetting('hero_subheadline');
  const heroImage = getSetting('hero_image') || '/hero.jpg';
  const heroPrimaryText = getSetting('hero_primary_btn_text');
  const heroPrimaryLink = getSetting('hero_primary_btn_link') || '/shop';
  const heroSecondaryText = getSetting('hero_secondary_btn_text');
  const heroSecondaryLink = getSetting('hero_secondary_btn_link') || '/about';
  const heroTagText = getSetting('hero_tag_text');
  const heroBadgeLabel = getSetting('hero_badge_label');
  const heroBadgeText = getSetting('hero_badge_text');
  const heroBadgeSubtext = getSetting('hero_badge_subtext');

  const features = [
    { icon: getSetting('feature1_icon'), title: getSetting('feature1_title'), desc: getSetting('feature1_desc') },
    { icon: getSetting('feature2_icon'), title: getSetting('feature2_title'), desc: getSetting('feature2_desc') },
    { icon: getSetting('feature3_icon'), title: getSetting('feature3_title'), desc: getSetting('feature3_desc') },
    { icon: getSetting('feature4_icon'), title: getSetting('feature4_title'), desc: getSetting('feature4_desc') },
  ];

  const stat1Title = getSetting('hero_stat1_title');
  const stat1Desc = getSetting('hero_stat1_desc');
  const stat2Title = getSetting('hero_stat2_title');
  const stat2Desc = getSetting('hero_stat2_desc');
  const stat3Title = getSetting('hero_stat3_title');
  const stat3Desc = getSetting('hero_stat3_desc');

  const activeBanners = getActiveBanners('top');

  const renderBanners = () => {
    if (activeBanners.length === 0) return null;
    return (
      <div className="bg-emerald-900 text-white py-2 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {activeBanners.concat(activeBanners).map((banner, index) => (
            <span key={index} className="mx-8 text-sm font-medium tracking-wide flex items-center">
              {banner.title}
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
          <Image
            src={heroImage}
            fill
            className="object-cover transition-opacity duration-1000"
            alt="Hero Background"
            priority
            sizes="100vw"
            quality={75}
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
                <Image
                  src={heroImage}
                  alt="Hero Image"
                  fill
                  className="object-cover object-top hover:scale-105 transition-transform duration-1000"
                  priority
                  sizes="50vw"
                  quality={80}
                />

                {/* Floating Badge (Desktop Only) */}
                {heroBadgeLabel && (
                  <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl max-w-xs z-20 border border-white/50">
                    <p className="font-serif text-emerald-800 text-lg italic mb-1">{heroBadgeLabel}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{heroBadgeText}</p>
                    <p className="text-sm text-gray-600 font-medium">{heroBadgeSubtext}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Content Column */}
            <div className="relative z-10 text-center lg:text-left transition-colors duration-300">

              {heroTagText && (
                <div className="inline-flex items-center space-x-2 mb-4 lg:mb-6 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <span className="h-px w-8 bg-white/70 lg:bg-emerald-800"></span>
                  <span className="text-white lg:text-emerald-800 text-sm font-semibold tracking-widest uppercase drop-shadow-sm lg:drop-shadow-none">
                    {heroTagText}
                  </span>
                  <span className="h-px w-8 bg-white/70 lg:hidden"></span>
                </div>
              )}

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] xl:text-5xl text-white lg:text-gray-900 leading-[1.15] mb-4 lg:mb-6 drop-shadow-lg lg:drop-shadow-none animate-fade-in-up max-w-xl mx-auto lg:mx-0" style={{ animationDelay: '0.2s' }}>
                {heroHeadline}
              </h1>

              <p className="text-lg text-white/90 lg:text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0 font-light mb-8 lg:mb-10 drop-shadow-md lg:drop-shadow-none animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                {heroSubheadline}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-4 lg:px-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link href={heroPrimaryLink} className="inline-flex items-center justify-center bg-white lg:bg-gray-900 text-gray-900 lg:text-white hover:bg-emerald-50 lg:hover:bg-emerald-800 px-10 py-4 rounded-full font-medium transition-all text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 btn-animate">
                  {heroPrimaryText}
                </Link>
                {heroSecondaryText && (
                  <Link href={heroSecondaryLink} className="inline-flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/50 lg:bg-white lg:border-gray-200 text-white lg:text-gray-900 hover:bg-white/30 lg:hover:text-emerald-800 lg:hover:border-emerald-800 px-10 py-4 rounded-full font-medium transition-colors text-lg btn-animate">
                    {heroSecondaryText}
                  </Link>
                )}
              </div>

              {/* Stats - Desktop Only */}
              <div className="mt-12 pt-8 border-t border-gray-200 hidden lg:grid grid-cols-3 gap-6">
                <div className="flex flex-col items-start text-left">
                  <p className="font-serif font-bold text-gray-900 text-lg">{stat1Title}</p>
                  <p className="text-sm text-gray-500">{stat1Desc}</p>
                </div>
                <div className="flex flex-col items-start text-left">
                  <p className="font-serif font-bold text-gray-900 text-lg">{stat2Title}</p>
                  <p className="text-sm text-gray-500">{stat2Desc}</p>
                </div>
                <div className="flex flex-col items-start text-left">
                  <p className="font-serif font-bold text-gray-900 text-lg">{stat3Title}</p>
                  <p className="text-sm text-gray-500">{stat3Desc}</p>
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
              <Link href={`/shop?category=${category.slug}`} key={category.id} className="group cursor-pointer block">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 relative shadow-md">
                  <Image
                    src={category.image || category.image_url || 'https://via.placeholder.com/600x800?text=' + encodeURIComponent(category.name)}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    quality={75}
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
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[3/4] rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatedGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts.map((product) => {
                const variants = product.product_variants || [];
                const hasVariants = variants.length > 0;
                const minVariantPrice = hasVariants ? Math.min(...variants.map((v: any) => v.price || product.price)) : undefined;
                const totalVariantStock = hasVariants ? variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) : 0;
                const effectiveStock = hasVariants ? totalVariantStock : product.quantity;

                const colorVariants: ColorVariant[] = [];
                const seenColors = new Set<string>();
                for (const v of variants) {
                  const colorName = (v as any).option2;
                  if (colorName && !seenColors.has(colorName.toLowerCase().trim())) {
                    const hex = getColorHex(colorName);
                    if (hex) {
                      seenColors.add(colorName.toLowerCase().trim());
                      colorVariants.push({ name: colorName.trim(), hex });
                    }
                  }
                }

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.compare_at_price}
                    image={product.product_images?.[0]?.url || 'https://via.placeholder.com/400x500'}
                    rating={product.rating_avg || 5}
                    reviewCount={product.review_count || 0}
                    badge={product.featured ? 'Featured' : undefined}
                    inStock={effectiveStock > 0}
                    maxStock={effectiveStock || 50}
                    moq={product.moq || 1}
                    hasVariants={hasVariants}
                    minVariantPrice={minVariantPrice}
                    colorVariants={colorVariants}
                  />
                );
              })}
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

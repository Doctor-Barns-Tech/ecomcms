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
  const siteName = getSetting('site_name')?.trim() || 'Premium Collection';
  const heroHeadline = getSetting('hero_headline')?.trim() || `${siteName} – Premium Products`;
  const heroSubheadline =
    getSetting('hero_subheadline')?.trim() || 'Verified quality products at unbeatable prices.';
  const heroImage = getSetting('hero_image') || '/hero.jpg';
  const heroPrimaryText = getSetting('hero_primary_btn_text');
  const heroPrimaryLink = getSetting('hero_primary_btn_link') || '/shop';
  const heroSecondaryText = getSetting('hero_secondary_btn_text');
  const heroSecondaryLink = getSetting('hero_secondary_btn_link') || '/about';

  usePageTitle(heroHeadline);

  const activeBanners = getActiveBanners('top');

  const renderBanners = () => {
    if (activeBanners.length === 0) return null;
    return (
      <div className="bg-black text-white py-2.5 overflow-hidden relative z-50">
        <div className="flex animate-marquee whitespace-nowrap">
          {activeBanners.concat(activeBanners).map((banner, index) => (
            <span key={index} className="mx-12 text-xs uppercase tracking-[0.2em] font-medium flex items-center">
              {banner.title}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="flex-col min-h-screen bg-white text-gray-900 selection:bg-black selection:text-white">
      {renderBanners()}

      {/* Hero Section - Immersive */}
      <section className="relative w-full min-h-[75vh] md:h-[90vh] overflow-hidden">
        <Image
          src={heroImage}
          fill
          className="object-cover object-[20%_center] sm:object-center"
          alt="Luxury Wigs"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay for text readability */}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <AnimatedSection className="max-w-4xl mx-auto space-y-8">
            <span className="inline-block py-1 px-3 border border-white/30 text-white text-[10px] uppercase tracking-[0.3em] backdrop-blur-sm">
              The Premium Collection
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-tight drop-shadow-sm">
              {heroHeadline}
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light max-w-xl mx-auto tracking-wide">
              {heroSubheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Link href={heroPrimaryLink} className="bg-white text-black px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors duration-300 min-w-[200px]">
                {heroPrimaryText}
              </Link>
              {heroSecondaryText && (
                <Link href={heroSecondaryLink} className="bg-transparent border border-white text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors duration-300 min-w-[200px]">
                  {heroSecondaryText}
                </Link>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Texture/Category Shop - Minimalist Grid */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-serif text-3xl md:text-4xl">Shop by Collection</h2>
            <div className="w-12 h-0.5 bg-black mx-auto"></div>
          </div>

          <AnimatedGrid className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.slice(0, 3).map((category, idx) => (
              <Link href={`/shop?category=${category.slug}`} key={category.id} className="group block relative aspect-[4/5] overflow-hidden bg-gray-100">
                <Image
                  src={category.image || category.image_url || 'https://via.placeholder.com/600x800'}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="font-serif text-3xl mb-2">{category.name}</h3>
                  <span className="text-[10px] uppercase tracking-widest border-b border-transparent group-hover:border-white transition-colors pb-1">Explore</span>
                </div>
              </Link>
            ))}
          </AnimatedGrid>

          <div className="text-center mt-12">
            <Link href="/categories" className="text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
              View All Collections
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals - Horizontal Scroll or Grid */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block">Fresh Drops</span>
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900">New Arrivals</h2>
            </div>
            <Link href="/shop?sort=new" className="hidden md:block text-xs uppercase tracking-widest border-b border-gray-300 pb-1 hover:border-black transition-colors">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[3/4] mb-4"></div>
                  <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatedGrid className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {featuredProducts.map((product) => {
                // Format product for ProductCard
                // Copied logic from previous file to ensure compatibility
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
                    badge={product.featured ? 'New' : undefined}
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

          <div className="mt-12 text-center md:hidden">
            <Link href="/shop" className="text-xs uppercase tracking-widest border-b border-gray-300 pb-1">
              Shop All
            </Link>
          </div>
        </div>
      </section>



      {/* Newsletter - Minimalist */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-serif text-3xl text-gray-900 mb-4">Join the Inner Circle</h2>
          <p className="text-gray-500 mb-8 font-light">Subscribe to receive exclusive offers, early access to new collections, and beauty tips.</p>
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-stone-50 border-b border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
            <button type="submit" className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-emerald-900 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

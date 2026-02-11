'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductCard, { getColorHex } from '@/components/ProductCard';
import { usePageTitle } from '@/hooks/usePageTitle';

// ── Types ─────────────────────────────────────────────────────────────
type Category = {
  id: string;
  name: string;
  slug: string;
  count?: number;
};

// Define ColorVariant here to match what ProductCard expects or just for internal use
export type ColorVariant = {
  name: string;
  hex: string;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  maxStock: number;
  moq: number;
  hasVariants: boolean;
  minVariantPrice?: number;
  colorVariants: ColorVariant[];
  compare_at_price?: number;
  featured?: boolean;
};

// ── Components ────────────────────────────────────────────────────────

function FilterAccordion({ title, isOpen, onToggle, children }: { title: string, isOpen: boolean, onToggle: () => void, children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200 py-4">
      <button onClick={onToggle} className="flex justify-between items-center w-full text-left group">
        <span className="font-medium text-sm uppercase tracking-widest text-gray-900 group-hover:text-gray-600 transition-colors">{title}</span>
        <i className={`ri-arrow-down-s-line transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
}

function ShopContent() {
  usePageTitle('Shop All');
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const [openFilters, setOpenFilters] = useState({ category: true, price: true, sort: false });
  const [_priceRange, _setPriceRange] = useState<[number, number]>([0, 5000]);

  // Read URL params
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1');
  const limit = 12;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Fetch Categories
        const { data: catData } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('status', 'active')
          .order('name');

        if (catData) setCategories(catData);

        // 2. Build Product Query
        let query = supabase
          .from('products')
          .select('*, product_images(*), product_variants(*), categories(name, slug)', { count: 'exact' })
          .eq('status', 'active');

        // Apply Filters
        if (categoryParam) {
          const matchedCat = catData?.find(c => c.slug === categoryParam);
          if (matchedCat) {
            query = query.eq('category_id', matchedCat.id);
          }
        }

        // Apply Sorting
        switch (sortParam) {
          case 'price-low': query = query.order('price', { ascending: true }); break;
          case 'price-high': query = query.order('price', { ascending: false }); break;
          case 'name-asc': query = query.order('name', { ascending: true }); break;
          case 'name-desc': query = query.order('name', { ascending: false }); break;
          default: query = query.order('created_at', { ascending: false }); // newest
        }

        // Pagination
        const from = (pageParam - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: prodData, count, error } = await query;

        if (error) throw error;
        setTotalProducts(count || 0);

        // Transform Data
        const mappedProducts: Product[] = (prodData || []).map((p: any) => {
          const variants = p.product_variants || [];
          const hasVariants = variants.length > 0;
          const minVariantPrice = hasVariants ? Math.min(...variants.map((v: any) => v.price || p.price)) : undefined;

          // Calculate stock
          const effectiveStock = hasVariants
            ? variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0)
            : p.quantity;

          // Extract colors
          const colorVariants: ColorVariant[] = [];
          const seenColors = new Set<string>();
          for (const v of variants) {
            const cName = v.option2; // Assuming option2 is color
            if (cName && !seenColors.has(cName.toLowerCase().trim())) {
              const hex = getColorHex(cName);
              if (hex) {
                seenColors.add(cName.toLowerCase().trim());
                colorVariants.push({ name: cName.trim(), hex });
              }
            }
          }

          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: p.price,
            compare_at_price: p.compare_at_price,
            image: p.product_images?.[0]?.url || 'https://via.placeholder.com/800?text=No+Image',
            rating: p.rating_avg || 0,
            reviewCount: p.review_count || 0,
            inStock: effectiveStock > 0,
            maxStock: effectiveStock,
            moq: p.moq || 1,
            hasVariants,
            minVariantPrice,
            colorVariants,
            featured: p.featured
          };
        });

        setProducts(mappedProducts);

      } catch (err) {
        console.error('Error loading shop:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [categoryParam, sortParam, pageParam]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1'); // Reset page
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Mobile Filters Drawer */}
      <div className={`fixed inset-0 z-50 bg-white transform transition-transform duration-300 lg:hidden ${showMobileFilters ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="font-serif text-xl">Filters</h2>
          <button onClick={() => setShowMobileFilters(false)} className="p-2"><i className="ri-close-line text-2xl"></i></button>
        </div>
        <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Categories</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => { updateFilter('category', ''); setShowMobileFilters(false); }}
                    className={`text-sm ${!categoryParam ? 'font-bold text-black' : 'text-gray-600'}`}
                  >
                    All Products
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button
                      onClick={() => { updateFilter('category', cat.slug); setShowMobileFilters(false); }}
                      className={`text-sm ${categoryParam === cat.slug ? 'font-bold text-black' : 'text-gray-600'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Shop All</span>
            <h1 className="font-serif text-4xl text-gray-900">
              {categoryParam ? categories.find(c => c.slug === categoryParam)?.name || 'Collection' : 'All Products'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Filter Toggle */}
            <button onClick={() => setShowMobileFilters(true)} className="lg:hidden flex items-center gap-2 text-sm font-medium uppercase tracking-widest border-b border-gray-300 pb-1">
              <i className="ri-filter-3-line"></i> Filter
            </button>

            {/* Sort Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest hover:text-gray-600 transition-colors">
                Sort By <i className="ri-arrow-down-s-line"></i>
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <div className="bg-white border border-gray-100 shadow-xl py-2 w-48 rounded-sm">
                  {[
                    { label: 'Newest', value: 'newest' },
                    { label: 'Price: Low to High', value: 'price-low' },
                    { label: 'Price: High to Low', value: 'price-high' },
                    { label: 'Name: A-Z', value: 'name-asc' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateFilter('sort', opt.value)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortParam === opt.value ? 'font-bold text-black' : 'text-gray-500'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-12">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterAccordion
              title="Categories"
              isOpen={openFilters.category}
              onToggle={() => setOpenFilters(prev => ({ ...prev, category: !prev.category }))}
            >
              <ul className="space-y-3 pb-2">
                <li>
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`text-sm hover:text-emerald-800 transition-colors ${!categoryParam ? 'font-bold text-black' : 'text-gray-500'}`}
                  >
                    All Products
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button
                      onClick={() => updateFilter('category', cat.slug)}
                      className={`text-sm hover:text-emerald-800 transition-colors ${categoryParam === cat.slug ? 'font-bold text-black' : 'text-gray-500'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </FilterAccordion>

            <FilterAccordion
              title="Price Range"
              isOpen={openFilters.price}
              onToggle={() => setOpenFilters(prev => ({ ...prev, price: !prev.price }))}
            >
              <div className="py-4 px-1">
                <p className="text-xs text-gray-500 mb-4">Select a price range to filter products.</p>
                {/* Placeholder for dual slider - implementation would require more complex state/component */}
                <div className="flex gap-4">
                  <button onClick={() => updateFilter('sort', 'price-low')} className="text-xs border border-gray-200 px-3 py-1 hover:border-black transition-colors">Low - High</button>
                  <button onClick={() => updateFilter('sort', 'price-high')} className="text-xs border border-gray-200 px-3 py-1 hover:border-black transition-colors">High - Low</button>
                </div>
              </div>
            </FilterAccordion>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-100 aspect-[3/4] mb-4"></div>
                    <div className="h-4 bg-gray-100 w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-100 w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="font-serif text-xl mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                {products.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalProducts > limit && (
              <div className="mt-16 flex justify-center gap-4">
                <button
                  disabled={pageParam <= 1}
                  onClick={() => updateFilter('page', (pageParam - 1).toString())}
                  className="px-6 py-3 border border-gray-200 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="flex items-center text-sm font-medium px-4">Page {pageParam}</span>
                <button
                  disabled={pageParam * limit >= totalProducts}
                  onClick={() => updateFilter('page', (pageParam + 1).toString())}
                  className="px-6 py-3 border border-gray-200 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div></div>}>
      <ShopContent />
    </Suspense>
  );
}
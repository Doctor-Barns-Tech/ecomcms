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

function FilterDrawer({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onSelectCategory,
  activeSort,
  onSelectSort
}: {
  isOpen: boolean,
  onClose: () => void,
  categories: Category[],
  activeCategory: string | null,
  onSelectCategory: (slug: string) => void,
  activeSort: string,
  onSelectSort: (val: string) => void
}) {
  return (
    <div className={`fixed inset-0 z-50 transition-visibility duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-serif text-3xl">Filter & Sort</h2>
            <button onClick={onClose} className="p-2 hover:rotate-90 transition-transform duration-300">
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-12 pr-4 custom-scrollbar">
            {/* Sort Section */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-[0.15em] mb-6 text-gray-400">Sort By</span>
              <div className="space-y-4">
                {[
                  { label: 'New Arrivals', value: 'newest' },
                  { label: 'Price: Low to High', value: 'price-low' },
                  { label: 'Price: High to Low', value: 'price-high' },
                  { label: 'Name: A-Z', value: 'name-asc' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onSelectSort(opt.value)}
                    className={`block w-full text-left text-lg transition-colors ${activeSort === opt.value ? 'font-serif italic text-black' : 'font-light text-gray-500 hover:text-black'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Section */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-[0.15em] mb-6 text-gray-400">Collections</span>
              <div className="space-y-4">
                <button
                  onClick={() => onSelectCategory('')}
                  className={`block w-full text-left text-lg transition-colors ${!activeCategory ? 'font-serif italic text-black' : 'font-light text-gray-500 hover:text-black'}`}
                >
                  All Products
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.slug)}
                    className={`block w-full text-left text-lg transition-colors ${activeCategory === cat.slug ? 'font-serif italic text-black' : 'font-light text-gray-500 hover:text-black'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
              View Results
            </button>
          </div>
        </div>
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
            image: p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1550995054-9f89920155b8?q=80&w=2670&auto=format&fit=crop', // Fallback to luxury placeholder
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

  const getActiveCategoryName = () => {
    if (!categoryParam) return 'All Products';
    return categories.find(c => c.slug === categoryParam)?.name || 'Collection';
  };

  return (
    <div className="bg-white min-h-screen text-black selection:bg-black selection:text-white">

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        activeCategory={categoryParam}
        onSelectCategory={(slug) => { updateFilter('category', slug); setIsFilterOpen(false); }}
        activeSort={sortParam}
        onSelectSort={(val) => { updateFilter('sort', val); setIsFilterOpen(false); }}
      />

      {/* Hero / Header */}
      <div className="pt-32 pb-12 px-4 text-center">
        <h1 className="font-serif text-5xl md:text-6xl mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {getActiveCategoryName()}
        </h1>
        <p className="text-gray-500 font-light text-sm uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {totalProducts} Items
        </p>
      </div>

      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 mb-12">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="hidden md:flex gap-8">
            {/* Quick Categories */}
            <button onClick={() => updateFilter('category', '')} className={`text-xs uppercase tracking-widest hover:text-gray-500 transition-colors ${!categoryParam ? 'font-bold' : ''}`}>All</button>
            {categories.slice(0, 4).map(cat => (
              <button key={cat.id} onClick={() => updateFilter('category', cat.slug)} className={`text-xs uppercase tracking-widest hover:text-gray-500 transition-colors ${categoryParam === cat.slug ? 'font-bold' : ''}`}>
                {cat.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="ml-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            <span className="md:hidden">Filter & Sort</span>
            <span className="hidden md:inline">Filter</span>
            <i className="ri-sound-module-line text-lg"></i>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 aspect-[3/4] mb-4"></div>
                <div className="h-4 bg-gray-100 w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-100 w-1/3"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="font-serif text-2xl mb-4">No products found</h3>
            <p className="text-gray-500 mb-8">Try adjusting your filters.</p>
            <button onClick={() => updateFilter('category', '')} className="border-b border-black pb-1 hover:text-gray-600">View All Products</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16">
            {products.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

        {/* Pagination - Minimalist */}
        {!loading && totalProducts > limit && (
          <div className="mt-24 flex justify-center gap-12 items-center">
            <button
              disabled={pageParam <= 1}
              onClick={() => updateFilter('page', (pageParam - 1).toString())}
              className="text-2xl hover:scale-110 transition-transform disabled:opacity-20"
            >
              <i className="ri-arrow-left-line"></i>
            </button>
            <span className="font-serif italic text-lg">{pageParam} <span className="text-gray-300 mx-2">/</span> {Math.ceil(totalProducts / limit)}</span>
            <button
              disabled={pageParam * limit >= totalProducts}
              onClick={() => updateFilter('page', (pageParam + 1).toString())}
              className="text-2xl hover:scale-110 transition-transform disabled:opacity-20"
            >
              <i className="ri-arrow-right-line"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-100 border-t-black rounded-full animate-spin"></div></div>}>
      <ShopContent />
    </Suspense>
  );
}
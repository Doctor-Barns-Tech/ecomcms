'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cachedQuery } from '@/lib/query-cache';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import { StructuredData, generateProductSchema, generateBreadcrumbSchema } from '@/components/SEOHead';
import { useCart } from '@/context/CartContext';
import { usePageTitle } from '@/hooks/usePageTitle';

// Helper for color hexes
function colorNameToHex(name: string): string {
  const map: Record<string, string> = {
    red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
    orange: '#f97316', purple: '#a855f7', pink: '#ec4899', black: '#111827',
    white: '#ffffff', gray: '#6b7280', grey: '#6b7280', brown: '#92400e',
    navy: '#1e3a5f', gold: '#d4a017', silver: '#c0c0c0', beige: '#f5f5dc',
    maroon: '#800000', teal: '#14b8a6', coral: '#ff7f50', ivory: '#fffff0',
    cream: '#fffdd0', burgundy: '#800020', lavender: '#e6e6fa', cyan: '#06b6d4',
    magenta: '#d946ef', olive: '#84cc16', peach: '#ffcba4', mint: '#98f5e1',
    rose: '#f43f5e', wine: '#722f37', charcoal: '#374151', sky: '#0ea5e9',
    // Luxury hair colors
    platinum: '#E5E4E2', ash: '#B2BEB5', honey: '#A98307', copper: '#B87333',
    chestnut: '#954535', auburn: '#A52A2A', jet: '#0A0A0A'
  };
  return map[name.toLowerCase().trim()] || '#d1d5db';
}

const AccordionItem = ({ title, isOpen, onClick, children }: { title: string, isOpen: boolean, onClick: () => void, children: React.ReactNode }) => (
  <div className="border-b border-gray-200 py-2">
    <button className="w-full py-4 flex justify-between items-center text-left focus:outline-none group" onClick={onClick}>
      <span className="font-serif text-lg text-gray-900 group-hover:text-gray-600 transition-colors">{title}</span>
      <i className={`ri-arrow-down-s-line text-xl transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
    </button>
    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
      <div className="text-gray-500 font-light leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

export default function ProductDetailClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<any>(null);
  usePageTitle(product?.name || 'Product');
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [selectionHint, setSelectionHint] = useState('');

  // Accordion State
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({ description: true });

  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const { addToCart } = useCart();

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        // Fetch main product (cached for 2 minutes)
        const { data: productData, error } = await cachedQuery<{ data: any; error: any }>(
          `product:${slug}`,
          async () => {
            // ... existing query logic ...
            let query = supabase
              .from('products')
              .select(`
                *,
                categories(name),
                product_variants(*),
                product_images(url, position, alt_text)
              `);

            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

            if (isUUID) {
              query = query.or(`id.eq.${slug},slug.eq.${slug}`);
            } else {
              query = query.eq('slug', slug);
            }

            return query.single() as any;
          },
          2 * 60 * 1000 // 2 minutes
        );

        if (error || !productData) {
          console.error('Error fetching product:', error);
          setLoading(false);
          return;
        }

        // Transform details
        const rawVariants = (productData.product_variants || []).map((v: any) => ({
          ...v,
          color: v.option2 || '',
          colorHex: v.metadata?.color_hex || ''
        }));

        const colorHexMap: Record<string, string> = {};
        rawVariants.forEach((v: any) => {
          if (v.color) {
            if (!colorHexMap[v.color]) {
              colorHexMap[v.color] = v.colorHex || colorNameToHex(v.color);
            }
          }
        });

        const transformedProduct = {
          ...productData,
          images: productData.product_images?.sort((a: any, b: any) => a.position - b.position).map((img: any) => img.url) || [],
          category: productData.categories?.name || 'Shop',
          rating: productData.rating_avg || 0,
          reviewCount: productData.review_count || 0,
          stockCount: productData.quantity,
          moq: productData.moq || 1,
          colors: [...new Set(rawVariants.map((v: any) => v.color).filter(Boolean))],
          colorHexMap,
          variants: rawVariants,
          sizes: rawVariants.map((v: any) => v.name) || [],
          features: ['100% Remy Human Hair', 'Heat Safe up to 400°F', 'Double Drawn Wefts', 'Cuticles Aligned'],
          care: 'Wash gently with sulfate-free shampoo. Air dry when possible. Use heat protectant before styling.',
          preorderShipping: productData.metadata?.preorder_shipping || null,
          shipping: 'Free shipping on orders over GH₵500. Standard delivery takes 3-5 business days.'
        };

        if (transformedProduct.images.length === 0) {
          transformedProduct.images = ['https://via.placeholder.com/800x1000?text=No+Image'];
        }

        setProduct(transformedProduct);

        if (transformedProduct.moq > 1) {
          setQuantity(transformedProduct.moq);
        }

        // Fetch related
        if (productData.category_id) {
          // ... existing related query ...
          const { data: related } = await cachedQuery<{ data: any; error: any }>(
            `related:${productData.category_id}:${productData.id}`,
            (() => supabase
              .from('products')
              .select('*, product_images(url, position), product_variants(id, name, price, quantity)')
              .eq('category_id', productData.category_id)
              .neq('id', productData.id)
              .limit(4)) as any,
            5 * 60 * 1000
          );

          if (related) {
            setRelatedProducts(related.map((p: any) => {
              // ... existing mapping ...
              const variants = p.product_variants || [];
              const hasVariants = variants.length > 0;
              const effectiveStock = hasVariants ? variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) : p.quantity;
              return {
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: p.price,
                image: p.product_images?.[0]?.url || 'https://via.placeholder.com/800?text=No+Image',
                rating: p.rating_avg || 0,
                reviewCount: 0,
                inStock: effectiveStock > 0,
                maxStock: effectiveStock || 50,
                moq: p.moq || 1,
                hasVariants,
              };
            }));
          }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const hasVariants = product?.variants?.length > 0;
  const hasColors = product?.colors?.length > 0;

  const needsColorSelection = hasColors && !selectedColor;
  const needsVariantSelection = hasVariants && !selectedVariant;

  const activePrice = selectedVariant?.price ?? product?.price ?? 0;
  const activeStock = selectedVariant ? (selectedVariant.stock ?? selectedVariant.quantity ?? product?.stockCount ?? 0) : (product?.stockCount ?? 0);

  const validateSelections = () => {
    if (needsColorSelection) {
      setSelectionHint('Please select a color to continue.');
      return false;
    }
    if (needsVariantSelection) {
      setSelectionHint('Please select a size to continue.');
      return false;
    }
    setSelectionHint('');
    return true;
  };

  const addProductToCart = () => {
    if (!product) return false;
    if (!validateSelections()) return false;

    let variantLabel: string | undefined;
    if (selectedVariant) {
      const color = selectedVariant.color || selectedColor || '';
      const name = selectedVariant.name || '';
      if (color && name) {
        variantLabel = `${color} / ${name}`;
      } else {
        variantLabel = color || name || undefined;
      }
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: activePrice,
      image: product.images[0],
      quantity: quantity,
      variant: variantLabel,
      slug: product.slug,
      maxStock: activeStock,
      moq: product.moq || 1
    });

    return true;
  };

  const handleAddToCart = () => {
    if (activeStock === 0 || isAdding) return;
    const added = addProductToCart();
    if (!added) return;
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleBuyNow = () => {
    if (activeStock === 0 || isBuying) return;
    const added = addProductToCart();
    if (!added) return;
    setIsBuying(true);
    window.location.href = '/checkout';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-100 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white py-20 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-serif text-gray-900 mb-4">Product Not Found</h2>
        <Link href="/shop" className="text-sm uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600">Return to Shop</Link>
      </div>
    );
  }

  const minVariantPrice = hasVariants ? Math.min(...product.variants.map((v: any) => v.price || product.price)) : product.price;

  const productSchema = generateProductSchema({
    name: product.name,
    description: product.description,
    image: product.images[0],
    price: hasVariants ? minVariantPrice : product.price,
    currency: 'GHS',
    sku: product.sku,
    rating: product.rating,
    reviewCount: product.reviewCount,
    availability: product.stockCount > 0 ? 'in_stock' : 'out_of_stock',
    category: product.category
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://standardecom.com' },
    { name: 'Shop', url: 'https://standardecom.com/shop' },
    { name: product.name, url: `https://standardecom.com/product/${slug}` }
  ]);

  return (
    <>
      <StructuredData data={productSchema} />
      <StructuredData data={breadcrumbSchema} />

      <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white pt-28 lg:pt-0">

        {/* Breadcrumb */}
        <div className="absolute top-24 left-0 w-full z-10 px-6 hidden lg:block">
          <nav className="text-[10px] uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black transition-colors">{product.category}</Link>
            <span>/</span>
            <span className="text-black">{product.name}</span>
          </nav>
        </div>

        <div className="grid lg:grid-cols-2">
          {/* Left Column: Vertical Scroll Gallery */}
          <div className="bg-gray-50 flex flex-col gap-1 lg:pt-0 pt-8 px-4 lg:px-0">
            {product.images.map((img: string, i: number) => (
              <div key={i} className="relative w-full aspect-[4/5] lg:aspect-auto lg:h-screen rounded-3xl overflow-hidden">
                <Image
                  src={img}
                  alt={`${product.name} - View ${i + 1}`}
                  fill
                  className="object-cover"
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Details */}
          <div className="lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto custom-scrollbar bg-white px-4 lg:px-0">
            <div className="px-0 sm:px-6 py-12 lg:p-24 max-w-xl mx-auto flex flex-col justify-center min-h-full">

              {/* Header */}
              <div className="mb-10">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300 mb-4 block">{product.category}</span>
                <h1 className="font-serif text-4xl md:text-6xl text-black mb-6 leading-tight">{product.name}</h1>
                <div className="flex items-baseline gap-4 flex-wrap">
                  <span className="text-2xl font-light">
                    {hasVariants && !selectedVariant ? (
                      <span>From GH₵{minVariantPrice.toFixed(2)}</span>
                    ) : (
                      <span>GH₵{activePrice.toFixed(2)}</span>
                    )}
                  </span>
                  {product.compare_at_price && product.compare_at_price > activePrice && (
                    <span className="text-gray-400 line-through text-sm">GH₵{product.compare_at_price.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-10 mb-12">
                {hasVariants && hasColors && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 block">Color: <span className="text-black">{selectedColor}</span></label>
                    <div className="flex flex-wrap gap-4">
                      {product.colors.map((color: string) => (
                        <button
                          key={color}
                          onClick={() => {
                            setSelectedColor(color);
                            // ... selection logic ...
                            const matching = product.variants.filter((v: any) => v.color === color);
                            if (matching.length === 1) {
                              setSelectedVariant(matching[0]);
                              setSelectedSize(matching[0].name);
                            } else {
                              setSelectedVariant(null);
                              setSelectedSize('');
                            }
                            setSelectionHint('');
                          }}
                          className={`w-12 h-12 rounded-full relative transition-all duration-300 ${selectedColor === color ? 'ring-1 ring-offset-4 ring-black scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                          style={{ backgroundColor: product.colorHexMap[color], border: '1px solid rgba(0,0,0,0.1)' }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {hasVariants && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 block">Select Size</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(hasColors && selectedColor
                        ? product.variants.filter((v: any) => v.color === selectedColor)
                        : hasColors ? [] : product.variants
                      ).map((variant: any) => {
                        // ... logic ...
                        const isSelected = selectedVariant?.id === variant.id;
                        const isOutOfStock = (variant.stock ?? variant.quantity ?? 0) === 0;
                        return (
                          <button
                            key={variant.id}
                            disabled={isOutOfStock}
                            onClick={() => {
                              setSelectedVariant(variant);
                              setSelectedSize(variant.name);
                              setSelectionHint('');
                            }}
                            className={`py-3 text-sm font-medium transition-all ${isSelected
                              ? 'bg-black text-white'
                              : isOutOfStock
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-white border border-gray-200 hover:border-black text-gray-900'
                              }`}
                          >
                            {variant.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add to Cart / Buy Now */}
                <div className="pt-4 space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={activeStock === 0 || isAdding}
                    className="w-full bg-black text-white py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    <span className={`relative z-10 transition-transform duration-300 ${isAdding ? '-translate-y-12' : 'translate-y-0'} block`}>
                      {activeStock === 0 ? 'Out of Stock' : 'Add to Bag'}
                    </span>
                    <span className={`absolute inset-0 flex items-center justify-center z-10 transition-transform duration-300 ${isAdding ? 'translate-y-0' : 'translate-y-12'}`}>
                      Added <i className="ri-check-line ml-2"></i>
                    </span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={activeStock === 0 || isBuying}
                    className="w-full border border-gray-900 text-gray-900 py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-900 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isBuying ? 'Preparing Checkout...' : 'Buy Now'}
                  </button>
                  {selectionHint && (
                    <p className="text-center text-xs text-red-500 tracking-[0.2em] uppercase">{selectionHint}</p>
                  )}
                  <p className="text-center text-xs text-gray-400 mt-4 uppercase tracking-wider">{activeStock > 0 ? 'In Stock & Ready to Ship' : 'Currently Unavailable'}</p>
                </div>
              </div>

              {/* Details Accordion */}
              <div className="divide-y divide-gray-100 border-t border-gray-100">
                <AccordionItem title="Description" isOpen={openAccordions.description} onClick={() => toggleAccordion('description')}>
                  {product.description}
                </AccordionItem>
                <AccordionItem title="Details & Care" isOpen={openAccordions.features} onClick={() => toggleAccordion('features')}>
                  <ul className="list-disc pl-4 space-y-2">
                    {product.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
                    <li>{product.care}</li>
                  </ul>
                </AccordionItem>
                <AccordionItem title="Shipping" isOpen={openAccordions.shipping} onClick={() => toggleAccordion('shipping')}>
                  {product.shipping}
                </AccordionItem>
                <AccordionItem title={`Reviews (${product.reviewCount})`} isOpen={openAccordions.reviews} onClick={() => toggleAccordion('reviews')}>
                  <ProductReviews productId={product.id} />
                </AccordionItem>
              </div>

            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="bg-white py-24 px-4 border-t border-gray-100">
            <div className="max-w-7xl mx-auto">
              <h2 className="font-serif text-3xl mb-12 text-center">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {relatedProducts.map(p => <ProductCard key={p.id} {...p} />)}
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  );
}

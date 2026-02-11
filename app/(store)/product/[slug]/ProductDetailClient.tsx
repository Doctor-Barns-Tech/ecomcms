'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cachedQuery } from '@/lib/query-cache';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import { StructuredData, generateProductSchema, generateBreadcrumbSchema } from '@/components/SEOHead';
import { notFound } from 'next/navigation';
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
  <div className="border-b border-gray-200">
    <button className="w-full py-4 flex justify-between items-center text-left focus:outline-none" onClick={onClick}>
      <span className="font-medium text-gray-900 uppercase tracking-widest text-xs">{title}</span>
      <i className={`ri-add-line transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}></i>
    </button>
    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
      <div className="text-sm text-gray-600 leading-relaxed font-light">
        {children}
      </div>
    </div>
  </div>
);

export default function ProductDetailClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<any>(null);
  usePageTitle(product?.name || 'Product');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Accordion State
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({ description: true });

  const [isWishlisted, setIsWishlisted] = useState(false);
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

        // Transform product data
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

        setSelectedVariant(null);
        setSelectedSize('');
        setSelectedColor('');

        // Fetch related products
        if (productData.category_id) {
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
  // If has colors, user must select color first. If not, user must select variant (size) if variants exist.
  const needsColorSelection = hasColors && !selectedColor;
  const needsVariantSelection = hasVariants && !selectedVariant;

  const activePrice = selectedVariant?.price ?? product?.price ?? 0;
  const activeStock = selectedVariant ? (selectedVariant.stock ?? selectedVariant.quantity ?? product?.stockCount ?? 0) : (product?.stockCount ?? 0);

  const handleAddToCart = () => {
    if (!product) return;
    if (needsVariantSelection && !needsColorSelection) {
      // If color selected but size not
      return;
    }
    if (needsColorSelection) return;

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
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/checkout';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 flex justify-center items-center">
        <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
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

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-500 mb-8 uppercase tracking-wider flex items-center gap-2">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black">Shop</Link>
            <span>/</span>
            <span className="text-black line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left Column: Gallery */}
            <div className="lg:sticky lg:top-24 h-fit space-y-4">
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  quality={90}
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-[3/4] bg-gray-100 overflow-hidden transition-opacity ${selectedImage === index ? 'opacity-100 ring-1 ring-black' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <Image
                        src={image}
                        alt={`View ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="20vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details */}
            <div className="flex flex-col">
              <div className="mb-8 border-b border-gray-100 pb-8">
                <h1 className="font-serif text-3xl md:text-5xl text-gray-900 mb-4">{product.name}</h1>
                <div className="flex items-center justify-between">
                  <div className="text-lg md:text-xl font-medium text-gray-900">
                    {hasVariants && !selectedVariant ? (
                      <span>From GH₵{minVariantPrice.toFixed(2)}</span>
                    ) : (
                      <span>GH₵{activePrice.toFixed(2)}</span>
                    )}
                    {product.compare_at_price && product.compare_at_price > activePrice && (
                      <span className="ml-3 text-gray-400 line-through font-normal text-base">GH₵{product.compare_at_price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8 mb-8">
                {/* Selectors */}
                {hasVariants && hasColors && (
                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-500 mb-3 block">Color: <span className="text-black">{selectedColor || 'Select'}</span></label>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color: string) => (
                        <button
                          key={color}
                          onClick={() => {
                            setSelectedColor(color);
                            const matching = product.variants.filter((v: any) => v.color === color);
                            if (matching.length === 1) {
                              setSelectedVariant(matching[0]);
                              setSelectedSize(matching[0].name);
                            } else {
                              setSelectedVariant(null);
                              setSelectedSize('');
                            }
                          }}
                          className={`w-10 h-10 rounded-full border border-gray-200 shadow-sm relative transition-transform ${selectedColor === color ? 'ring-1 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: product.colorHexMap[color] }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {hasVariants && (
                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-500 mb-3 block">Size / Style</label>
                    <div className="flex flex-wrap gap-3">
                      {(hasColors && selectedColor
                        ? product.variants.filter((v: any) => v.color === selectedColor)
                        : hasColors ? [] : product.variants
                      ).map((variant: any) => {
                        // Skip if multiple colors exist but none selected
                        const isSelected = selectedVariant?.id === variant.id;
                        const isOutOfStock = (variant.stock ?? variant.quantity ?? 0) === 0;
                        return (
                          <button
                            key={variant.id}
                            disabled={isOutOfStock}
                            onClick={() => {
                              setSelectedVariant(variant);
                              setSelectedSize(variant.name);
                            }}
                            className={`px-4 py-3 border text-sm min-w-[3rem] transition-colors ${isSelected
                              ? 'border-black bg-black text-white'
                              : isOutOfStock
                                ? 'border-gray-100 text-gray-300 cursor-not-allowed decoration-slice'
                                : 'border-gray-200 text-gray-900 hover:border-gray-400'}`}
                          >
                            {variant.name}
                            {/* Show price difference if varied? optional */}
                          </button>
                        )
                      })}
                      {hasColors && !selectedColor && (
                        <span className="text-sm text-gray-400 italic">Select a color to view sizes</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-500 mb-3 block">Quantity</label>
                  <div className="inline-flex items-center border border-gray-200 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(product.moq, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    ><i className="ri-subtract-line"></i></button>
                    <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      disabled={activeStock === 0}
                    ><i className="ri-add-line"></i></button>
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 mb-10">
                <button
                  onClick={handleAddToCart}
                  disabled={activeStock === 0 || needsVariantSelection || needsColorSelection}
                  className="w-full bg-black text-white py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-emerald-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activeStock === 0 ? 'Out of Stock' : (needsColorSelection || needsVariantSelection) ? 'Select Options' : 'Add to Cart'}
                </button>
                {activeStock > 0 && !needsVariantSelection && !needsColorSelection && (
                  <button
                    onClick={handleBuyNow}
                    className="w-full border border-black text-black py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-black hover:text-white transition-colors"
                  >
                    Buy Now
                  </button>
                )}
              </div>

              {/* Accordions */}
              <div className="border-t border-gray-200">
                <AccordionItem
                  title="Description"
                  isOpen={openAccordions.description}
                  onClick={() => toggleAccordion('description')}
                >
                  {product.description}
                </AccordionItem>
                <AccordionItem
                  title="Key Features"
                  isOpen={openAccordions.features}
                  onClick={() => toggleAccordion('features')}
                >
                  <ul className="list-disc pl-5 space-y-1">
                    {product.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
                  </ul>
                </AccordionItem>
                <AccordionItem
                  title="Care Instructions"
                  isOpen={openAccordions.care}
                  onClick={() => toggleAccordion('care')}
                >
                  {product.care}
                </AccordionItem>
                <AccordionItem
                  title="Shipping & Returns"
                  isOpen={openAccordions.shipping}
                  onClick={() => toggleAccordion('shipping')}
                >
                  {product.shipping}
                </AccordionItem>
              </div>

            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="py-16 bg-stone-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="font-serif text-2xl text-center mb-8">Customer Reviews</h3>
            <ProductReviews productId={product.id} />
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-16">
                <h2 className="font-serif text-3xl text-gray-900 mb-2">You May Also Like</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

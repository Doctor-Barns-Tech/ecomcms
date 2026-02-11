'use client';

import { useState } from 'react';
import Link from 'next/link';
import LazyImage from './LazyImage';
import { useCart } from '@/context/CartContext';

// Map common color names to hex values for swatches
const COLOR_MAP: Record<string, string> = {
  black: '#000000', white: '#FFFFFF', red: '#EF4444', blue: '#3B82F6',
  navy: '#1E3A5F', green: '#22C55E', yellow: '#EAB308', orange: '#F97316',
  pink: '#EC4899', purple: '#A855F7', brown: '#92400E', beige: '#D4C5A9',
  grey: '#6B7280', gray: '#6B7280', cream: '#FFFDD0', teal: '#14B8A6',
  maroon: '#800000', coral: '#FF7F50', burgundy: '#800020', olive: '#808000',
  tan: '#D2B48C', khaki: '#C3B091', charcoal: '#36454F', ivory: '#FFFFF0',
  gold: '#FFD700', silver: '#C0C0C0', rose: '#FF007F', lavender: '#E6E6FA',
  mint: '#98FB98', peach: '#FFDAB9', wine: '#722F37', denim: '#1560BD',
  nude: '#E3BC9A', camel: '#C19A6B', sage: '#BCB88A', rust: '#B7410E',
  mustard: '#FFDB58', plum: '#8E4585', lilac: '#C8A2C8', stone: '#928E85',
  sand: '#C2B280', taupe: '#483C32', mauve: '#E0B0FF', sky: '#87CEEB',
  forest: '#228B22', cobalt: '#0047AB', emerald: '#50C878', scarlet: '#FF2400',
  aqua: '#00FFFF', turquoise: '#40E0D0', indigo: '#4B0082', crimson: '#DC143C',
  magenta: '#FF00FF', cyan: '#00FFFF', chocolate: '#7B3F00', coffee: '#6F4E37',
};

export function getColorHex(colorName: string): string | null {
  const lower = colorName.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  // Try partial match (e.g. "Light Blue" -> "blue")
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

export interface ColorVariant {
  name: string;
  hex: string;
}

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
  maxStock?: number;
  moq?: number;
  hasVariants?: boolean;
  minVariantPrice?: number;
  colorVariants?: ColorVariant[];
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  originalPrice,
  image,
  rating = 5,
  reviewCount = 0,
  badge,
  inStock = true,
  maxStock = 50,
  moq = 1,
  hasVariants = false,
  minVariantPrice,
  colorVariants = []
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const displayPrice = hasVariants && minVariantPrice ? minVariantPrice : price;
  const discount = originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;
  const MAX_SWATCHES = 4;

  const formatPrice = (val: number) => `GH₵${val.toFixed(2)}`;

  return (
    <div className="group relative">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
        <Link href={`/product/${slug}`} className="block w-full h-full">
          <LazyImage
            src={image}
            alt={name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {badge && (
            <span className="bg-white/90 backdrop-blur text-gray-900 border border-gray-100 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 shadow-sm">
              {badge}
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-50 text-red-700 border border-red-100 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-900 text-white px-5 py-2 text-xs uppercase tracking-widest font-medium">Sold Out</span>
          </div>
        )}

        {/* Quick Add / Select Options - Desktop Slide Up */}
        {inStock && (
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden lg:block bg-gradient-to-t from-black/50 to-transparent pt-12">
            {hasVariants ? (
              <Link
                href={`/product/${slug}`}
                className="w-full bg-white text-gray-900 hover:bg-gray-900 hover:text-white py-3 font-medium shadow-lg transition-colors flex items-center justify-center space-x-2 text-xs uppercase tracking-widest"
              >
                <span>Select Options</span>
              </Link>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addToCart({ id, name, price, image, quantity: moq, slug, maxStock, moq });
                }}
                className="w-full bg-white text-gray-900 hover:bg-gray-900 hover:text-white py-3 font-medium shadow-lg transition-colors flex items-center justify-center space-x-2 text-xs uppercase tracking-widest"
              >
                <span>{moq > 1 ? `Add ${moq} to Cart` : 'Quick Add'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="text-center group-hover:-translate-y-1 transition-transform duration-300">
        <Link href={`/product/${slug}`}>
          <h3 className="font-serif text-lg text-gray-900 mb-1 group-hover:text-emerald-800 transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>

        <div className="flex items-center justify-center gap-3 text-sm mb-2">
          {originalPrice && (
            <span className="text-gray-400 line-through decoration-1">{formatPrice(originalPrice)}</span>
          )}
          <span className="text-gray-900 font-medium">
            {hasVariants && minVariantPrice ? `From ${formatPrice(minVariantPrice)}` : formatPrice(price)}
          </span>
        </div>

        {/* Color Swatches */}
        {colorVariants.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {colorVariants.slice(0, MAX_SWATCHES).map((color) => (
              <button
                key={color.name}
                title={color.name}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveColor(activeColor === color.name ? null : color.name);
                }}
                className={`w-3 h-3 rounded-full border border-gray-200 transition-transform hover:scale-125 ${activeColor === color.name ? 'scale-125 ring-1 ring-gray-400' : ''
                  }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {colorVariants.length > MAX_SWATCHES && (
              <span className="text-[10px] text-gray-400">+{colorVariants.length - MAX_SWATCHES}</span>
            )}
          </div>
        )}

        {/* Mobile Add Button */}
        <div className="mt-2 lg:hidden">
          {hasVariants ? (
            <Link
              href={`/product/${slug}`}
              className="w-full block border border-gray-900 text-gray-900 py-2 text-xs uppercase tracking-widest font-medium hover:bg-gray-900 hover:text-white transition-colors"
            >
              Select Options
            </Link>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart({ id, name, price, image, quantity: moq, slug, maxStock, moq });
              }}
              disabled={!inStock}
              className="w-full border border-gray-900 text-gray-900 py-2 text-xs uppercase tracking-widest font-medium hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {moq > 1 ? `Add ${moq}` : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

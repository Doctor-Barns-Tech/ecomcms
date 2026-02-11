import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const revalidate = 0; // Ensure fresh data on every visit

export default async function CategoriesPage() {
  const { data: categoriesData } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      position
    `)
    .eq('status', 'active')
    .order('position', { ascending: true });

  const categories = categoriesData?.map((c) => ({
    ...c,
    image: c.image_url || 'https://via.placeholder.com/600x800?text=Category',
  })) || [];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">

      {/* Minimalist Hero */}
      <section className="pt-32 pb-20 px-4 text-center border-b border-gray-100">
        <span className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Collections</span>
        <h1 className="font-serif text-5xl md:text-7xl mb-6">Shop by Category</h1>
        <p className="text-gray-500 font-light max-w-xl mx-auto text-lg">
          Explore our curated collections and find exactly what you're looking for.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 row-gap-16">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group block cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-6">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                </div>

                <div className="text-center">
                  <h3 className="font-serif text-2xl mb-2 group-hover:text-gray-600 transition-colors">{category.name}</h3>
                  <p className="text-gray-500 font-light text-sm line-clamp-2 mb-4 max-w-xs mx-auto">
                    {category.description}
                  </p>
                  <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] border-b border-gray-200 pb-1 group-hover:border-black transition-colors">
                    View Collection
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-gray-50">
            <p className="font-serif text-xl text-gray-400 italic">No categories found.</p>
          </div>
        )}
      </div>

      {/* Modern CTA */}
      <div className="bg-stone-50 py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl mb-6">Can't ensure what you need?</h2>
          <p className="text-gray-500 font-light mb-12 max-w-lg mx-auto">
            Our team is here to help you find the perfect match. Reach out for a personalised consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/shop"
              className="px-8 py-4 bg-white border border-gray-200 text-xs font-bold uppercase tracking-[0.2em] hover:border-black hover:bg-black hover:text-white transition-all"
            >
              Search Products
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MiniCart from './MiniCart';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useCMS } from '@/context/CMSContext';
import AnnouncementBar from './AnnouncementBar';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const { getSetting, getSettingJSON } = useCMS();

  const siteName = getSetting('site_name') || 'StandardStore';
  const siteLogo = getSetting('site_logo') || '/logo.png';
  const contactPhone = getSetting('contact_phone') || '';
  const contactEmail = getSetting('contact_email') || '';
  const topMessage =
    getSetting('header_top_message') ||
    'Free Store Pickup Available · Order Online, Pick Up Today';
  const showSearch = getSetting('header_show_search') !== 'false';
  const showWishlist = getSetting('header_show_wishlist') !== 'false';
  const showCart = getSetting('header_show_cart') !== 'false';
  const showAccount = getSetting('header_show_account') !== 'false';
  const navLinks = getSettingJSON<{ label: string; href: string }[]>('header_nav_links_json', [
    { label: 'Shop', href: '/shop' },
    { label: 'Categories', href: '/categories' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ]);

  useEffect(() => {
    // Wishlist logic
    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };

    updateWishlistCount();
    window.addEventListener('wishlistUpdated', updateWishlistCount);

    // Auth logic
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('wishlistUpdated', updateWishlistCount);
      subscription.unsubscribe();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <AnnouncementBar />

      <header className="sticky top-0 z-50 shadow-sm">
        <div className="hidden md:block bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 text-emerald-50 text-xs tracking-[0.2em] uppercase">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-6">
            <span className="font-semibold text-[11px]">{topMessage}</span>
            <div className="flex items-center gap-6 text-emerald-50/80">
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <i className="ri-phone-line text-sm" />
                  {contactPhone}
                </a>
              )}
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <i className="ri-mail-line text-sm" />
                  {contactEmail}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="backdrop-blur bg-white/90 border-b border-slate-200">
          <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden rounded-full border border-slate-200 p-2 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <i className="ri-menu-line text-xl"></i>
                </button>

                <Link href="/" className="flex items-center gap-3" aria-label="Go to homepage">
                  <img src={siteLogo} alt={siteName} className="h-9 md:h-11 w-auto object-contain drop-shadow-sm" />
                  <div className="hidden md:flex flex-col leading-tight">
                    <span className="text-sm font-semibold tracking-widest uppercase text-slate-900">{siteName}</span>
                    <span className="text-[11px] tracking-[0.3em] uppercase text-slate-400">Curated Boutique</span>
                  </div>
                </Link>
              </div>

              <div className="hidden lg:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-2 py-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-slate-600 rounded-full hover:bg-white hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {showSearch && (
                  <>
                    <button
                      className="lg:hidden w-11 h-11 rounded-full border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                      onClick={() => setIsSearchOpen(true)}
                      aria-label="Open search"
                    >
                      <i className="ri-search-line text-xl"></i>
                    </button>

                    <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 min-w-[280px]">
                      <i className="ri-search-line text-slate-400 text-lg mr-2"></i>
                      <input
                        type="search"
                        placeholder="Search the collection"
                        className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                        aria-label="Search products"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                      />
                    </div>
                  </>
                )}

                {showWishlist && (
                  <Link
                    href="/wishlist"
                    className="relative w-11 h-11 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                    aria-label={`Wishlist, ${wishlistCount} items`}
                  >
                    <i className="ri-heart-line text-xl"></i>
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-[11px] rounded-full flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                )}

                {showCart && (
                  <div className="relative">
                    <button
                      className="relative w-11 h-11 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                      onClick={() => setIsCartOpen(!isCartOpen)}
                      aria-label={`Shopping cart, ${cartCount} items`}
                      aria-expanded={isCartOpen}
                      aria-controls="mini-cart"
                    >
                      <i className="ri-shopping-bag-3-line text-xl"></i>
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-[11px] rounded-full flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </button>
                    <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                  </div>
                )}

                {showAccount && (
                  user ? (
                    <Link
                      href="/account"
                      className="hidden lg:flex w-11 h-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors"
                      aria-label="My account"
                    >
                      <i className="ri-user-fill text-xl"></i>
                    </Link>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="hidden lg:flex w-11 h-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                      aria-label="Login"
                    >
                      <i className="ri-user-line text-xl"></i>
                    </Link>
                  )
                )}
              </div>
            </div>
          </nav>
        </div>

      </header>

      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Search</p>
                  <h3 className="text-2xl font-serif text-slate-900">Find something beautiful</h3>
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-slate-900"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full px-5 py-4 pr-14 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-base text-slate-800"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    <i className="ri-search-line text-xl"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white rounded-r-3xl shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <img src={siteLogo} alt={siteName} className="h-9 w-auto object-contain" />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500"
                aria-label="Close menu"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {showSearch && (
              <div className="px-4 pt-4">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
                  <i className="ri-search-line text-slate-400 text-lg"></i>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search the collection"
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(e);
                        setIsMobileMenuOpen(false);
                        setIsSearchOpen(false);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              {[{ label: 'Home', href: '/' }, ...navLinks].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 text-base font-medium text-slate-700 bg-slate-50 hover:bg-white border border-transparent hover:border-emerald-100 rounded-2xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Quick links</p>
                {[
                  { label: 'Track Order', href: '/order-tracking', icon: 'ri-route-fill' },
                  { label: 'Wishlist', href: '/wishlist', icon: 'ri-heart-3-line' },
                  { label: 'My Account', href: '/account', icon: 'ri-user-line' },
                  { label: 'Customer Care', href: '/contact', icon: 'ri-customer-service-2-line' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className={`${link.icon} text-lg text-emerald-600`}></i>
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="p-4 border-t border-slate-100 text-center text-xs text-slate-400">
              &copy; {new Date().getFullYear()} {siteName}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
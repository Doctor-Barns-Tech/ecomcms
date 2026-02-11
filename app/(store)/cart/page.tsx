'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function CartPage() {
  usePageTitle('Shopping Bag');
  const { cart, removeFromCart, updateQuantity, subtotal, total, coupon, applyCoupon, removeCoupon } = useCart();

  // Example coupon logic UI handler
  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const code = formData.get('coupon') as string;
    if (code) {
      applyCoupon(code);
      (e.target as HTMLFormElement).reset();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center bg-white">
        <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-6">Your bag is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md font-light">Looks like you haven't added any luxury pieces to your collection yet.</p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-gray-900 text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-800 transition-colors shadow-lg"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-12 text-center md:text-left">Shopping Bag ({cart.reduce((acc, item) => acc + item.quantity, 0)})</h1>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">

          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="space-y-8">
              {cart.map((item) => (
                <div key={`${item.id}-${item.variant || 'default'}`} className="flex gap-6 py-6 border-b border-gray-100 last:border-0 group">

                  {/* Image */}
                  <div className="relative w-24 h-32 md:w-32 md:h-40 flex-shrink-0 bg-gray-50 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif text-lg text-gray-900 line-clamp-2 pr-4">{item.name}</h3>
                        <p className="font-medium text-gray-900">GH₵{(item.price * item.quantity).toFixed(2)}</p>
                      </div>

                      {item.variant && (
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{item.variant}</p>
                      )}
                      <p className="text-xs text-gray-400">GH₵{item.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.variant)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <i className="ri-subtract-line text-xs"></i>
                        </button>
                        <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, Math.min(item.maxStock, item.quantity + 1), item.variant)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                          disabled={item.quantity >= item.maxStock}
                        >
                          <i className="ri-add-line text-xs"></i>
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.id, item.variant)}
                        className="text-xs text-gray-400 hover:text-red-600 underline font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/shop" className="text-xs font-bold uppercase tracking-widest border-b border-transparent hover:border-black pb-1 hover:text-gray-600 transition-colors">
                <i className="ri-arrow-left-line mr-2"></i> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-8 sticky top-24">
              <h2 className="font-serif text-2xl text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-8 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">GH₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Estimate</span>
                  <span className="text-gray-400 italic">Calculated at checkout</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({coupon.code})</span>
                    {/* Ensure coupon amount is handled safely */}
                    <span>-GH₵{(coupon.amount || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold uppercase tracking-wide text-gray-900">Total</span>
                  <span className="font-serif text-2xl text-gray-900">GH₵{total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Tax included and shipping calculated at checkout</p>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-black text-white text-center py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-900 transition-colors shadow-lg mb-6"
              >
                Proceed to Checkout
              </Link>

              {/* Coupon Code */}
              <div className="mb-6">
                <form onSubmit={handleCouponSubmit} className="relative">
                  <input
                    type="text"
                    name="coupon"
                    placeholder="Gift card or discount code"
                    className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold uppercase text-gray-400 hover:text-black px-2 transition-colors">
                    Apply
                  </button>
                </form>
                {coupon && (
                  <div className="mt-2 text-xs text-emerald-700 flex justify-between items-center">
                    <span>Code <strong>{coupon.code}</strong> applied</span>
                    <button onClick={removeCoupon} className="text-red-500 hover:text-red-700"><i className="ri-close-circle-fill"></i></button>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="flex justify-center gap-6 text-gray-400 border-t border-gray-200 pt-6">
                <i className="ri-secure-payment-line text-2xl" title="Secure Payment"></i>
                <i className="ri-truck-line text-2xl" title="Fast Delivery"></i>
                <i className="ri-customer-service-2-line text-2xl" title="24/7 Support"></i>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

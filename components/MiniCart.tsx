'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { cart, removeFromCart, updateQuantity, subtotal } = useCart();

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-x-0 top-0 flex justify-center sm:justify-end px-4 sm:px-6 z-50">
        <div className="w-full sm:max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-100 mt-4 sm:mt-6 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 tracking-[0.2em] uppercase text-xs">
              Shopping Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-2xl text-gray-700"></i>
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <i className="ri-shopping-cart-line text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Your cart is empty</h3>
              <p className="text-sm text-gray-500">
                Add beautiful pieces to begin checkout.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="inline-flex items-center justify-center px-5 py-3 bg-emerald-700 text-white rounded-full text-sm font-semibold hover:bg-emerald-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="max-h-[50vh] overflow-y-auto p-5 space-y-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.variant}`} className="flex space-x-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-500 mt-1">Variant: {item.variant}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-bold text-gray-900">GH₵{item.price.toFixed(2)}</span>
                        <div className="flex items-center border border-gray-200 rounded-full bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-black transition-colors cursor-pointer"
                          >
                            {item.quantity <= (item.moq || 1) ? (
                              <i className="ri-delete-bin-line text-red-500"></i>
                            ) : (
                              <i className="ri-subtract-line text-base"></i>
                            )}
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-black transition-colors cursor-pointer disabled:text-gray-300"
                            disabled={item.quantity >= item.maxStock}
                          >
                            <i className="ri-add-line text-base"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.variant)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <i className="ri-close-line text-lg"></i>
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 p-5 space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 uppercase tracking-[0.3em]">Subtotal</span>
                  <span className="text-xl font-semibold text-gray-900">GH₵{subtotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Shipping calculated at checkout
                </p>
                <div className="space-y-2">
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="block w-full py-3 rounded-full bg-emerald-700 text-white text-center text-sm font-semibold tracking-[0.2em] uppercase hover:bg-emerald-800 transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="block w-full py-3 rounded-full border border-gray-900 text-gray-900 text-center text-sm font-semibold tracking-[0.2em] uppercase hover:bg-gray-50 transition-colors"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

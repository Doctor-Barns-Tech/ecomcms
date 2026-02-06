'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  usePageTitle('Complete Payment');
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { id } = await params;
        
        // Fetch order with items
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) {
          setError('Order not found');
          return;
        }

        // If already paid, redirect to success
        if (data.payment_status === 'paid') {
          router.replace(`/order-success?order=${data.order_number}`);
          return;
        }

        setOrder(data);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [params, router]);

  const handlePayNow = async () => {
    if (!order) return;
    
    setProcessing(true);
    setError(null);

    try {
      const paymentRes = await fetch('/api/payment/moolre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.order_number,
          amount: order.total,
          customerEmail: order.email
        })
      });

      const paymentResult = await paymentRes.json();

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Payment initialization failed');
      }

      // Redirect to Moolre
      window.location.href = paymentResult.url;

    } catch (err: any) {
      console.error('Payment Error:', err);
      setError(err.message || 'Failed to initialize payment');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <i className="ri-loader-4-line text-4xl text-emerald-600 animate-spin mb-4"></i>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-3xl text-red-600"></i>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-700 px-6 py-8 text-center text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-secure-payment-line text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-emerald-100">Order #{order.order_number}</p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Order Summary */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">GH₵{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">GH₵{order.shipping_total.toFixed(2)}</span>
                </div>
                {order.discount_total > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span className="font-medium">Discount</span>
                    <span className="font-medium">-GH₵{order.discount_total.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total to Pay</span>
                  <span className="text-xl font-bold text-emerald-700">GH₵{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-3">
                <i className="ri-error-warning-line text-red-600 mt-0.5"></i>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayNow}
              disabled={processing}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <i className="ri-smartphone-line"></i>
                  <span>Pay with Mobile Money</span>
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              <i className="ri-lock-line mr-1"></i>
              Secured by Moolre Payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

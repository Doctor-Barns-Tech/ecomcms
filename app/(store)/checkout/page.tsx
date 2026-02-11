'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutSteps from '@/components/CheckoutSteps';
import OrderSummary from '@/components/OrderSummary';
import { useCart } from '@/context/CartContext';
import { useCMS } from '@/context/CMSContext';
import { supabase } from '@/lib/supabase';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useRecaptcha } from '@/hooks/useRecaptcha';

export default function CheckoutPage() {
  usePageTitle('Checkout');
  const router = useRouter();
  const { cart, subtotal: cartSubtotal, clearCart } = useCart();
  const { getSetting } = useCMS();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutType, setCheckoutType] = useState<'guest' | 'account'>('guest');
  const [saveAddress, setSaveAddress] = useState(false);
  const [savePayment, setSavePayment] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { getToken, verifying } = useRecaptcha();
  const contactPhoneSetting = getSetting('contact_phone') || '+233 546 014 734';

  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: ''
  });

  // Ghana Regions for dropdown
  const ghanaRegions = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Central',
    'Eastern',
    'Northern',
    'Volta',
    'Upper East',
    'Upper West',
    'Brong-Ahafo',
    'Ahafo',
    'Bono',
    'Bono East',
    'North East',
    'Savannah',
    'Oti',
    'Western North'
  ];

  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('moolre');
  const [errors, setErrors] = useState<any>({});



  // Check auth and cart
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setCheckoutType('account'); // Auto-select account checkout if logged in
        // Pre-fill email if available
        setShippingData(prev => ({ ...prev, email: session.user.email || '' }));
      }
    }
    checkUser();

    // Small delay to ensure cart load
    const timer = setTimeout(() => {
      if (cart.length === 0 && !isLoading) {
        // router.push('/cart'); // Optional: redirect if empty
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [cart, router, isLoading]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Calculate Totals
  const subtotal = cartSubtotal;
  const shippingCost = 0; // Delivery options temporarily disabled
  const tax = 0; // No Tax
  const total = subtotal + shippingCost + tax;

  const validateShipping = () => {
    const newErrors: any = {};
    if (!shippingData.firstName) newErrors.firstName = 'First name is required';
    if (!shippingData.lastName) newErrors.lastName = 'Last name is required';
    if (!shippingData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingData.email)) newErrors.email = 'Invalid email';
    if (!shippingData.phone) newErrors.phone = 'Phone is required';
    if (!shippingData.address) newErrors.address = 'Address is required';
    if (!shippingData.city) newErrors.city = 'City is required';
    if (!shippingData.region) newErrors.region = 'Region is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToDelivery = () => {
    if (validateShipping()) {
      setCurrentStep(2);
    }
  };

  const handleContinueToPayment = async () => {
    // Skip step 3 and directly initiate payment with default method (Moolre/Mobile Money)
    await handlePlaceOrder();
  };



  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsLoading(true);

    // reCAPTCHA verification
    const isHuman = await getToken('checkout');
    if (!isHuman) {
      alert('Security verification failed. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      // Generate tracking number: SLI-XXXXXX (6-char alphanumeric)
      const trackingId = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
      const trackingNumber = `SLI-${trackingId}`;

      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          user_id: user?.id || null, // Capture user_id if logged in
          email: shippingData.email,
          phone: shippingData.phone,
          status: 'pending',
          payment_status: 'pending',
          currency: 'GHS',
          subtotal: subtotal,
          tax_total: tax,
          shipping_total: shippingCost,
          discount_total: 0,
          total: total,
          shipping_method: deliveryMethod,
          payment_method: paymentMethod,
          shipping_address: shippingData,
          billing_address: shippingData, // Using same for now
          metadata: {
            guest_checkout: !user,
            first_name: shippingData.firstName,
            last_name: shippingData.lastName,
            tracking_number: trackingNumber
          }
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items (with UUID validation)
      // Helper to check if string is a valid UUID
      const isValidUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      
      // Build order items, resolving slugs to UUIDs if needed
      const orderItems = [];
      
      // Batch-fetch product metadata (for preorder_shipping etc.)
      const productIds = cart.map(item => item.id).filter(id => isValidUUID(id));
      const { data: productsData } = productIds.length > 0
        ? await supabase.from('products').select('id, metadata').in('id', productIds)
        : { data: [] };
      const productMetaMap = new Map((productsData || []).map((p: any) => [p.id, p.metadata]));
      
      for (const item of cart) {
        let productId = item.id;
        
        // If id is not a valid UUID, it might be a slug - try to resolve it
        if (!isValidUUID(productId)) {
          const { data: product } = await supabase
            .from('products')
            .select('id, metadata')
            .or(`slug.eq.${productId},id.eq.${productId}`)
            .single();
          
          if (product) {
            productId = product.id;
            productMetaMap.set(product.id, product.metadata);
          } else {
            throw new Error(`Product not found: ${item.name}. Please remove it from your cart and try again.`);
          }
        }
        
        const prodMeta = productMetaMap.get(productId);
        
        orderItems.push({
          order_id: order.id,
          product_id: productId,
          product_name: item.name,
          variant_name: item.variant,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          metadata: {
            image: item.image,
            slug: item.slug,
            preorder_shipping: prodMeta?.preorder_shipping || null
          }
        });
      }

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Note: Stock reduction happens in mark_order_paid when payment is confirmed

      // 3. Upsert Customer Record (for both guest and registered users)
      const fullName = `${shippingData.firstName} ${shippingData.lastName}`.trim();
      await supabase.rpc('upsert_customer_from_order', {
        p_email: shippingData.email,
        p_phone: shippingData.phone,
        p_full_name: fullName,
        p_first_name: shippingData.firstName,
        p_last_name: shippingData.lastName,
        p_user_id: user?.id || null,
        p_address: shippingData
      });

      // 4. Handle Payment Redirects or Completion
      if (paymentMethod === 'moolre') {
        try {
          // Payment link reminder will be sent automatically after 15 mins if unpaid (via cron)

          const paymentRes = await fetch('/api/payment/moolre', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderNumber,
              amount: total,
              customerEmail: shippingData.email
            })
          });

          const paymentResult = await paymentRes.json();

          if (!paymentResult.success) {
            throw new Error(paymentResult.message || 'Payment initialization failed');
          }

          // Clear cart before redirecting
          clearCart();

          // Redirect to Moolre
          window.location.href = paymentResult.url;
          return;

        } catch (paymentErr: any) {
          console.error('Payment Error:', paymentErr);
          alert('Failed to initialize payment: ' + paymentErr.message);
          setIsLoading(false);
          return; // Stop execution
        }
      }

      // 5. Send Notifications (For COD or others)
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order_created',
          payload: order
        })
      }).catch(err => console.error('Notification trigger error:', err));

      // 6. Clear Cart & Redirect (For COD)
      clearCart();
      router.push(`/order-success?order=${orderNumber}`);

    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Failed to place order: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0 && !isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <i className="ri-shopping-cart-line text-4xl text-gray-300"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some items to start the checkout process.</p>
          <Link href="/shop" className="inline-block bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-800 transition-colors">
            Return to Shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white py-10 pt-28 lg:pt-12 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <i className="ri-arrow-left-line mr-2 text-base" />
            Back to cart
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-slate-400">
            <span className="inline-flex items-center gap-2">
              <i className="ri-shield-check-line text-emerald-600 text-base" />
              Secure Checkout
            </span>
            <span className="hidden sm:inline-block h-3 w-px bg-slate-200" />
            <span className="inline-flex items-center gap-2">
              <i className="ri-time-line text-emerald-600 text-base" />
              2-Step Process
            </span>
          </div>
        </div>

        <section className="bg-white/95 border border-emerald-100 rounded-3xl shadow-xl shadow-emerald-100/50 p-5 sm:p-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.5em] text-emerald-500">Step {currentStep} of 2</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-serif text-slate-900">Complete your order</h1>
                <p className="text-sm text-slate-500">Shipping, delivery, and secure payment in one elegant flow.</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
                <i className="ri-customer-service-2-line text-emerald-600 text-lg" />
                Need help? {contactPhoneSetting}
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[320px]">
              <CheckoutSteps currentStep={currentStep} />
            </div>
          </div>
        </section>

        {currentStep === 1 && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-semibold tracking-[0.3em] uppercase text-slate-500 mb-6">Choose checkout style</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => !user && setCheckoutType('guest')}
                className={`relative overflow-hidden rounded-2xl border transition-all text-left cursor-pointer bg-gradient-to-br ${checkoutType === 'guest'
                  ? 'border-emerald-500/60 from-emerald-50 to-white shadow-lg shadow-emerald-100'
                  : 'border-slate-200 hover:border-slate-300 from-white to-white'
                  } ${user ? 'opacity-50 cursor-not-allowed' : ''} p-6`}
                disabled={!!user}
              >
                <span className="absolute inset-x-6 top-6 text-[10px] uppercase tracking-[0.6em] text-slate-400">Guest</span>
                <div className="mt-8 flex items-center justify-between">
                  <i className="ri-user-line text-3xl text-emerald-600" />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${checkoutType === 'guest' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 text-transparent'
                    }`}>
                    <i className="ri-check-line text-sm" />
                  </div>
                </div>
                <h3 className="text-2xl font-serif text-slate-900 mt-4">Guest Checkout</h3>
                <p className="text-sm text-slate-500">Pay in seconds without storing your details.</p>
                {user && <p className="text-xs text-emerald-600 mt-2">You are currently logged in.</p>}
              </button>

              <button
                onClick={() => setCheckoutType('account')}
                className={`relative overflow-hidden rounded-2xl border transition-all text-left cursor-pointer bg-gradient-to-br ${checkoutType === 'account'
                  ? 'border-emerald-500/60 from-emerald-50 to-white shadow-lg shadow-emerald-100'
                  : 'border-slate-200 hover:border-slate-300 from-white to-white'
                  } p-6`}
              >
                <span className="absolute inset-x-6 top-6 text-[10px] uppercase tracking-[0.6em] text-slate-400">Account</span>
                <div className="mt-8 flex items-center justify-between">
                  <i className="ri-account-circle-line text-3xl text-emerald-600" />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${checkoutType === 'account' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 text-transparent'
                    }`}>
                    <i className="ri-check-line text-sm" />
                  </div>
                </div>
                <h3 className="text-2xl font-serif text-slate-900 mt-4">{user ? 'My Account' : 'Create Account'}</h3>
                <p className="text-sm text-slate-500">
                  {user ? `Logged in as ${user.email}` : 'Save addresses, track orders, and access loyalty perks.'}
                </p>
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {currentStep === 1 && (
              <>
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Step 1</p>
                      <h2 className="text-2xl font-serif text-slate-900">Shipping Information</h2>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
                      <i className="ri-map-pin-line text-emerald-600" />
                      Ghana Nationwide
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-semibold tracking-wide text-slate-600 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={shippingData.firstName}
                          onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                          className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm transition-all focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 ${errors.firstName ? 'border-red-400' : 'border-slate-200'
                            }`}
                          placeholder="John"
                        />
                        {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold tracking-wide text-slate-600 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={shippingData.lastName}
                          onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                          className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm transition-all focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 ${errors.lastName ? 'border-red-400' : 'border-slate-200'
                            }`}
                          placeholder="Doe"
                        />
                        {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold tracking-wide text-slate-600 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={shippingData.email}
                        readOnly={!!user}
                        onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                        className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm transition-all focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 ${errors.email ? 'border-red-400' : 'border-slate-200'
                          } ${user ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                        placeholder="you@example.com"
                      />
                      {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold tracking-wide text-slate-600 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                        className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm transition-all focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 ${errors.phone ? 'border-red-400' : 'border-slate-200'
                          }`}
                        placeholder="+233 XX XXX XXXX"
                      />
                      {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold tracking-wide text-slate-600 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={shippingData.address}
                        onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                        className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm transition-all focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 ${errors.address ? 'border-red-400' : 'border-slate-200'
                          }`}
                        placeholder="House number and street name"
                      />
                      {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-semibold tracking-wide text-slate-600 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={shippingData.city}
                          onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                          className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm transition-all focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 ${errors.city ? 'border-red-400' : 'border-slate-200'
                            }`}
                          placeholder="Accra"
                        />
                        {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold tracking-wide text-slate-600 mb-2">
                          Region *
                        </label>
                        <select
                          value={shippingData.region}
                          onChange={(e) => setShippingData({ ...shippingData, region: e.target.value })}
                          className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm transition-all focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 ${errors.region ? 'border-red-400' : 'border-slate-200'
                            }`}
                        >
                          <option value="">Select Region</option>
                          {ghanaRegions.map((region) => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                        {errors.region && <p className="text-sm text-red-600 mt-1">{errors.region}</p>}
                      </div>
                    </div>

                    {checkoutType === 'account' && (
                      <label className="flex items-center gap-3 cursor-pointer rounded-2xl border border-slate-200 p-4 hover:border-emerald-200 transition-colors">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-600">Save this address for future orders</span>
                      </label>
                    )}
                  </div>

                  <button
                    onClick={handleContinueToDelivery}
                    className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white py-4 rounded-2xl font-semibold tracking-[0.3em] uppercase transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Continue to Delivery
                  </button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Step 2</p>
                      <h2 className="text-2xl font-serif text-slate-900">Delivery & Payment</h2>
                    </div>
                    <p className="hidden sm:inline-flex items-center gap-2 text-xs text-slate-400">
                      <i className="ri-smartphone-line text-emerald-600" />
                      Mobile Money powered by Moolre
                    </p>
                  </div>
                  <div className="space-y-4">
                    <label className={`flex items-center justify-between p-5 border rounded-2xl cursor-pointer transition-all ${deliveryMethod === 'pickup' ? 'border-emerald-500 bg-emerald-50 shadow-inner shadow-emerald-100' : 'border-slate-200 hover:border-slate-300'
                      }`}>
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="delivery"
                          value="pickup"
                          checked={deliveryMethod === 'pickup'}
                          onChange={(e) => setDeliveryMethod(e.target.value)}
                          className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">Store Pickup</p>
                          <p className="text-sm text-slate-500">Collect from our flagship store within 24 hours.</p>
                        </div>
                      </div>
                      <p className="font-semibold text-emerald-700">FREE</p>
                    </label>

                    <label className={`flex items-center justify-between p-5 border rounded-2xl cursor-pointer transition-all ${deliveryMethod === 'doorstep' ? 'border-emerald-500 bg-emerald-50 shadow-inner shadow-emerald-100' : 'border-slate-200 hover:border-slate-300'
                      }`}>
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="delivery"
                          value="doorstep"
                          checked={deliveryMethod === 'doorstep'}
                          onChange={(e) => setDeliveryMethod(e.target.value)}
                          className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">Doorstep Delivery</p>
                          <p className="text-sm text-slate-500">A concierge will confirm location & delivery cost.</p>
                        </div>
                      </div>
                      <p className="font-semibold text-amber-600 text-sm">At a cost</p>
                    </label>
                  </div>

                  <div className="flex flex-col-reverse md:flex-row gap-4 mt-8">
                    <button
                      onClick={() => setCurrentStep(1)}
                      disabled={isLoading}
                      className="flex-1 border border-slate-200 hover:border-slate-300 text-slate-600 py-4 rounded-2xl font-semibold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleContinueToPayment}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-2xl font-semibold tracking-[0.2em] uppercase transition-colors whitespace-nowrap cursor-pointer disabled:opacity-70 flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Pay with Mobile Money'
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 3 removed - payment now initiates directly from step 2 */}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white border border-slate-200 rounded-3xl shadow-lg shadow-emerald-50/40 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold tracking-[0.3em] uppercase text-slate-500">Order Summary</h3>
                  <span className="text-xs text-slate-400">{cart.length} items</span>
                </div>
                <OrderSummary
                  items={cart}
                  subtotal={subtotal}
                  shipping={shippingCost}
                  tax={tax}
                  total={total}
                />
                <div className="mt-6 text-xs text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                  <i className="ri-lock-2-line text-emerald-600 text-base" />
                  Payments encrypted via SSL
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

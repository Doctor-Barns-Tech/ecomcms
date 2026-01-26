'use client';

import Link from 'next/link';
import { useState } from 'react';
import FraudDetectionAlert from '@/components/FraudDetectionAlert';

interface OrderDetailClientProps {
  orderId: string;
}

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const [orderStatus, setOrderStatus] = useState('Processing');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('TRK-2024-8573');
  const [adminNotes, setAdminNotes] = useState('');

  const order = {
    id: orderId,
    date: 'Dec 20, 2024 10:30 AM',
    status: 'Processing',
    customer: {
      name: 'Ama Osei',
      email: 'ama.osei@example.com',
      phone: '+233 24 123 4567',
      avatar: 'AO'
    },
    shipping: {
      address: '23 Nkrumah Avenue',
      city: 'Accra',
      region: 'Greater Accra',
      postalCode: 'GA-123-4567',
      country: 'Ghana',
      method: 'Express Delivery (2-3 days)',
      cost: 25.00
    },
    billing: {
      address: '23 Nkrumah Avenue',
      city: 'Accra',
      region: 'Greater Accra',
      postalCode: 'GA-123-4567',
      country: 'Ghana'
    },
    payment: {
      method: 'Moolre',
      status: 'Paid',
      transactionId: 'MOOL-2024-XY789',
      paidAt: 'Dec 20, 2024 10:31 AM'
    },
    items: [
      {
        id: 1,
        name: 'Premium Leather Crossbody Bag',
        image: 'https://readdy.ai/api/search-image?query=elegant%20premium%20leather%20crossbody%20bag%20in%20deep%20forest%20green%20color%20on%20clean%20minimal%20white%20studio%20background&width=200&height=200&seq=orddet1&orientation=squarish',
        variant: 'Color: Forest Green',
        sku: 'LCB-FG-001',
        quantity: 1,
        price: 289.00
      },
      {
        id: 2,
        name: 'Designer Brass Table Lamp',
        image: 'https://readdy.ai/api/search-image?query=contemporary%20designer%20brass%20table%20lamp%20with%20elegant%20silhouette%20on%20pure%20white%20background&width=200&height=200&seq=orddet2&orientation=squarish',
        variant: 'Size: Medium',
        sku: 'BTL-M-002',
        quantity: 1,
        price: 149.00
      }
    ],
    subtotal: 438.00,
    shipping: 25.00,
    tax: 37.00,
    discount: 50.00,
    total: 450.00,
    timeline: [
      { status: 'Order Placed', date: 'Dec 20, 2024 10:30 AM', completed: true },
      { status: 'Payment Confirmed', date: 'Dec 20, 2024 10:31 AM', completed: true },
      { status: 'Processing', date: 'Dec 20, 2024 11:00 AM', completed: true },
      { status: 'Shipped', date: '', completed: false },
      { status: 'Out for Delivery', date: '', completed: false },
      { status: 'Delivered', date: '', completed: false }
    ]
  };

  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const statusColors: any = {
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'Processing': 'bg-blue-100 text-blue-700 border-blue-200',
    'Shipped': 'bg-purple-100 text-purple-700 border-purple-200',
    'Delivered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Cancelled': 'bg-red-100 text-red-700 border-red-200'
  };

  const fraudAnalysis = {
    riskLevel: 'medium' as const,
    reasons: [
      'First-time customer with high-value order',
      'Shipping address different from billing address',
      'Multiple payment attempts detected'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {fraudAnalysis.riskLevel !== 'low' && (
              <FraudDetectionAlert
                riskLevel={fraudAnalysis.riskLevel}
                reasons={fraudAnalysis.reasons}
                orderId={orderId}
              />
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
                <span className="text-gray-600">{order.items.length} items</span>
              </div>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border border-gray-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{item.variant}</p>
                      <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 mb-1">GH₵ {item.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>GH₵ {order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping ({order.shipping.method})</span>
                  <span>GH₵ {order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (VAT)</span>
                  <span>GH₵ {order.tax.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-GH₵ {order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>GH₵ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Timeline</h2>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${event.completed ? 'bg-emerald-700 border-emerald-700' : 'bg-white border-gray-300'
                      }`}>
                      {event.completed ? (
                        <i className="ri-check-line text-white text-xl"></i>
                      ) : (
                        <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 pb-6 border-b border-gray-200 last:border-0">
                      <p className={`font-semibold ${event.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                        {event.status}
                      </p>
                      {event.date && (
                        <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status</h2>
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`w-full px-4 py-3 rounded-lg border-2 font-semibold text-left flex items-center justify-between ${statusColors[orderStatus]}`}
                >
                  <span>{orderStatus}</span>
                  <i className="ri-arrow-down-s-line text-xl"></i>
                </button>
                {showStatusMenu && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setOrderStatus(status);
                          setShowStatusMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${status === orderStatus ? 'bg-emerald-50 font-semibold' : ''
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <button className="w-full mt-4 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
                Update Status
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Customer</h2>
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                  {order.customer.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{order.customer.name}</p>
                  <p className="text-sm text-gray-600">{order.customer.email}</p>
                  <p className="text-sm text-gray-600">{order.customer.phone}</p>
                </div>
              </div>
              <Link
                href={`/admin/customers/${order.customer.email}`}
                className="text-emerald-700 hover:text-emerald-800 font-medium text-sm whitespace-nowrap"
              >
                View Customer Profile <i className="ri-arrow-right-line ml-1"></i>
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="text-gray-700 space-y-1">
                <p>{order.shipping.address}</p>
                <p>{order.shipping.city}, {order.shipping.region}</p>
                <p>{order.shipping.postalCode}</p>
                <p className="font-semibold">{order.shipping.country}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-semibold text-gray-900">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold whitespace-nowrap">
                    {order.payment.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction</span>
                  <span className="text-sm text-gray-900 font-mono">{order.payment.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid At</span>
                  <span className="text-sm text-gray-900">{order.payment.paidAt}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Notes</h2>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this order..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
              <button className="w-full mt-3 bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg font-medium transition-colors whitespace-nowrap">
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

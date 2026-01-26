'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ModulesPage() {
  const [modules, setModules] = useState([
    {
      id: 'flash-sales',
      name: 'Flash Sales',
      description: 'Time-limited promotional sales with countdown timers',
      icon: 'ri-flashlight-line',
      color: 'red',
      enabled: true,
      category: 'Marketing'
    },
    {
      id: 'loyalty-program',
      name: 'Loyalty Program',
      description: 'Points and rewards system for customer retention',
      icon: 'ri-trophy-line',
      color: 'amber',
      enabled: true,
      category: 'Customer Engagement'
    },
    {
      id: 'referral-program',
      name: 'Referral Program',
      description: 'Customer referral incentives and tracking',
      icon: 'ri-share-line',
      color: 'blue',
      enabled: true,
      category: 'Marketing'
    },
    {
      id: 'product-reviews',
      name: 'Product Reviews',
      description: 'Customer reviews and ratings system',
      icon: 'ri-star-line',
      color: 'yellow',
      enabled: true,
      category: 'Social Proof'
    },
    {
      id: 'wishlist',
      name: 'Wishlist',
      description: 'Save products for later functionality',
      icon: 'ri-heart-line',
      color: 'pink',
      enabled: true,
      category: 'Shopping Experience'
    },
    {
      id: 'product-comparison',
      name: 'Product Comparison',
      description: 'Compare multiple products side by side',
      icon: 'ri-scales-line',
      color: 'purple',
      enabled: true,
      category: 'Shopping Experience'
    },
    {
      id: 'smart-recommendations',
      name: 'Smart Recommendations',
      description: 'AI-powered product suggestions',
      icon: 'ri-lightbulb-line',
      color: 'indigo',
      enabled: true,
      category: 'Personalization'
    },
    {
      id: 'recently-viewed',
      name: 'Recently Viewed',
      description: 'Track and display recently viewed products',
      icon: 'ri-history-line',
      color: 'gray',
      enabled: true,
      category: 'Personalization'
    },
    {
      id: 'advanced-search',
      name: 'Advanced Search',
      description: 'Enhanced search with filters and suggestions',
      icon: 'ri-search-line',
      color: 'teal',
      enabled: true,
      category: 'Search & Discovery'
    },
    {
      id: 'quick-view',
      name: 'Quick View',
      description: 'Preview products without leaving the page',
      icon: 'ri-eye-line',
      color: 'cyan',
      enabled: true,
      category: 'Shopping Experience'
    },
    {
      id: 'mini-cart',
      name: 'Mini Cart',
      description: 'Slide-out cart preview',
      icon: 'ri-shopping-cart-line',
      color: 'emerald',
      enabled: true,
      category: 'Shopping Experience'
    },
    {
      id: 'live-sales-notifications',
      name: 'Live Sales Notifications',
      description: 'Real-time purchase notifications to create urgency',
      icon: 'ri-notification-3-line',
      color: 'orange',
      enabled: true,
      category: 'Social Proof'
    },
    {
      id: 'stock-notifications',
      name: 'Stock Notifications',
      description: 'Alert customers when out-of-stock items are available',
      icon: 'ri-alarm-warning-line',
      color: 'red',
      enabled: true,
      category: 'Inventory'
    },
    {
      id: 'price-drop-alerts',
      name: 'Price Drop Alerts',
      description: 'Notify customers about price reductions',
      icon: 'ri-price-tag-3-line',
      color: 'green',
      enabled: true,
      category: 'Marketing'
    },
    {
      id: 'cart-countdown',
      name: 'Cart Countdown',
      description: 'Limited-time cart reservation timer',
      icon: 'ri-timer-line',
      color: 'red',
      enabled: true,
      category: 'Urgency'
    },
    {
      id: 'free-shipping-bar',
      name: 'Free Shipping Bar',
      description: 'Progress bar showing distance to free shipping',
      icon: 'ri-truck-line',
      color: 'blue',
      enabled: true,
      category: 'Marketing'
    },
    {
      id: 'cart-suggestions',
      name: 'Cart Suggestions',
      description: 'Recommend complementary products in cart',
      icon: 'ri-lightbulb-flash-line',
      color: 'purple',
      enabled: true,
      category: 'Upsell'
    },
    {
      id: 'order-bump-upsell',
      name: 'Order Bump Upsell',
      description: 'One-click upsells during checkout',
      icon: 'ri-arrow-up-circle-line',
      color: 'green',
      enabled: true,
      category: 'Upsell'
    },
    {
      id: 'advanced-coupons',
      name: 'Advanced Coupons',
      description: 'Smart coupon system with auto-apply',
      icon: 'ri-coupon-3-line',
      color: 'orange',
      enabled: true,
      category: 'Marketing'
    },
    {
      id: 'daily-rewards',
      name: 'Daily Rewards',
      description: 'Daily check-in rewards for customers',
      icon: 'ri-gift-line',
      color: 'pink',
      enabled: true,
      category: 'Gamification'
    },
    {
      id: 'spin-to-win',
      name: 'Spin to Win Wheel',
      description: 'Interactive prize wheel for discounts',
      icon: 'ri-donut-chart-line',
      color: 'purple',
      enabled: true,
      category: 'Gamification'
    },
    {
      id: 'scratch-card',
      name: 'Scratch Card',
      description: 'Virtual scratch cards for prizes',
      icon: 'ri-vip-diamond-line',
      color: 'yellow',
      enabled: true,
      category: 'Gamification'
    },
    {
      id: 'achievement-badges',
      name: 'Achievement Badges',
      description: 'Unlock badges for shopping milestones',
      icon: 'ri-medal-line',
      color: 'amber',
      enabled: true,
      category: 'Gamification'
    },
    {
      id: 'instagram-feed',
      name: 'Instagram Feed',
      description: 'Display Instagram posts on your store',
      icon: 'ri-instagram-line',
      color: 'pink',
      enabled: true,
      category: 'Social Media'
    },
    {
      id: 'social-share',
      name: 'Social Share Buttons',
      description: 'Share products on social media',
      icon: 'ri-share-forward-line',
      color: 'blue',
      enabled: true,
      category: 'Social Media'
    },
    {
      id: 'messenger-chat',
      name: 'Messenger Chat',
      description: 'Facebook Messenger integration',
      icon: 'ri-messenger-line',
      color: 'blue',
      enabled: true,
      category: 'Customer Support'
    },
    {
      id: 'pwa-support',
      name: 'PWA Support',
      description: 'Progressive Web App capabilities',
      icon: 'ri-smartphone-line',
      color: 'indigo',
      enabled: true,
      category: 'Mobile'
    },
    {
      id: 'push-notifications',
      name: 'Push Notifications',
      description: 'Web push notifications for updates',
      icon: 'ri-notification-badge-line',
      color: 'red',
      enabled: true,
      category: 'Notifications'
    },
    {
      id: 'offline-mode',
      name: 'Offline Mode',
      description: 'Browse store without internet connection',
      icon: 'ri-wifi-off-line',
      color: 'gray',
      enabled: true,
      category: 'Mobile'
    },
    {
      id: 'image-zoom',
      name: 'Image Zoom',
      description: 'Magnify product images on hover',
      icon: 'ri-zoom-in-line',
      color: 'teal',
      enabled: true,
      category: 'Product Display'
    },
    {
      id: 'size-guide',
      name: 'Size Guide',
      description: 'Interactive size charts for products',
      icon: 'ri-ruler-line',
      color: 'purple',
      enabled: true,
      category: 'Product Display'
    },
    {
      id: 'accessibility-menu',
      name: 'Accessibility Menu',
      description: 'Tools for users with disabilities',
      icon: 'ri-accessibility-line',
      color: 'blue',
      enabled: true,
      category: 'Accessibility'
    },
    {
      id: 'multi-currency',
      name: 'Multi-Currency',
      description: 'Support multiple currencies',
      icon: 'ri-exchange-dollar-line',
      color: 'green',
      enabled: true,
      category: 'Localization'
    },
    {
      id: 'multi-language',
      name: 'Multi-Language',
      description: 'Support multiple languages',
      icon: 'ri-global-line',
      color: 'blue',
      enabled: true,
      category: 'Localization'
    },
    {
      id: 'country-selector',
      name: 'Country Selector',
      description: 'Automatic country detection and selection',
      icon: 'ri-earth-line',
      color: 'indigo',
      enabled: true,
      category: 'Localization'
    },
    {
      id: 'cookie-consent',
      name: 'Cookie Consent',
      description: 'GDPR-compliant cookie banner',
      icon: 'ri-shield-check-line',
      color: 'gray',
      enabled: true,
      category: 'Compliance'
    },
    {
      id: 'fraud-detection',
      name: 'Fraud Detection',
      description: 'Alert system for suspicious orders',
      icon: 'ri-spam-3-line',
      color: 'red',
      enabled: true,
      category: 'Security'
    },
    {
      id: 'session-timeout',
      name: 'Session Timeout Warning',
      description: 'Warn users before session expires',
      icon: 'ri-time-line',
      color: 'orange',
      enabled: true,
      category: 'Security'
    },
    {
      id: 'order-tracking',
      name: 'Order Tracking',
      description: 'Real-time order status tracking',
      icon: 'ri-map-pin-line',
      color: 'blue',
      enabled: true,
      category: 'Orders'
    },
    {
      id: 'returns-management',
      name: 'Returns Management',
      description: 'Easy return request system',
      icon: 'ri-arrow-go-back-line',
      color: 'orange',
      enabled: true,
      category: 'Orders'
    },
    {
      id: 'bulk-operations',
      name: 'Bulk Operations',
      description: 'Batch product import/export',
      icon: 'ri-file-transfer-line',
      color: 'purple',
      enabled: true,
      category: 'Admin Tools'
    }
  ]);

  const allModules: Module[] = [
    {
      id: 'cms',
      name: 'Content Management System',
      description: 'Edit entire website content from admin dashboard',
      category: 'Marketing',
      icon: 'ri-edit-box-line',
      enabled: true,
      configUrl: '/admin/cms'
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const categories = ['all', ...Array.from(new Set(modules.map(m => m.category)))];

  const toggleModule = (id: string) => {
    setModules(modules.map(m =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const toggleAll = (enable: boolean) => {
    setModules(modules.map(m => ({ ...m, enabled: enable })));
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || module.category === filterCategory;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'enabled' && module.enabled) ||
      (filterStatus === 'disabled' && !module.enabled);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const groupedModules = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof modules>);

  const enabledCount = modules.filter(m => m.enabled).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feature Modules</h1>
              <p className="text-gray-600 mt-1">Manage and configure store features</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleAll(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-check-double-line mr-2"></i>
                Enable All
              </button>
              <button
                onClick={() => toggleAll(false)}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-close-circle-line mr-2"></i>
                Disable All
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">{enabledCount} of {modules.length} Features Active</h3>
                <p className="text-emerald-100">Your store is powered by {enabledCount} amazing features</p>
              </div>
              <div className="w-24 h-24 flex items-center justify-center bg-white/20 rounded-full">
                <span className="text-4xl font-bold">{Math.round((enabledCount / modules.length) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg w-5 h-5 flex items-center justify-center"></i>
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedModules).map(([category, categoryModules]) => (
            <div key={category}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-emerald-600 rounded-full mr-3"></span>
                {category}
                <span className="ml-3 text-sm font-medium text-gray-500">
                  ({categoryModules.filter(m => m.enabled).length}/{categoryModules.length} active)
                </span>
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryModules.map((module) => (
                  <div
                    key={module.id}
                    className={`bg-white rounded-xl border-2 p-6 transition-all ${module.enabled
                        ? 'border-emerald-200 shadow-sm hover:shadow-md'
                        : 'border-gray-200 opacity-60 hover:opacity-100'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 flex items-center justify-center bg-${module.color}-100 text-${module.color}-700 rounded-lg`}>
                        <i className={`${module.icon} text-2xl`}></i>
                      </div>
                      <button
                        onClick={() => toggleModule(module.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${module.enabled ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${module.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{module.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{module.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${module.enabled
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                        }`}>
                        {module.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredModules.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No modules found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

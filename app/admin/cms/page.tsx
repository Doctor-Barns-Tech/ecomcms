'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CMSSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  available: boolean;
}

export default function CMSPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const cmsSections: CMSSection[] = [
    {
      id: 'homepage',
      name: 'Homepage',
      description: 'Edit hero sections, featured products, and homepage content',
      icon: 'ri-home-4-line',
      path: '/admin/homepage',
      color: 'bg-emerald-100 text-emerald-700',
      available: true
    },
    {
      id: 'settings',
      name: 'Site Settings',
      description: 'Configure site name, contact info, social links, and theme',
      icon: 'ri-settings-3-line',
      path: '/admin/settings',
      color: 'bg-blue-100 text-blue-700',
      available: true
    },
    {
      id: 'products',
      name: 'Products',
      description: 'Manage product listings, descriptions, and images',
      icon: 'ri-shopping-bag-3-line',
      path: '/admin/products',
      color: 'bg-purple-100 text-purple-700',
      available: true
    },
    {
      id: 'categories',
      name: 'Categories',
      description: 'Organize products into categories and collections',
      icon: 'ri-folder-line',
      path: '/admin/categories',
      color: 'bg-amber-100 text-amber-700',
      available: true
    },
    {
      id: 'pages',
      name: 'Static Pages',
      description: 'Edit content for About, Contact, FAQ, and policy pages',
      icon: 'ri-pages-line',
      path: '/admin/cms/pages',
      color: 'bg-cyan-100 text-cyan-700',
      available: true
    },
    {
      id: 'navigation',
      name: 'Navigation',
      description: 'Manage header, footer, and mobile navigation menus',
      icon: 'ri-menu-line',
      path: '/admin/cms/navigation',
      color: 'bg-indigo-100 text-indigo-700',
      available: true
    },
    {
      id: 'banners',
      name: 'Banners & Promotions',
      description: 'Create announcement bars, promotional banners, and popups',
      icon: 'ri-flag-2-line',
      path: '/admin/cms/banners',
      color: 'bg-rose-100 text-rose-700',
      available: true
    },
    {
      id: 'media',
      name: 'Media Library',
      description: 'Upload and manage images, banners, and media files',
      icon: 'ri-image-2-line',
      path: '/admin/cms/media',
      color: 'bg-pink-100 text-pink-700',
      available: true
    },
    {
      id: 'blog',
      name: 'Blog & Articles',
      description: 'Create and manage blog posts and articles',
      icon: 'ri-article-line',
      path: '/admin/blog',
      color: 'bg-orange-100 text-orange-700',
      available: true
    },
    {
      id: 'coupons',
      name: 'Coupons & Discounts',
      description: 'Create promotional codes and discount campaigns',
      icon: 'ri-coupon-line',
      path: '/admin/coupons',
      color: 'bg-red-100 text-red-700',
      available: true
    }
  ];

  const filteredSections = cmsSections.filter(section =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Edit and manage all website content from one place</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
        <input
          type="text"
          placeholder="Search CMS sections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => (
          <Link
            key={section.id}
            href={section.path}
            className={`bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 ${!section.available ? 'opacity-60 pointer-events-none' : ''
              }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 ${section.color} rounded-xl flex items-center justify-center`}>
                <i className={`${section.icon} text-2xl`}></i>
              </div>
              {!section.available && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">
                  Coming Soon
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.name}</h3>
            <p className="text-sm text-gray-600">{section.description}</p>

            <div className="mt-4 flex items-center text-emerald-700 font-medium text-sm group-hover:translate-x-1 transition-transform">
              <span>Open Editor</span>
              <i className="ri-arrow-right-line ml-2"></i>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-3">Quick Tips</h2>
            <ul className="space-y-2 text-emerald-50">
              <li className="flex items-start gap-2">
                <i className="ri-check-line mt-1"></i>
                <span>Changes to site settings are applied immediately across the store</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line mt-1"></i>
                <span>Use the Preview button to see changes before publishing</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line mt-1"></i>
                <span>Optimize images before uploading for faster page loads</span>
              </li>
            </ul>
          </div>
          <div className="hidden md:flex w-20 h-20 bg-white/20 rounded-full items-center justify-center">
            <i className="ri-lightbulb-line text-4xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
}

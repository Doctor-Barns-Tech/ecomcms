'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30days');
  const [reportType, setReportType] = useState('overview');

  const salesData = [
    { date: 'Jan 1', sales: 12500, orders: 45, customers: 38 },
    { date: 'Jan 8', sales: 18300, orders: 62, customers: 51 },
    { date: 'Jan 15', sales: 15700, orders: 53, customers: 44 },
    { date: 'Jan 22', sales: 22100, orders: 78, customers: 65 },
    { date: 'Jan 29', sales: 19800, orders: 68, customers: 57 },
    { date: 'Feb 5', sales: 25600, orders: 89, customers: 74 },
    { date: 'Feb 12', sales: 28900, orders: 95, customers: 82 },
    { date: 'Feb 19', sales: 31200, orders: 102, customers: 89 },
    { date: 'Feb 26', sales: 27500, orders: 91, customers: 76 },
    { date: 'Mar 5', sales: 34100, orders: 112, customers: 95 }
  ];

  const categoryRevenue = [
    { category: 'Electronics', revenue: 125000, percentage: 35, orders: 456 },
    { category: 'Fashion', revenue: 98000, percentage: 28, orders: 892 },
    { category: 'Home & Living', revenue: 67000, percentage: 19, orders: 334 },
    { category: 'Sports', revenue: 45000, percentage: 13, orders: 267 },
    { category: 'Beauty', revenue: 18000, percentage: 5, orders: 178 }
  ];

  const topProducts = [
    { name: 'Premium Wireless Headphones', revenue: 45000, units: 150, growth: 24 },
    { name: 'Smart Fitness Watch', revenue: 38400, units: 120, growth: 18 },
    { name: 'Leather Crossbody Bag', revenue: 28900, units: 100, growth: 32 },
    { name: 'Organic Cotton T-Shirt', revenue: 22300, units: 250, growth: -5 },
    { name: 'Ceramic Coffee Mug Set', revenue: 18750, units: 150, growth: 12 }
  ];

  const customerSegments = [
    { segment: 'VIP Customers', count: 245, value: 185000, color: '#10b981' },
    { segment: 'Returning', count: 892, value: 125000, color: '#3b82f6' },
    { segment: 'New Customers', count: 1456, value: 78000, color: '#f59e0b' },
    { segment: 'At Risk', count: 178, value: 32000, color: '#ef4444' }
  ];

  const geographicSales = [
    { region: 'Greater Accra', sales: 145000, orders: 1234, percentage: 42 },
    { region: 'Ashanti', sales: 98000, orders: 856, percentage: 28 },
    { region: 'Western', sales: 52000, orders: 445, percentage: 15 },
    { region: 'Eastern', sales: 34000, orders: 298, percentage: 10 },
    { region: 'Others', sales: 18000, orders: 167, percentage: 5 }
  ];

  const conversionFunnel = [
    { stage: 'Visitors', count: 45000, percentage: 100 },
    { stage: 'Product Views', count: 18000, percentage: 40 },
    { stage: 'Add to Cart', count: 7200, percentage: 16 },
    { stage: 'Checkout', count: 4500, percentage: 10 },
    { stage: 'Completed', count: 2700, percentage: 6 }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600 mt-2">Detailed insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium pr-8"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
            <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
              <i className="ri-download-line mr-2"></i>
              Export Report
            </button>
            <Link
              href="/admin"
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
            >
              Back
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 rounded-lg">
                <i className="ri-money-dollar-circle-line text-2xl text-emerald-700"></i>
              </div>
              <span className="text-emerald-700 font-semibold text-sm">+24.5%</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">GH₵347K</p>
            <p className="text-sm text-gray-500 mt-2">vs. last period: GH₵279K</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
                <i className="ri-shopping-cart-line text-2xl text-blue-700"></i>
              </div>
              <span className="text-blue-700 font-semibold text-sm">+18.2%</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">2,847</p>
            <p className="text-sm text-gray-500 mt-2">vs. last period: 2,409</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg">
                <i className="ri-bar-chart-box-line text-2xl text-purple-700"></i>
              </div>
              <span className="text-purple-700 font-semibold text-sm">+8.4%</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg. Order Value</p>
            <p className="text-3xl font-bold text-gray-900">GH₵122</p>
            <p className="text-sm text-gray-500 mt-2">vs. last period: GH₵112</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-amber-100 rounded-lg">
                <i className="ri-percent-line text-2xl text-amber-700"></i>
              </div>
              <span className="text-amber-700 font-semibold text-sm">+2.1%</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-gray-900">6.2%</p>
            <p className="text-sm text-gray-500 mt-2">vs. last period: 6.1%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Revenue & Performance Trends</h2>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              {['overview', 'revenue', 'orders', 'customers'].map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-colors capitalize whitespace-nowrap ${reportType === type
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" name="Sales (GH₵)" />
              {reportType === 'overview' && (
                <>
                  <Area type="monotone" dataKey="orders" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Orders" />
                  <Area type="monotone" dataKey="customers" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} name="Customers" />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue by Category</h2>
            <div className="flex items-center justify-center mb-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="revenue"
                    label={({ payload }: any) => `${payload.percentage}%`}
                  >
                    {categoryRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `GH₵${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {categoryRevenue.map((cat, index) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-gray-700 font-medium">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">GH₵{cat.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{cat.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Segments</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={customerSegments} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="segment" type="category" stroke="#6b7280" width={100} />
                <Tooltip formatter={(value: number) => `GH₵${value.toLocaleString()}`} />
                <Bar dataKey="value" name="Customer Value">
                  {customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-6">
              {customerSegments.map((segment) => (
                <div key={segment.segment} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                    <span className="font-medium text-gray-900">{segment.segment}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{segment.count} customers</p>
                    <p className="text-sm text-gray-600">GH₵{segment.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Products</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-emerald-500 transition-colors">
                  <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-lg font-bold text-emerald-700">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.units} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">GH₵{product.revenue.toLocaleString()}</p>
                    <p className={`text-sm font-semibold ${product.growth > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {product.growth > 0 ? '+' : ''}{product.growth}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Geographic Sales Distribution</h2>
            <div className="space-y-4">
              {geographicSales.map((region) => (
                <div key={region.region} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className="ri-map-pin-line text-xl text-emerald-700"></i>
                      <span className="font-semibold text-gray-900">{region.region}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">GH₵{region.sales.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{region.orders} orders</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-emerald-700 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${region.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{region.percentage}% of total sales</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Conversion Funnel Analysis</h2>
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-white ${index === 0 ? 'bg-blue-600' :
                        index === 1 ? 'bg-emerald-600' :
                          index === 2 ? 'bg-amber-600' :
                            index === 3 ? 'bg-orange-600' : 'bg-green-600'
                      }`}>
                      {index + 1}
                    </div>
                    <span className="font-semibold text-gray-900 text-lg">{stage.stage}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{stage.count.toLocaleString()}</p>
                    <p className="text-sm font-semibold text-gray-600">{stage.percentage}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className={`h-6 rounded-full transition-all duration-700 ${index === 0 ? 'bg-blue-600' :
                        index === 1 ? 'bg-emerald-600' :
                          index === 2 ? 'bg-amber-600' :
                            index === 3 ? 'bg-orange-600' : 'bg-green-600'
                      }`}
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
                {index < conversionFunnel.length - 1 && (
                  <div className="flex items-center justify-center my-2">
                    <i className="ri-arrow-down-line text-2xl text-gray-400"></i>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <i className="ri-lightbulb-line text-xl text-amber-700 mt-0.5"></i>
              <div>
                <p className="font-semibold text-amber-900 mb-1">Optimization Opportunity</p>
                <p className="text-sm text-amber-700">
                  Cart abandonment rate is 37.5%. Consider implementing exit-intent popups and cart recovery emails to recover lost sales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

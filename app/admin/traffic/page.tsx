'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TrafficData {
  pageViews: number;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: string;
  topPages: { page: string; views: number }[];
  topDevices: { device: string; sessions: number; percentage: number }[];
  topLocations: { country: string; city: string; sessions: number }[];
  dailyVisits: { date: string; visits: number; pageViews: number }[];
}

export default function TrafficAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);

  useEffect(() => {
    checkGAConnection();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchTrafficData();
    }
  }, [timeRange, isConnected]);

  const checkGAConnection = async () => {
    try {
      const res = await fetch('/api/analytics/status');
      const data = await res.json();
      setIsConnected(data.connected);
      setLoading(false);
    } catch {
      setIsConnected(false);
      setLoading(false);
    }
  };

  const fetchTrafficData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/traffic?range=${timeRange}`);
      const data = await res.json();
      if (data.success) {
        setTrafficData(data.data);
      }
    } catch (error) {
      console.error('Error fetching traffic data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Traffic Analytics</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Website visitors, devices, and location insights
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium bg-white cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <Link
              href="/admin/analytics"
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors text-center"
            >
              Sales Analytics
            </Link>
            <Link
              href="/admin"
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-center"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {!isConnected ? (
          /* Setup Instructions */
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-line-chart-line text-3xl text-blue-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Google Analytics</h2>
              <p className="text-gray-600 mb-8">
                To view traffic analytics, you need to set up Google Analytics 4 and connect it to this dashboard.
              </p>

              <div className="text-left bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Setup Steps:</h3>
                <ol className="space-y-4 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-xs">1</span>
                    <div>
                      <strong>Create a Google Analytics 4 Property</strong>
                      <p className="text-gray-500 mt-1">Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">analytics.google.com</a> and create a new GA4 property for your website.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-xs">2</span>
                    <div>
                      <strong>Get your Measurement ID</strong>
                      <p className="text-gray-500 mt-1">Find your Measurement ID (starts with G-) in Admin → Data Streams → Web.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-xs">3</span>
                    <div>
                      <strong>Add to Environment Variables</strong>
                      <p className="text-gray-500 mt-1">Add <code className="bg-gray-200 px-2 py-0.5 rounded">NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX</code> to your environment.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-xs">4</span>
                    <div>
                      <strong>Set up Google Search Console (Optional)</strong>
                      <p className="text-gray-500 mt-1">Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Google Search Console</a>, add your site, and get the verification code.</p>
                      <p className="text-gray-500 mt-1">Add <code className="bg-gray-200 px-2 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code</code> to environment.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-xs">5</span>
                    <div>
                      <strong>Connect Analytics API (For Dashboard Data)</strong>
                      <p className="text-gray-500 mt-1">Create a service account in Google Cloud Console, download the JSON key, and add:</p>
                      <ul className="text-gray-500 mt-2 ml-4 space-y-1">
                        <li><code className="bg-gray-200 px-2 py-0.5 rounded text-xs">GA_PROPERTY_ID=your-property-id</code></li>
                        <li><code className="bg-gray-200 px-2 py-0.5 rounded text-xs">GOOGLE_APPLICATION_CREDENTIALS_JSON={"{"}"type":"service_account",...{"}"}</code></li>
                      </ul>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <i className="ri-external-link-line"></i>
                  Open Google Analytics
                </a>
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <i className="ri-search-line"></i>
                  Open Search Console
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Connected - Show Analytics */
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="ri-user-line text-xl text-blue-600"></i>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Users</p>
                <p className="text-2xl font-bold text-gray-900">{trafficData?.users.toLocaleString() || 0}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="ri-login-box-line text-xl text-green-600"></i>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{trafficData?.sessions.toLocaleString() || 0}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="ri-eye-line text-xl text-purple-600"></i>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Page Views</p>
                <p className="text-2xl font-bold text-gray-900">{trafficData?.pageViews.toLocaleString() || 0}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <i className="ri-arrow-go-back-line text-xl text-amber-600"></i>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Bounce Rate</p>
                <p className="text-2xl font-bold text-gray-900">{trafficData?.bounceRate.toFixed(1) || 0}%</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                    <i className="ri-time-line text-xl text-rose-600"></i>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Avg. Duration</p>
                <p className="text-2xl font-bold text-gray-900">{trafficData?.avgSessionDuration || '0:00'}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Daily Visits Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Visits</h2>
                <div className="h-64">
                  {trafficData?.dailyVisits && trafficData.dailyVisits.length > 0 ? (
                    <div className="flex items-end h-full gap-1">
                      {trafficData.dailyVisits.map((day, i) => {
                        const maxVisits = Math.max(...trafficData.dailyVisits.map(d => d.visits));
                        const height = maxVisits > 0 ? (day.visits / maxVisits) * 100 : 0;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                            <div
                              className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                              style={{ height: `${height}%`, minHeight: day.visits > 0 ? '4px' : '0' }}
                              title={`${day.date}: ${day.visits} visits`}
                            ></div>
                            <span className="text-xs text-gray-500 mt-2 rotate-45 origin-left whitespace-nowrap">
                              {day.date.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No visit data available
                    </div>
                  )}
                </div>
              </div>

              {/* Devices */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Devices</h2>
                <div className="space-y-4">
                  {trafficData?.topDevices && trafficData.topDevices.length > 0 ? (
                    trafficData.topDevices.map((device, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 flex items-center gap-2">
                            <i className={`${device.device === 'mobile' ? 'ri-smartphone-line' : device.device === 'tablet' ? 'ri-tablet-line' : 'ri-computer-line'}`}></i>
                            {device.device.charAt(0).toUpperCase() + device.device.slice(1)}
                          </span>
                          <span className="text-gray-500">{device.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${device.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">No device data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Top Pages</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-100">
                      <tr>
                        <th className="text-left pb-3 text-sm font-semibold text-gray-600">Page</th>
                        <th className="text-right pb-3 text-sm font-semibold text-gray-600">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {trafficData?.topPages && trafficData.topPages.length > 0 ? (
                        trafficData.topPages.map((page, i) => (
                          <tr key={i}>
                            <td className="py-3 text-sm text-gray-700 truncate max-w-xs">{page.page}</td>
                            <td className="py-3 text-right text-sm font-semibold text-gray-900">{page.views.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center py-8 text-gray-500">No page data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Locations */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Top Locations</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-100">
                      <tr>
                        <th className="text-left pb-3 text-sm font-semibold text-gray-600">Location</th>
                        <th className="text-right pb-3 text-sm font-semibold text-gray-600">Sessions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {trafficData?.topLocations && trafficData.topLocations.length > 0 ? (
                        trafficData.topLocations.map((loc, i) => (
                          <tr key={i}>
                            <td className="py-3 text-sm text-gray-700">
                              <span className="font-medium">{loc.city}</span>
                              <span className="text-gray-400 ml-1">({loc.country})</span>
                            </td>
                            <td className="py-3 text-right text-sm font-semibold text-gray-900">{loc.sessions.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center py-8 text-gray-500">No location data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

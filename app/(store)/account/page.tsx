'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderHistory from './OrderHistory';
import AddressBook from './AddressBook';
import { supabase } from '@/lib/supabase';

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form States
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      setUser(session.user);
      setProfileData({
        firstName: session.user.user_metadata?.first_name || '',
        lastName: session.user.user_metadata?.last_name || '',
        email: session.user.email || '',
        phone: session.user.phone || ''
      });
      setLoading(false);
    }
    checkUser();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone // Storing phone in metadata for now
        }
      });

      if (error) throw error;
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (passwordData.password.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.password
      });
      if (error) throw error;
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ password: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <i className="ri-loader-4-line animate-spin text-4xl text-emerald-700"></i>
      </div>
    );
  }

  const quickActions = [
    {
      icon: 'ri-medal-line',
      title: 'Loyalty Program',
      description: 'Earn points and rewards',
      link: '/loyalty'
    },
    {
      icon: 'ri-user-add-line',
      title: 'Refer & Earn',
      description: 'Invite friends and earn rewards',
      link: '/referral'
    }
  ];

  const securityOptions = [
    {
      icon: 'ri-mail-check-line',
      title: 'Verify Email',
      description: user?.email,
      status: user?.email_confirmed_at ? 'verified' : 'unverified',
      link: '#' // /account/verify-email
    },
    {
      icon: 'ri-phone-line',
      title: 'Verify Phone',
      description: user?.phone || 'No phone added',
      status: user?.phone_confirmed_at ? 'verified' : 'unverified',
      link: '#' // /account/verify-phone
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
              <p className="text-gray-600">Welcome back, {profileData.firstName || user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'profile'
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <i className="ri-user-line mr-2"></i>
                Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'orders'
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <i className="ri-shopping-bag-line mr-2"></i>
                Orders
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'addresses'
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <i className="ri-map-pin-line mr-2"></i>
                Addresses
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'security'
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <i className="ri-lock-line mr-2"></i>
                Security
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                    {profileMessage.text && (
                      <div className={`mb-4 p-4 rounded-lg text-sm ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {profileMessage.text}
                      </div>
                    )}
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={profileData.firstName}
                            onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={profileData.lastName}
                            onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                          placeholder="+233 XX XXX XXXX"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={profileLoading}
                          className="px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                          {profileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                      {passwordMessage.text && (
                        <div className={`mb-4 p-4 rounded-lg text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {passwordMessage.text}
                        </div>
                      )}
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.password}
                            onChange={e => setPasswordData({ ...passwordData, password: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                          {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && <OrderHistory />}

                {activeTab === 'addresses' && <AddressBook />}

                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                    <div className="space-y-3">
                      {securityOptions.map((option, index) => (
                        <Link
                          key={index}
                          href={option.link}
                          className="flex items-center justify-between p-4 border rounded-lg hover:border-black transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                              <i className={`${option.icon} text-lg`}></i>
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm">{option.title}</h3>
                              <p className="text-xs text-gray-600">{option.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {option.status === 'verified' && (
                              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded whitespace-nowrap">
                                <i className="ri-checkbox-circle-fill mr-1"></i>Verified
                              </span>
                            )}
                            {option.status === 'unverified' && (
                              <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 rounded whitespace-nowrap">
                                <i className="ri-error-warning-line mr-1"></i>Unverified
                              </span>
                            )}
                            <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Security & Verification Section */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-bold mb-4">Security & Verification</h2>
                <div className="space-y-3">
                  {securityOptions.map((option, index) => (
                    <Link
                      key={index}
                      href={option.link}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-black transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                          <i className={`${option.icon} text-lg`}></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{option.title}</h3>
                          <p className="text-xs text-gray-600">{option.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {option.status === 'verified' && (
                          <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded whitespace-nowrap">
                            <i className="ri-checkbox-circle-fill mr-1"></i>
                          </span>
                        )}
                        {option.status === 'unverified' && (
                          <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 rounded whitespace-nowrap">
                            <i className="ri-error-warning-line mr-1"></i>
                          </span>
                        )}
                        <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Privacy & Data Section */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-bold mb-4">Privacy & Data Management</h2>
                <div className="space-y-3">
                  <Link
                    href="#"
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-black transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                        <i className="ri-shield-user-line text-lg"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Privacy Settings</h3>
                        <p className="text-xs text-gray-600">Manage your data</p>
                      </div>
                    </div>
                    <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

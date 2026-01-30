'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Banner {
    id?: string;
    name: string;
    type: 'announcement' | 'promotional' | 'hero' | 'popup';
    title: string;
    subtitle: string;
    image_url: string;
    background_color: string;
    text_color: string;
    button_text: string;
    button_url: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    position: 'top' | 'bottom' | 'hero' | 'popup';
    sort_order: number;
}

const defaultBanner: Banner = {
    name: '',
    type: 'announcement',
    title: '',
    subtitle: '',
    image_url: '',
    background_color: '#059669',
    text_color: '#FFFFFF',
    button_text: '',
    button_url: '',
    start_date: '',
    end_date: '',
    is_active: true,
    position: 'top',
    sort_order: 0,
};

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setBanners(data || []);
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingBanner) return;
        setSaving(true);

        try {
            if (editingBanner.id) {
                const { error } = await supabase
                    .from('banners')
                    .update({
                        name: editingBanner.name,
                        type: editingBanner.type,
                        title: editingBanner.title,
                        subtitle: editingBanner.subtitle,
                        image_url: editingBanner.image_url,
                        background_color: editingBanner.background_color,
                        text_color: editingBanner.text_color,
                        button_text: editingBanner.button_text,
                        button_url: editingBanner.button_url,
                        start_date: editingBanner.start_date || null,
                        end_date: editingBanner.end_date || null,
                        is_active: editingBanner.is_active,
                        position: editingBanner.position,
                        sort_order: editingBanner.sort_order,
                    })
                    .eq('id', editingBanner.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('banners')
                    .insert({
                        name: editingBanner.name,
                        type: editingBanner.type,
                        title: editingBanner.title,
                        subtitle: editingBanner.subtitle,
                        image_url: editingBanner.image_url,
                        background_color: editingBanner.background_color,
                        text_color: editingBanner.text_color,
                        button_text: editingBanner.button_text,
                        button_url: editingBanner.button_url,
                        start_date: editingBanner.start_date || null,
                        end_date: editingBanner.end_date || null,
                        is_active: editingBanner.is_active,
                        position: editingBanner.position,
                        sort_order: editingBanner.sort_order,
                    });

                if (error) throw error;
            }

            setShowForm(false);
            setEditingBanner(null);
            fetchBanners();
        } catch (error) {
            console.error('Error saving banner:', error);
            alert('Failed to save banner');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            const { error } = await supabase.from('banners').delete().eq('id', id);
            if (error) throw error;
            fetchBanners();
        } catch (error) {
            console.error('Error deleting banner:', error);
            alert('Failed to delete banner');
        }
    };

    const toggleActive = async (banner: Banner) => {
        try {
            const { error } = await supabase
                .from('banners')
                .update({ is_active: !banner.is_active })
                .eq('id', banner.id);

            if (error) throw error;
            fetchBanners();
        } catch (error) {
            console.error('Error toggling banner:', error);
        }
    };

    const getBannerTypeColor = (type: string) => {
        switch (type) {
            case 'announcement': return 'bg-blue-100 text-blue-700';
            case 'promotional': return 'bg-purple-100 text-purple-700';
            case 'hero': return 'bg-emerald-100 text-emerald-700';
            case 'popup': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <i className="ri-loader-4-line animate-spin text-4xl text-emerald-700"></i>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/admin/cms"
                        className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                        <i className="ri-arrow-left-line text-xl text-gray-700"></i>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Banners & Promotions</h1>
                        <p className="text-gray-600 mt-1">Manage announcement bars, promotional banners, and popups</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditingBanner({ ...defaultBanner });
                        setShowForm(true);
                    }}
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors"
                >
                    <i className="ri-add-line mr-2"></i>
                    New Banner
                </button>
            </div>

            {/* Banner Form Modal */}
            {showForm && editingBanner && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingBanner.id ? 'Edit Banner' : 'Create New Banner'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingBanner(null);
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <i className="ri-close-line text-xl text-gray-600"></i>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Banner Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingBanner.name}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, name: e.target.value })}
                                        placeholder="e.g., Summer Sale Banner"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={editingBanner.type}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, type: e.target.value as any })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="announcement">Announcement Bar</option>
                                        <option value="promotional">Promotional Banner</option>
                                        <option value="hero">Hero Banner</option>
                                        <option value="popup">Popup</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Title / Message *
                                </label>
                                <input
                                    type="text"
                                    value={editingBanner.title}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                                    placeholder="e.g., Free Shipping on Orders Over GH₵200"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Subtitle (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={editingBanner.subtitle}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                                    placeholder="Additional text"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Image URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={editingBanner.image_url}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, image_url: e.target.value })}
                                    placeholder="https://example.com/banner.jpg"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Background Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={editingBanner.background_color}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, background_color: e.target.value })}
                                            className="w-14 h-12 rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={editingBanner.background_color}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, background_color: e.target.value })}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Text Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={editingBanner.text_color}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, text_color: e.target.value })}
                                            className="w-14 h-12 rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={editingBanner.text_color}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, text_color: e.target.value })}
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Button Text (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={editingBanner.button_text}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, button_text: e.target.value })}
                                        placeholder="e.g., Shop Now"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Button URL
                                    </label>
                                    <input
                                        type="text"
                                        value={editingBanner.button_url}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, button_url: e.target.value })}
                                        placeholder="e.g., /shop"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Start Date (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={editingBanner.start_date}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, start_date: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        End Date (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={editingBanner.end_date}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, end_date: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Position
                                    </label>
                                    <select
                                        value={editingBanner.position}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, position: e.target.value as any })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="top">Top of Page</option>
                                        <option value="bottom">Bottom of Page</option>
                                        <option value="hero">Hero Section</option>
                                        <option value="popup">Popup</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        value={editingBanner.sort_order}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, sort_order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editingBanner.is_active}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, is_active: e.target.checked })}
                                    className="w-5 h-5 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500"
                                />
                                <span className="text-gray-700 font-medium">Active</span>
                            </label>

                            {/* Preview */}
                            {editingBanner.title && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Preview
                                    </label>
                                    <div
                                        className="py-3 px-4 text-center rounded-lg"
                                        style={{
                                            backgroundColor: editingBanner.background_color,
                                            color: editingBanner.text_color,
                                        }}
                                    >
                                        <p className="font-medium">{editingBanner.title}</p>
                                        {editingBanner.subtitle && <p className="text-sm opacity-90">{editingBanner.subtitle}</p>}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingBanner(null);
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !editingBanner.name || !editingBanner.title}
                                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Banner'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Banners List */}
            {banners.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-flag-2-line text-3xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No banners yet</h3>
                    <p className="text-gray-600 mb-6">Create your first banner to promote offers and announcements</p>
                    <button
                        onClick={() => {
                            setEditingBanner({ ...defaultBanner });
                            setShowForm(true);
                        }}
                        className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors"
                    >
                        <i className="ri-add-line mr-2"></i>
                        Create Banner
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Banner</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Position</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {banners.map((banner) => (
                                    <tr key={banner.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-12 h-8 rounded flex items-center justify-center text-xs font-bold"
                                                    style={{
                                                        backgroundColor: banner.background_color,
                                                        color: banner.text_color,
                                                    }}
                                                >
                                                    Aa
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{banner.name}</p>
                                                    <p className="text-sm text-gray-500 truncate max-w-xs">{banner.title}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBannerTypeColor(banner.type)}`}>
                                                {banner.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-700 capitalize">{banner.position}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActive(banner)}
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${banner.is_active
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {banner.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingBanner(banner);
                                                        setShowForm(true);
                                                    }}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <i className="ri-pencil-line text-gray-600"></i>
                                                </button>
                                                <button
                                                    onClick={() => banner.id && handleDelete(banner.id)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    <i className="ri-delete-bin-line text-red-600"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

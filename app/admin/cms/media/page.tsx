'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface MediaFile {
  name: string;
  id: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('media')
        .list('uploads', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        // Bucket might not exist, try to create it
        console.log('Media bucket may not exist:', error.message);
        setFiles([]);
        return;
      }

      const filesWithUrls = (data || [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => {
          const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(`uploads/${file.name}`);

          return {
            name: file.name,
            id: file.id || file.name,
            url: urlData.publicUrl,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'unknown',
            created_at: file.created_at || new Date().toISOString(),
          };
        });

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;

    setUploading(true);
    const errors: string[] = [];

    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      try {
        const { error } = await supabase.storage
          .from('media')
          .upload(`uploads/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          errors.push(`${file.name}: ${error.message}`);
        }
      } catch (err) {
        errors.push(`${file.name}: Upload failed`);
      }
    }

    if (errors.length > 0) {
      alert(`Some files failed to upload:\n${errors.join('\n')}`);
    }

    setUploading(false);
    fetchFiles();

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([`uploads/${fileName}`]);

      if (error) throw error;
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} files?`)) return;

    try {
      const filesToDelete = Array.from(selectedFiles).map(name => `uploads/${name}`);
      const { error } = await supabase.storage
        .from('media')
        .remove(filesToDelete);

      if (error) throw error;
      setSelectedFiles(new Set());
      fetchFiles();
    } catch (error) {
      console.error('Error deleting files:', error);
      alert('Failed to delete files');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return 'ri-image-line';
    if (type.startsWith('video/')) return 'ri-video-line';
    if (type.startsWith('audio/')) return 'ri-music-line';
    if (type.includes('pdf')) return 'ri-file-pdf-line';
    return 'ri-file-line';
  };

  const isImage = (type: string): boolean => type.startsWith('image/');

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (name: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedFiles(newSelected);
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/cms"
            className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <i className="ri-arrow-left-line text-xl text-gray-700"></i>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600 mt-1">Upload and manage images, banners, and media files</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedFiles.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold"
            >
              <i className="ri-delete-bin-line mr-2"></i>
              Delete ({selectedFiles.size})
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            multiple
            accept="image/*,video/*,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Uploading...
              </>
            ) : (
              <>
                <i className="ri-upload-2-line mr-2"></i>
                Upload Files
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{filteredFiles.length} files</span>
            <div className="flex border-2 border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100'}`}
              >
                <i className="ri-grid-line"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100'}`}
              >
                <i className="ri-list-unordered"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Files Grid/List */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-image-line text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No files found' : 'No files uploaded'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try a different search term' : 'Upload images and media to use across your store'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors"
            >
              <i className="ri-upload-2-line mr-2"></i>
              Upload Files
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.name}
              className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden group cursor-pointer transition-all ${selectedFiles.has(file.name) ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => toggleSelect(file.name)}
            >
              <div className="aspect-square relative bg-gray-100">
                {isImage(file.type) ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className={`${getFileIcon(file.type)} text-4xl text-gray-400`}></i>
                  </div>
                )}

                {/* Selection indicator */}
                <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedFiles.has(file.name) ? 'bg-emerald-500 border-emerald-500' : 'bg-white/80 border-gray-300'
                  }`}>
                  {selectedFiles.has(file.name) && (
                    <i className="ri-check-line text-white text-sm"></i>
                  )}
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(file.url);
                    }}
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                    title="Copy URL"
                  >
                    <i className={copiedUrl === file.url ? 'ri-check-line text-emerald-600' : 'ri-link'}></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.name);
                    }}
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <i className="ri-delete-bin-line text-red-600"></i>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-12">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(new Set(filteredFiles.map(f => f.name)));
                      } else {
                        setSelectedFiles(new Set());
                      }
                    }}
                    className="w-5 h-5 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">File</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Size</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr key={file.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.name)}
                      onChange={() => toggleSelect(file.name)}
                      className="w-5 h-5 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {isImage(file.type) ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <i className={`${getFileIcon(file.type)} text-xl text-gray-400`}></i>
                        </div>
                      )}
                      <span className="font-medium text-gray-900 truncate max-w-xs">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{file.type}</td>
                  <td className="px-6 py-4 text-gray-600">{formatFileSize(file.size)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => copyUrl(file.url)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                        title="Copy URL"
                      >
                        <i className={copiedUrl === file.url ? 'ri-check-line text-emerald-600' : 'ri-link text-gray-600'}></i>
                      </button>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                        title="Open"
                      >
                        <i className="ri-external-link-line text-gray-600"></i>
                      </a>
                      <button
                        onClick={() => handleDelete(file.name)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
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
      )}

      {/* Usage tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <i className="ri-lightbulb-line text-blue-600 text-xl mt-0.5"></i>
          <div>
            <h4 className="font-semibold text-blue-900">How to use uploaded files</h4>
            <p className="text-sm text-blue-700 mt-1">
              Click the link icon on any file to copy its URL. You can then paste this URL in product images,
              banner settings, or anywhere else that accepts image URLs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

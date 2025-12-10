'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, ArrowLeft, Mail, User, Wallet, Camera, Save, Loader2, CheckCircle, Upload, Link as LinkIcon } from 'lucide-react';
import api from '@/lib/api';

// Helper function to get full image URL
const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  // If it's already a full URL (http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // If it's a relative path, prepend the backend URL
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
  return `${backendUrl}${url}`;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isInitialized, initializeAuth, setUser, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit form state
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-almond-cream via-desert-sand to-tan">
        <Loader2 className="w-8 h-8 animate-spin text-coffee-bean" />
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      let updatedProfilePicture = profilePicture;

      // If user selected a file, upload it first
      if (uploadMethod === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('profilePicture', selectedFile);
        
        const uploadResponse = await api.post('/auth/profile-picture/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        updatedProfilePicture = uploadResponse.data.user.profilePicture;
      }

      // Update profile with username and profile picture
      const response = await api.put('/auth/profile', {
        username,
        profilePicture: uploadMethod === 'url' ? (profilePicture || null) : updatedProfilePicture,
      });
      
      setUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl('');
      
      // Show success animation
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUsername(user.username);
    setProfilePicture(user.profilePicture || '');
    setIsEditing(false);
    setError('');
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadMethod('file');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-almond-cream via-desert-sand to-tan">
      {/* Header */}
      <header className="glass border-b border-faded-copper/20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/notes" className="flex items-center gap-2 group">
            <BookOpen className="w-6 h-6 text-coffee-bean group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xl font-bold gradient-text">Notes App</span>
          </Link>
          <button
            onClick={() => router.push('/notes')}
            className="flex items-center gap-2 text-coffee-bean hover:text-toffee-brown transition-all duration-300 magnetic"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notes
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="glass rounded-2xl shadow-2xl border border-faded-copper/20 overflow-hidden animate-scale-in">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-coffee-bean via-toffee-brown to-faded-copper px-8 py-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-64 h-64 bg-almond-cream rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-desert-sand rounded-full blur-3xl"></div>
            </div>
            <div className="relative">
              <div className="relative inline-block group">
                {user.profilePicture ? (
                  <img
                    src={getImageUrl(user.profilePicture) || user.profilePicture}
                    alt={user.username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-almond-cream shadow-2xl group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-almond-cream to-desert-sand flex items-center justify-center text-coffee-bean font-bold text-3xl shadow-2xl group-hover:scale-110 transition-transform duration-300 ring-4 ring-almond-cream">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                {isEditing && (
                  <div className="absolute -bottom-1 -right-1 bg-almond-cream rounded-full p-2 shadow-lg animate-bounce-in">
                    <Camera className="w-5 h-5 text-coffee-bean" />
                  </div>
                )}
              </div>
              <h1 className="mt-4 text-2xl font-bold text-almond-cream animate-fade-in-up">{user.username}</h1>
              <p className="text-almond-cream/90 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>{user.email}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm animate-shake">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-bounce-in">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Email (read-only) */}
              <div className="animate-fade-in-up">
                <label className="flex items-center gap-2 text-sm font-medium text-coffee-bean mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 bg-desert-sand/30 border border-faded-copper/20 rounded-lg text-coffee-bean/60 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-coffee-bean/50">Email cannot be changed</p>
              </div>

              {/* Username */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <label className="flex items-center gap-2 text-sm font-medium text-coffee-bean mb-2">
                  <User className="w-4 h-4" />
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-faded-copper/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-bean focus:border-coffee-bean text-coffee-bean transition-all duration-300"
                  />
                ) : (
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="w-full px-4 py-3 bg-desert-sand/30 border border-faded-copper/20 rounded-lg text-coffee-bean/60 cursor-not-allowed"
                  />
                )}
              </div>

              {/* Profile Picture Upload/URL */}
              {isEditing && !user.profilePicture?.includes('googleusercontent.com') && (
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <label className="flex items-center gap-2 text-sm font-medium text-coffee-bean mb-2">
                    <Camera className="w-4 h-4" />
                    Profile Picture
                  </label>
                  
                  {/* Upload Method Toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('file')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        uploadMethod === 'file'
                          ? 'bg-coffee-bean text-almond-cream'
                          : 'bg-desert-sand/30 text-coffee-bean hover:bg-desert-sand/50'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('url')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        uploadMethod === 'url'
                          ? 'bg-coffee-bean text-almond-cream'
                          : 'bg-desert-sand/30 text-coffee-bean hover:bg-desert-sand/50'
                      }`}
                    >
                      <LinkIcon className="w-4 h-4" />
                      Use URL
                    </button>
                  </div>

                  {uploadMethod === 'file' ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-3 border-2 border-dashed border-faded-copper/30 rounded-lg hover:border-coffee-bean hover:bg-desert-sand/20 transition-all duration-300 text-coffee-bean flex items-center justify-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        {selectedFile ? selectedFile.name : 'Choose an image file'}
                      </button>
                      {previewUrl && (
                        <div className="mt-3 flex justify-center">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-32 h-32 rounded-full object-cover border-4 border-coffee-bean shadow-lg"
                          />
                        </div>
                      )}
                      <p className="mt-1 text-xs text-coffee-bean/50">Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP</p>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        value={profilePicture}
                        onChange={(e) => setProfilePicture(e.target.value)}
                        placeholder="https://example.com/your-photo.jpg"
                        className="w-full px-4 py-3 border-2 border-faded-copper/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-bean focus:border-coffee-bean text-coffee-bean transition-all duration-300"
                      />
                      <p className="mt-1 text-xs text-coffee-bean/50">Enter a URL to an image</p>
                    </div>
                  )}
                </div>
              )}

              {/* OAuth Profile Picture Notice */}
              {isEditing && user.profilePicture?.includes('googleusercontent.com') && (
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <label className="flex items-center gap-2 text-sm font-medium text-coffee-bean mb-2">
                    <Camera className="w-4 h-4" />
                    Profile Picture
                  </label>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Your profile picture is managed by Google. It will update automatically when you change it in your Google account.
                    </p>
                  </div>
                </div>
              )}

              {/* Wallet Address */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <label className="flex items-center gap-2 text-sm font-medium text-coffee-bean mb-2">
                  <Wallet className="w-4 h-4" />
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={user.walletAddress || 'No wallet connected'}
                  disabled
                  className="w-full px-4 py-3 bg-desert-sand/30 border border-faded-copper/20 rounded-lg text-coffee-bean/60 cursor-not-allowed font-mono text-sm"
                />
                <p className="mt-1 text-xs text-coffee-bean/50">
                  {user.walletAddress 
                    ? 'Wallet is linked to your account' 
                    : 'Connect your wallet from the Notes page'}
                </p>
              </div>

              {/* Provider Info */}
              <div className="pt-4 border-t border-faded-copper/20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <p className="text-sm text-coffee-bean/70">
                  Account type: <span className="font-medium text-coffee-bean capitalize">
                    {user.profilePicture?.includes('googleusercontent.com') ? 'Google' : 'Local'}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-coffee-bean text-almond-cream rounded-lg hover:bg-toffee-brown transition-all duration-300 shadow-lg hover:shadow-xl magnetic ripple-effect disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-3 border-2 border-coffee-bean text-coffee-bean rounded-lg hover:bg-coffee-bean hover:text-almond-cream transition-all duration-300 magnetic disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-4 py-3 bg-coffee-bean text-almond-cream rounded-lg hover:bg-toffee-brown transition-all duration-300 shadow-lg hover:shadow-xl magnetic ripple-effect"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 glass rounded-xl shadow-lg border border-red-200/50 p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-coffee-bean/70 mb-4">
            Once you log out, you'll need to sign in again to access your notes.
          </p>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl magnetic"
          >
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
}

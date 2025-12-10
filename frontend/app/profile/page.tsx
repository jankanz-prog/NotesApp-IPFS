'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft, Mail, User, Wallet, Camera, Loader2, Moon, Sun, LogOut, Sparkles, Shield, Edit2, X, Check, Upload, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, setUser, initializeAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [accountType, setAccountType] = useState('Local');
  const [theme, setTheme] = useState('dark');
  const [previewImage, setPreviewImage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setProfilePicture(user.profilePicture || '');
      setWalletAddress(user.walletAddress || '');
      setAccountType(user.provider === 'google' ? 'Google' : 'Local');
    }
  }, [user, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        setPreviewImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage('');
    setProfilePicture('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Call API to update profile
      const response = await api.put('/auth/profile', {
        username,
        profilePicture: previewImage || profilePicture,
      });
      
      // Update user in store with response from server
      const updatedUser = response.data.user;
      setUser(updatedUser);
      
      if (previewImage) {
        setProfilePicture(previewImage);
      }
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setPreviewImage(''); // Clear preview after save
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPreviewImage('');
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentProfilePic = previewImage || profilePicture;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-xl border-b border-purple-500/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/notes" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <BookOpen className="w-7 h-7 text-purple-400 relative z-10" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                NotesChain
              </span>
            </a>
            <button 
              onClick={() => router.push('/notes')}
              className="flex items-center gap-2 px-5 py-2 text-purple-200 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Notes
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-purple-500/10">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 px-8 py-16 text-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="relative inline-block group">
                {currentProfilePic ? (
                  <img
                    src={currentProfilePic}
                    alt={username}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold bg-purple-500 border-4 border-white shadow-2xl text-white">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center border-4 border-white shadow-lg transition-colors"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                    {currentProfilePic && (
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center border-2 border-white shadow-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              
              <h1 className="mt-6 text-3xl font-bold text-white">{username}</h1>
              <p className="text-white/90 mt-2">{email}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-5 bg-slate-900/50 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  {theme === 'dark' ? (
                    <Moon className="w-6 h-6 text-white" />
                  ) : (
                    <Sun className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-purple-100 text-lg">Theme</p>
                  <p className="text-sm text-purple-300/70">Switch between light and dark mode</p>
                </div>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg shadow-purple-500/25"
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-purple-100 mb-3">
                <Mail className="w-5 h-5 text-purple-400" />
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/10 rounded-lg text-purple-300/60 cursor-not-allowed focus:outline-none"
              />
              <p className="mt-2 text-xs text-purple-300/60 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Email cannot be changed
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-purple-100 mb-3">
                <User className="w-5 h-5 text-purple-400" />
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border-2 border-purple-500 rounded-lg text-purple-100 focus:outline-none focus:border-pink-500 transition-colors placeholder:text-purple-300/40"
                />
              ) : (
                <input
                  type="text"
                  value={username}
                  disabled
                  className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/10 rounded-lg text-purple-300/60 cursor-not-allowed focus:outline-none"
                />
              )}
            </div>

            {/* Profile Picture Upload Info */}
            {isEditing && (
              <div className="p-4 bg-purple-600/10 border border-purple-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <Upload className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-purple-100 mb-1">Profile Picture Guidelines</p>
                    <ul className="text-xs text-purple-300/70 space-y-1">
                      <li>• Supported formats: JPG, PNG, GIF</li>
                      <li>• Maximum file size: 5MB</li>
                      <li>• Recommended: Square images (1:1 ratio)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-purple-100 mb-3">
                <Wallet className="w-5 h-5 text-purple-400" />
                Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress || 'No wallet connected'}
                disabled
                className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/10 rounded-lg font-mono text-sm text-purple-300/60 cursor-not-allowed focus:outline-none"
              />
              <p className="mt-2 text-xs text-purple-300/60">
                {walletAddress ? '✓ Wallet is linked to your account' : 'Connect your wallet from the Notes page'}
              </p>
            </div>

            {/* Provider Info */}
            <div className="pt-6 border-t border-purple-500/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <p className="text-sm text-purple-300/70">
                  Account type: <span className="font-semibold text-purple-100 capitalize">{accountType}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-3 border-2 border-purple-500/30 text-purple-200 rounded-lg hover:bg-purple-500/10 transition-all disabled:opacity-50 font-semibold"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-slate-900/50 backdrop-blur-sm rounded-xl border-2 border-red-500/30 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-900/30 flex items-center justify-center border border-red-500/30">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-red-400">Danger Zone</h3>
          </div>
          <p className="text-sm text-purple-300/60 mb-4">
            Once you log out, you'll need to sign in again to access your notes.
          </p>
          <button 
            onClick={() => {
              logout();
              toast.success('Logged out successfully');
              router.push('/login');
            }}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-semibold shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
}
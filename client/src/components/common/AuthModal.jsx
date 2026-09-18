import React, { useState } from 'react';
import { X, Lock, Mail, User, Disc3, Loader2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useLibraryStore } from '../../stores/libraryStore.js';

export const AuthModal = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal, showToast } = useAppStore();
  const { login, register } = useAuthStore();
  const { fetchLibraryData } = useLibraryStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
        showToast('Welcome back to Linova Music!', 'success');
      } else {
        await register(name, email, password);
        showToast('Account created successfully!', 'success');
      }
      await fetchLibraryData();
      closeAuthModal();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-background-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-linova-primary via-linova-secondary to-linova-cyan flex items-center justify-center shadow-lg shadow-linova-primary/30 mb-3">
            <Disc3 className="w-7 h-7 text-white animate-spin-slow" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {authModalMode === 'login' ? 'Log in to LINOVA' : 'Create an Account'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {authModalMode === 'login'
              ? 'Access your liked songs, custom playlists, and offline downloads.'
              : 'Start your personalized music streaming journey today.'}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ahsan Ullah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-linova-primary transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-linova-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-linova-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-linova-primary hover:bg-linova-primary/90 font-bold text-sm text-white shadow-lg shadow-linova-primary/30 flex items-center justify-center gap-2 mt-2 transition-all hover:scale-[1.02]"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{authModalMode === 'login' ? 'Sign In' : 'Sign Up'}</span>
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-6 text-center text-xs text-gray-400">
          {authModalMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => { setErrorMsg(''); openAuthModal('register'); }}
                className="font-bold text-linova-primary hover:underline ml-1"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => { setErrorMsg(''); openAuthModal('login'); }}
                className="font-bold text-linova-primary hover:underline ml-1"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

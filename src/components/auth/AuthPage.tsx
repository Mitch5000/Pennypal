import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import Logo from '../Logo';
import toast from 'react-hot-toast';

export const AuthPage: React.FC = () => {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('mitch@pennypal.app');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) { toast.error('Please enter your name'); setLoading(false); return; }
        await signup(email, password, name);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      await login('mitch@pennypal.app', 'demo1234');
    } catch {
      // demo mode handles this gracefully
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-copper/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pine/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ochre/[0.07] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-copper rounded-2xl flex items-center justify-center shadow-sm shadow-black/10">
              <Logo size={26} />
            </div>
            <span className="text-3xl font-bold text-ink tracking-tight font-display">PennyPal</span>
          </div>
          <p className="text-muted text-sm">A calm place to watch your money move.</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-line rounded-3xl p-8 shadow-xl shadow-black/5">
          {/* Tabs */}
          <div className="flex bg-fill rounded-2xl p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-card text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-card text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-fill border border-line-strong rounded-xl pl-11 pr-4 py-3.5 text-ink placeholder-faint focus:outline-none focus:border-copper focus:bg-card transition-all text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-fill border border-line-strong rounded-xl pl-11 pr-4 py-3.5 text-ink placeholder-faint focus:outline-none focus:border-copper focus:bg-card transition-all text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-fill border border-line-strong rounded-xl pl-11 pr-12 py-3.5 text-ink placeholder-faint focus:outline-none focus:border-copper focus:bg-card transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-copper hover:bg-copper-deep text-paper font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-black/10 hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-fill-strong" />
            <span className="text-faint text-xs">or</span>
            <div className="flex-1 h-px bg-fill-strong" />
          </div>

          <button
            onClick={handleDemo}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-fill hover:bg-fill-strong border border-line-strong text-body hover:text-ink font-medium py-3.5 rounded-xl transition-all duration-200 text-sm"
          >
            <Sparkles className="w-4 h-4 text-ochre" />
            Try Demo Mode
          </button>
        </div>

        <p className="text-center text-ghost text-xs mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

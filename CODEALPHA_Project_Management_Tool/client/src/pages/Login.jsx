import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-indigo-500/20">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome to TaskPulse</h1>
          <p className="text-sm text-slate-400 mt-1">
            Collaborative SaaS Project Management & Real-Time Tracking
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-semibold text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="alex@codealpha.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Or Try 1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('alex@codealpha.io', 'password123')}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-medium text-indigo-400 transition-colors text-left"
              >
                <div className="font-semibold text-slate-200">Alex Morgan</div>
                <div className="text-[10px] text-slate-400">Project Manager</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('sarah@codealpha.io', 'password123')}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-medium text-emerald-400 transition-colors text-left"
              >
                <div className="font-semibold text-slate-200">Sarah Connor</div>
                <div className="text-[10px] text-slate-400">Developer</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

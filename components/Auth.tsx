
'use client';

import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { registerAction, loginAction } from '../app/actions';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// @google/genai: Made onLogin optional to support standalone login pages in Next.js
interface AuthProps {
  onLogin?: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.VIEWER);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        const result = await registerAction({ username, password, role });
        if (result.success) {
          toast.success('Account registered successfully! Please sign in.');
          setIsRegistering(false);
          setPassword('');
        } else {
          toast.error(result.error || 'Registration failed');
        }
      } else {
        const result = await loginAction(username, password);
        if (result.success && result.user) {
          toast.success(`Welcome back, ${result.user.username}!`);
          // @google/genai: Trigger callback if present (SPA mode), otherwise redirect (Page mode)
          if (onLogin) {
            onLogin(result.user);
          } else {
            router.push('/');
            router.refresh();
          }
        } else {
          toast.error(result.error || 'Login failed');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn relative z-10">
        <div className="bg-slate-900 p-8 text-center border-b border-slate-100">
          <div className="flex flex-col items-center gap-2">
             <div className="flex items-baseline gap-1">
               <span className="text-3xl font-black text-white tracking-tighter uppercase">Akij</span>
               <span className="text-3xl font-black text-emerald-500 tracking-tighter uppercase">Venture</span>
             </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Project Ledger Pro</p>
          </div>
          <h2 className="text-xl font-bold text-white mt-6">
            {isRegistering ? 'Register ID' : 'Sign In'}
          </h2>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-5">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="Official ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {isRegistering && (
              <div className="space-y-1 animate-fadeIn">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.VIEWER)}
                    disabled={loading}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${role === UserRole.VIEWER ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                  >
                    Viewer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.ADMIN)}
                    disabled={loading}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${role === UserRole.ADMIN ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Register Credential' : 'Authorize Login')}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
            }}
            disabled={loading}
            className="w-full text-center text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 hover:text-emerald-600 transition-colors disabled:opacity-50"
          >
            {isRegistering ? 'Back to Login' : "Request New Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;

import React, { useEffect, useState } from 'react';
import { Mail, LockKeyhole, LogIn, UserPlus, LogOut, ShieldCheck } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { loadSiteBranding, type SiteBranding } from './siteBranding';

type AuthScreenProps = {
  session: Session | null;
  onSessionChange: (session: Session | null) => void;
};

export default function AuthScreen({ session, onSessionChange }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [branding, setBranding] = useState<SiteBranding>(loadSiteBranding);

  useEffect(() => {
    if (session?.user?.email) setEmail(session.user.email);
  }, [session]);
  useEffect(() => {
    const syncBranding = () => setBranding(loadSiteBranding());

    window.addEventListener('storage', syncBranding);
    window.addEventListener('field-log:branding-updated', syncBranding);

    return () => {
      window.removeEventListener('storage', syncBranding);
      window.removeEventListener('field-log:branding-updated', syncBranding);
    };
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setMessage('Supabase environment variables configure nahi hain.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        onSessionChange(data.session);
        setMessage('Login successful.');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });
        if (error) throw error;
        onSessionChange(data.session);
        setMessage(
          data.session
            ? 'Account created and logged in.'
            : 'Account created. Email verification may be required.',
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Authentication failed.',
      );
    } finally {
      setBusy(false);
    }
  };

  if (session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{branding.siteName}</h1>
              <p className="text-xs text-slate-500">{session.user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              await supabase?.auth.signOut();
              onSessionChange(null);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm font-semibold hover:bg-slate-700"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          {branding.logoDataUrl ? (
            <img
              src={branding.logoDataUrl}
              alt={branding.siteName + ' logo'}
              className="h-12 w-12 rounded-xl border border-slate-800 bg-slate-950 object-contain p-1"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
              <ShieldCheck size={21} />
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-200">
              {branding.siteName}
            </div>
            <div className="truncate text-xs text-slate-600">
              {branding.tagline}
            </div>
          </div>
        </div>


        <div className="mb-6">
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase font-bold tracking-widest mb-2">
            <ShieldCheck size={15} />
            {branding.siteName} Secure Access
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-serif">
            {branding.siteName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {branding.tagline} • Supabase Auth se protected access.
          </p>
        </div>

        {mode === 'signup' && (
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={event => setFullName(event.target.value)}
              required
              maxLength={100}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-slate-200 outline-none focus:border-amber-500"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-3 text-sm text-slate-200 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <LockKeyhole size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-3 text-sm text-slate-200 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-400">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-4 py-3 text-sm font-bold text-slate-950"
        >
          {busy ? (
            'Please wait...'
          ) : mode === 'login' ? (
            <>
              <LogIn size={16} />
              Sign In
            </>
          ) : (
            <>
              <UserPlus size={16} />
              Create Account
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(previous => previous === 'login' ? 'signup' : 'login');
            setMessage('');
          }}
          className="w-full mt-3 text-xs text-slate-500 hover:text-amber-300"
        >
          {mode === 'login'
            ? 'New student? Create an account'
            : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}

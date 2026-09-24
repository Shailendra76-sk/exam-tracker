import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  EyeOff,
  Key,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { DEFAULT_SITE_BRANDING, loadSiteBranding, resetSiteBranding, saveSiteBranding, type SiteBranding } from '../siteBranding';

export const ADMIN_SETTINGS_KEY = 'field-log:v1:admin-settings';
export const ADMIN_SETTINGS_EVENT = 'field-log:admin-settings-updated';

export type AIProvider =
  | 'OpenAI'
  | 'OpenRouter'
  | 'NVIDIA NIM'
  | 'Free Tier API (Groq/Gemini)';

export type AdminSettings = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  aiProvider: AIProvider;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  updatedAt?: string;
};

type ConnectionState = 'idle' | 'checking' | 'connected' | 'disconnected';

type SyncState = {
  status: 'idle' | 'syncing' | 'success' | 'error';
  message: string;
};

type AdminPanelProps = {
  dailyLogs: unknown[];
  mocks: unknown[];
  syllabus: Record<string, unknown[]>;
};

const DEFAULT_SETTINGS: AdminSettings = {
  supabaseUrl: 'https://kmaesiinprjlxpuphefs.supabase.co',
  supabaseAnonKey: 'sb_publishable_IYN7gQW0Isz2BA_BIhu1cg_MdMECRbB',
  aiProvider: 'OpenAI',
  aiApiKey: '',
  aiModel: 'gpt-4o-mini',
  aiEndpoint: 'https://api.openai.com/v1',
};

const PROVIDER_DEFAULTS: Record<AIProvider, { model: string; endpoint: string }> = {
  OpenAI: { model: 'gpt-4o-mini', endpoint: 'https://api.openai.com/v1' },
  OpenRouter: { model: 'meta-llama/llama-3.1-8b-instruct', endpoint: 'https://openrouter.ai/api/v1' },
  'NVIDIA NIM': { model: 'nvidia/llama-3.1-70b', endpoint: 'https://integrate.api.nvidia.com/v1' },
  'Free Tier API (Groq/Gemini)': { model: 'llama-3.1-8b-instant', endpoint: 'https://api.groq.com/openai/v1' },
};

const isProvider = (value: unknown): value is AIProvider =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(PROVIDER_DEFAULTS, value);

const loadSettings = (): AdminSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = window.localStorage.getItem(ADMIN_SETTINGS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<AdminSettings>) : {};

    const envUrl =
      typeof import.meta.env.VITE_SUPABASE_URL === 'string'
        ? import.meta.env.VITE_SUPABASE_URL.trim()
        : '';

    const envKey =
      typeof import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY === 'string'
        ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.trim()
        : 'sb_publishable_IYN7gQW0Isz2BA_BIhu1cg_MdMECRbB';

    const normalizedProvider =
      isProvider(parsed.aiProvider)
        ? parsed.aiProvider
        : DEFAULT_SETTINGS.aiProvider;

    const normalizedModel =
      normalizedProvider === 'OpenRouter' &&
      (!parsed.aiModel || parsed.aiModel === 'meta-llama/llama-3-8b')
        ? PROVIDER_DEFAULTS.OpenRouter.model
        : typeof parsed.aiModel === 'string' && parsed.aiModel.trim()
          ? parsed.aiModel.trim()
          : DEFAULT_SETTINGS.aiModel;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      aiProvider: normalizedProvider,
      aiModel: normalizedModel,
      aiEndpoint:
        typeof parsed.aiEndpoint === 'string' && parsed.aiEndpoint.trim()
          ? parsed.aiEndpoint.trim()
          : PROVIDER_DEFAULTS[normalizedProvider].endpoint,
      supabaseUrl:
        typeof parsed.supabaseUrl === 'string' && parsed.supabaseUrl.trim()
          ? parsed.supabaseUrl.trim()
          : envUrl || DEFAULT_SETTINGS.supabaseUrl,
      supabaseAnonKey:
        typeof parsed.supabaseAnonKey === 'string' && parsed.supabaseAnonKey.trim()
          ? parsed.supabaseAnonKey.trim()
          : envKey,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const normalizeUrl = (value: string) => value.trim().replace(/\/+$/, '');

const maskKey = (value: string) => {
  if (!value) return 'Not configured';
  if (value.length <= 8) return '••••••••';
  return value.slice(0, 4) + '••••' + value.slice(-4);
};

async function testSupabaseConnection() {
  if (!supabase) {
    throw new Error('Supabase client initialize nahi hua.');
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  if (!session?.user) {
    throw new Error('Supabase connected hai, lekin active login session nahi hai.');
  }
}

async function syncSupabaseTable(
  table: 'dailyLogs' | 'mocks' | 'syllabus',
  rows: unknown[],
) {
  if (!supabase) {
    throw new Error('Supabase client unavailable.');
  }

  if (rows.length === 0) {
    return { table, ok: true, message: 'No local rows to sync.' };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Active Supabase login session nahi mila.');
  }

  const payload = rows.map((row, index) => {
    const source =
      row && typeof row === 'object'
        ? (row as Record<string, unknown>)
        : {};

    const sourceId = source.id;
    const id =
      sourceId !== undefined && sourceId !== null
        ? String(sourceId)
        : table + '-' + index;

    return {
      id,
      user_id: user.id,
      data: row ?? {},
      updated_at: new Date().toISOString(),
    };
  });

  const { error } = await supabase
    .from(table)
    .upsert(payload, { onConflict: 'user_id,id' });

  if (error) {
    throw new Error(table + ': ' + error.message);
  }

  return {
    table,
    ok: true,
    message: rows.length + ' row(s) synced.',
  };
}


export default function AdminPanel({ dailyLogs, mocks, syllabus }: AdminPanelProps) {
  const [settings, setSettings] = useState<AdminSettings>(loadSettings);
  const [saved, setSaved] = useState(false);
  const [branding, setBranding] = useState<SiteBranding>(loadSiteBranding);
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [showKeys, setShowKeys] = useState({ supabase: false, ai: false });
  const [connection, setConnection] = useState<ConnectionState>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [sync, setSync] = useState<SyncState>({ status: 'idle', message: '' });

  useEffect(() => {
    try {
      window.localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent(ADMIN_SETTINGS_EVENT, { detail: settings }));
    } catch (error) {
      console.warn('Field Log: unable to persist admin settings.', error);
    }
  }, [settings]);

  const updateSettings = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setSettings(previous => ({ ...previous, [key]: value, updatedAt: new Date().toISOString() }));
    setSaved(false);
  };

  const changeProvider = (provider: AIProvider) => {
    const defaults = PROVIDER_DEFAULTS[provider];
    setSettings(previous => ({
      ...previous,
      aiProvider: provider,
      aiModel: defaults.model,
      aiEndpoint: defaults.endpoint,
      updatedAt: new Date().toISOString(),
    }));
    setSaved(false);
  };

  const handleBrandingSave = () => {
    try {
      const next: SiteBranding = {
        siteName: branding.siteName.trim().slice(0, 80) || DEFAULT_SITE_BRANDING.siteName,
        tagline: branding.tagline.trim().slice(0, 120) || DEFAULT_SITE_BRANDING.tagline,
        logoDataUrl: branding.logoDataUrl,
        footerText: branding.footerText.trim().slice(0, 160) || DEFAULT_SITE_BRANDING.footerText,
      };

      saveSiteBranding(next);
      setBranding(next);
      setBrandingSaved(true);
    } catch (error) {
      console.error('Branding save failed:', error);
      setBrandingSaved(false);
      alert('Site branding save nahi ho payi.');
    }
  };

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Sirf image logo upload karein.');
      return;
    }

    if (file.size > 1_000_000) {
      alert('Logo maximum 1 MB ka hona chahiye.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBranding(previous => ({
          ...previous,
          logoDataUrl: reader.result as string,
        }));
        setBrandingSaved(false);
      }
    };
    reader.onerror = () => alert('Logo read nahi ho paya.');
    reader.readAsDataURL(file);
  };

  const handleBrandingReset = () => {
    resetSiteBranding();
    setBranding(loadSiteBranding());
    setBrandingSaved(true);
  };

  const handleSave = () => {
    try {
      const next: AdminSettings = {
        ...settings,
        supabaseUrl: normalizeUrl(settings.supabaseUrl),
        supabaseAnonKey: settings.supabaseAnonKey.trim(),
        aiApiKey: settings.aiApiKey.trim(),
        aiModel: settings.aiModel.trim(),
        aiEndpoint: normalizeUrl(settings.aiEndpoint),
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(ADMIN_SETTINGS_EVENT, { detail: next }));
      setSettings(next);
      setSaved(true);
    } catch (error) {
      console.error('Admin settings save failed:', error);
      setSaved(false);
      alert('Admin settings save nahi ho payi.');
    }
  };

  const handleSupabaseTest = async () => {
    setConnection('checking');
    setConnectionMessage('Supabase connection check ho raha hai...');
    try {
      await testSupabaseConnection();
      setConnection('connected');
      setConnectionMessage('Connected Successfully');
    } catch (error) {
      setConnection('disconnected');
      setConnectionMessage(error instanceof Error ? error.message : 'Disconnected / Invalid Keys');
    }
  };

  const handleSync = async () => {
    if (!supabase) {
      setSync({
        status: 'error',
        message: 'Supabase client unavailable.',
      });
      return;
    }

    setSync({
      status: 'syncing',
      message: 'Local data cloud tables me sync ho raha hai...',
    });

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Active Supabase login session nahi mila.');
      }

      const syllabusRows = [
        {
          id: 'master-syllabus',
          data: syllabus,
        },
      ];

      const results = await Promise.all([
        syncSupabaseTable('dailyLogs', dailyLogs),
        syncSupabaseTable('mocks', mocks),
        syncSupabaseTable('syllabus', syllabusRows),
      ]);

      setSync({
        status: 'success',
        message:
          'Cloud sync successful for ' +
          user.email +
          ': ' +
          results.map(result => result.message).join(' • '),
      });
    } catch (error) {
      console.error('Supabase sync failed:', error);
      setSync({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Cloud sync failed.',
      });
    }
  };

  const stats = useMemo(() => ({
    dailyLogs: dailyLogs.length,
    mocks: mocks.length,
    syllabusSubjects: Object.keys(syllabus).length,
  }), [dailyLogs, mocks, syllabus]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase font-bold tracking-widest mb-2">
              <ShieldCheck size={15} /> Administration
              <span className="px-2 py-0.5 rounded-full border border-slate-700 bg-slate-950 text-slate-400 tracking-normal">Settings</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 font-serif">Admin Control Panel</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">Supabase cloud sync aur AI provider routing yahin se configure karo. Settings browser ke local storage me persist hoti hain.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-[10px] uppercase tracking-wider font-bold text-slate-500">{stats.dailyLogs} Daily Logs</span>
            <span className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-[10px] uppercase tracking-wider font-bold text-slate-500">{stats.mocks} Mocks</span>
            <span className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-[10px] uppercase tracking-wider font-bold text-slate-500">{stats.syllabusSubjects} Syllabus Groups</span>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200/80">
          <div className="flex items-start gap-2">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>Browser localStorage production-grade secret vault nahi hai: devtools access wale user stored API keys dekh sakte hain. Production secrets ke liye server-side environment variables ya protected backend secret store use karo.</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><Database size={20} className="text-emerald-400" /></div>
              <div><h3 className="text-base font-bold text-slate-100">🗄️ Database & Cloud Storage</h3><p className="text-xs text-slate-500">Supabase REST connection</p></div>
            </div>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Supabase Project URL</label>
              <input type="url" value={settings.supabaseUrl} onChange={event => updateSettings('supabaseUrl', event.target.value)} placeholder="https://your-project.supabase.co" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Supabase Anon / Public API Key</label>
              <div className="relative">
                <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input type={showKeys.supabase ? 'text' : 'password'} value={settings.supabaseAnonKey} onChange={event => updateSettings('supabaseAnonKey', event.target.value)} placeholder="eyJhbGciOi..." autoComplete="off" className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-11 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500" />
                <button type="button" onClick={() => setShowKeys(previous => ({ ...previous, supabase: !previous.supabase }))} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white" aria-label={showKeys.supabase ? 'Hide Supabase key' : 'Show Supabase key'}>{showKeys.supabase ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div><div className="text-xs uppercase tracking-wider font-bold text-slate-500">Connection Status</div><div className={'mt-1 text-sm font-semibold ' + (connection === 'connected' ? 'text-emerald-400' : connection === 'disconnected' ? 'text-rose-400' : connection === 'checking' ? 'text-amber-400' : 'text-slate-400')}>{connection === 'connected' ? '🟢 Connected Successfully' : connection === 'disconnected' ? '🔴 Disconnected / Invalid Keys' : connection === 'checking' ? '🟡 Checking...' : '⚪ Not Tested'}</div>{connectionMessage && <p className="text-[11px] text-slate-600 mt-1">{connectionMessage}</p>}</div>
                <button type="button" onClick={() => void handleSupabaseTest()} disabled={connection === 'checking'} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/15 disabled:opacity-50"><RefreshCw size={14} className={connection === 'checking' ? 'animate-spin' : ''} /> Test Connection</button>
              </div>
            </div>
            <button type="button" onClick={() => void handleSync()} disabled={sync.status === 'syncing'} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition-colors disabled:opacity-50"><RefreshCw size={17} className={sync.status === 'syncing' ? 'animate-spin' : ''} /> Sync Local Data to Cloud</button>
            {sync.message && <div className={'rounded-xl border px-3 py-2.5 text-xs ' + (sync.status === 'success' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' : sync.status === 'error' ? 'border-rose-500/20 bg-rose-500/5 text-rose-300' : 'border-slate-800 bg-slate-950 text-slate-400')}>{sync.status === 'success' ? <CheckCircle2 size={14} className="inline mr-1.5" /> : sync.status === 'error' ? <AlertCircle size={14} className="inline mr-1.5" /> : null}{sync.message}</div>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><Cpu size={20} className="text-amber-400" /></div>
              <div><h3 className="text-base font-bold text-slate-100">🧠 AI Engine & Multi-Provider Hub</h3><p className="text-xs text-slate-500">Provider-agnostic AI routing</p></div>
            </div>
          </div>
          <div className="p-5 space-y-5">
            <div><label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">AI Provider</label><select value={settings.aiProvider} onChange={event => changeProvider(event.target.value as AIProvider)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-slate-200 outline-none focus:border-amber-500"><option>OpenAI</option><option>OpenRouter</option><option>NVIDIA NIM</option><option>Free Tier API (Groq/Gemini)</option></select></div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">API Secret Key</label>
              <div className="relative"><Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" /><input type={showKeys.ai ? 'text' : 'password'} value={settings.aiApiKey} onChange={event => updateSettings('aiApiKey', event.target.value)} placeholder="Provider API secret" autoComplete="off" className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-11 py-3 text-sm text-slate-200 outline-none focus:border-amber-500" /><button type="button" onClick={() => setShowKeys(previous => ({ ...previous, ai: !previous.ai }))} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white" aria-label={showKeys.ai ? 'Hide AI API key' : 'Show AI API key'}>{showKeys.ai ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
              <p className="text-[10px] text-slate-600 mt-1">Stored: {maskKey(settings.aiApiKey)}</p>
            </div>
            <div><label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Target Model Name</label><input type="text" value={settings.aiModel} onChange={event => updateSettings('aiModel', event.target.value)} placeholder={PROVIDER_DEFAULTS[settings.aiProvider].model} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-slate-200 outline-none focus:border-amber-500" /></div>
            {settings.aiProvider === 'Free Tier API (Groq/Gemini)' ? <div><label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Custom Endpoint URL</label><input type="url" value={settings.aiEndpoint} onChange={event => updateSettings('aiEndpoint', event.target.value)} placeholder="https://api.groq.com/openai/v1" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-slate-200 outline-none focus:border-amber-500" /></div> : <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5"><div className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Provider Endpoint</div><code className="block text-[11px] text-slate-400 mt-1 break-all">{settings.aiEndpoint || PROVIDER_DEFAULTS[settings.aiProvider].endpoint}</code></div>}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-3 text-xs text-slate-500"><div className="flex items-center gap-2"><Cpu size={14} className="text-amber-400" /> AIStudyBot uses these settings dynamically on its next request.</div></div>
            <button type="button" onClick={handleSave} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 transition-colors"><ShieldCheck size={17} /> {saved ? 'Settings Saved & Synced' : 'Save Admin Settings'}</button>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-fuchsia-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                🎨 Site Branding & Identity
              </h3>
              <p className="text-xs text-slate-500">
                Site name, logo, tagline, favicon aur footer Admin se control karo
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                Site Name
              </label>
              <input
                value={branding.siteName}
                onChange={event => {
                  setBranding(previous => ({
                    ...previous,
                    siteName: event.target.value,
                  }));
                  setBrandingSaved(false);
                }}
                maxLength={80}
                placeholder="Field Log"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-slate-200 outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                Tagline
              </label>
              <input
                value={branding.tagline}
                onChange={event => {
                  setBranding(previous => ({
                    ...previous,
                    tagline: event.target.value,
                  }));
                  setBrandingSaved(false);
                }}
                maxLength={120}
                placeholder="Written Exam Tracker"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-slate-200 outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                Footer / Copyright
              </label>
              <input
                value={branding.footerText}
                onChange={event => {
                  setBranding(previous => ({
                    ...previous,
                    footerText: event.target.value,
                  }));
                  setBrandingSaved(false);
                }}
                maxLength={160}
                placeholder="© 2026 Field Log • Government Exam Tracker"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-slate-200 outline-none focus:border-fuchsia-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleBrandingSave}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 px-4 py-3 text-sm font-bold text-white"
              >
                <ShieldCheck size={17} />
                {brandingSaved ? 'Branding Saved' : 'Save Branding'}
              </button>

              <button
                type="button"
                onClick={handleBrandingReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-400 hover:border-amber-500 hover:text-amber-300"
              >
                Reset to Default
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-600">
              Logo / Favicon
            </div>

            <div className="mt-4 flex items-center justify-center">
              {branding.logoDataUrl ? (
                <img
                  src={branding.logoDataUrl}
                  alt={branding.siteName + ' logo preview'}
                  className="h-28 w-28 rounded-2xl border border-slate-700 bg-slate-900 object-contain p-2"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900 text-slate-600">
                  <span className="text-3xl">✨</span>
                </div>
              )}
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 hover:border-fuchsia-500 hover:text-fuchsia-300">
              Upload Logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={event => {
                  const file = event.target.files?.[0];
                  if (file) handleLogoUpload(file);
                  event.currentTarget.value = '';
                }}
              />
            </label>

            {branding.logoDataUrl && (
              <button
                type="button"
                onClick={() => {
                  setBranding(previous => ({
                    ...previous,
                    logoDataUrl: '',
                  }));
                  setBrandingSaved(false);
                }}
                className="mt-2 w-full rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
              >
                Remove Logo
              </button>
            )}

            <p className="mt-3 text-[10px] leading-5 text-slate-600">
              PNG, JPG, WEBP ya SVG • maximum 1 MB. Uploaded logo sidebar aur browser favicon me use hoga.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-500">
        <span className="font-semibold text-slate-300">AI routing:</span> Provider key, model aur endpoint <code className="mx-1 text-slate-300">field-log:v1:admin-settings</code> configuration se AIStudyBot ko milte hain. Server-side environment configuration available rehne par woh fallback ke roop me use hoti rahegi.
      </section>
    </div>
  );
}
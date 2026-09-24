import React, { useEffect, useRef, useState } from 'react';
import { Bot, FileText, Loader2, Mic, MicOff, Paperclip, Send, Sparkles, Volume2, VolumeX } from 'lucide-react';

type StudyMode = 'Ask' | 'Learn' | 'Practice' | 'Test';
type MessageRole = 'user' | 'assistant';

type Message = { id: string; role: MessageRole; text: string; attachmentName?: string; };
type ProviderConfig = { provider: string; apiKey: string; model: string; endpoint: string; };

type AIStudyBotProps = { apiEndpoint?: string; selectedExam?: string; defaultExam?: string; studyContext?: string; };

type RecognitionAlternative = { transcript: string; };
type RecognitionResult = { isFinal: boolean; 0: RecognitionAlternative; };
type RecognitionEvent = Event & { resultIndex: number; results: ArrayLike<RecognitionResult>; };
type RecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionConstructor = new () => RecognitionInstance;
type SpeechCapableWindow = Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor; };

const CHAT_KEY = 'field-log:v1:aiMessages';
const SETTINGS_KEY = 'field-log:v1:admin-settings';
const SETTINGS_EVENT = 'field-log:admin-settings-updated';
const MAX_FILE_BYTES = 2_500_000;

const makeId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2);

const getRecognition = (): RecognitionConstructor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as SpeechCapableWindow;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

const loadMessages = (): Message[] => {
  const fallback: Message[] = [{ id: 'welcome', role: 'assistant', text: 'Namaste bhai! Main tumhara AI Study Coach hoon. Question bhejo.' }];
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(CHAT_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const messages = parsed.filter(item => item && typeof item === 'object').map(item => item as Record<string, unknown>).filter(item => (item.role === 'user' || item.role === 'assistant') && typeof item.text === 'string').slice(-100).map(item => ({ id: typeof item.id === 'string' ? item.id : makeId(), role: item.role as MessageRole, text: String(item.text), attachmentName: typeof item.attachmentName === 'string' ? item.attachmentName : undefined }));
    return messages.length ? messages : fallback;
  } catch {
    return fallback;
  }
};

const loadProviderConfig = (): ProviderConfig | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Record<string, unknown>;
    const provider = typeof value.aiProvider === 'string' ? value.aiProvider : '';
    const apiKey = typeof value.aiApiKey === 'string' ? value.aiApiKey.trim() : '';
    const model = typeof value.aiModel === 'string' ? value.aiModel.trim() : '';
    const endpoint = typeof value.aiEndpoint === 'string' ? value.aiEndpoint.trim() : '';
    if (!provider || !apiKey || !model || !endpoint) return null;
    return { provider, apiKey, model, endpoint };
  } catch {
    return null;
  }
};

const readTrackerContext = (extra?: string) => {
  if (typeof window === 'undefined') return extra || '';
  try {
    const weak = window.localStorage.getItem('field-log:v1:weakTopics');
    const mocks = window.localStorage.getItem('field-log:v1:mocks');
    return JSON.stringify({ weakTopics: weak ? JSON.parse(weak) : [], mocks: mocks ? JSON.parse(mocks) : [], extra: extra || '' }).slice(0, 20000);
  } catch {
    return extra || '';
  }
};

export default function AIStudyBot({ apiEndpoint = '/api/ai/chat', selectedExam = 'All Exams', defaultExam, studyContext }: AIStudyBotProps) {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState('');
  const [exam, setExam] = useState(defaultExam || selectedExam || 'All Exams');
  const [subject, setSubject] = useState('Any Subject');
  const [mode, setMode] = useState<StudyMode>('Ask');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [providerConfig, setProviderConfig] = useState<ProviderConfig | null>(loadProviderConfig);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voiceLanguage, setVoiceLanguage] = useState<'hi-IN' | 'en-IN'>('hi-IN');

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<RecognitionInstance | null>(null);

  useEffect(() => {
    setVoiceSupported(Boolean(getRecognition()));
  }, []);

  useEffect(() => {
    const sync = () => setProviderConfig(loadProviderConfig());
    window.addEventListener(SETTINGS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(SETTINGS_EVENT, sync); window.removeEventListener('storage', sync); };
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-100))); } catch { }
  }, [messages]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [messages, sending]);

  useEffect(() => () => {
    try { recognitionRef.current?.stop(); } catch { }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) return;
    stopSpeaking();
    const clean = text.replace(/[\*_#]/g, '').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = voiceLanguage;
    utterance.rate = 0.95;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    const Recognition = getRecognition();
    if (!Recognition) { setVoiceSupported(false); alert('Is browser me voice input supported nahi hai. Chrome/Edge try karo.'); return; }
    if (listening) { try { recognitionRef.current?.stop(); } catch { } return; }
    const recognition = new Recognition();
    recognition.lang = voiceLanguage;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => { setListening(false); recognitionRef.current = null; };
    recognition.onerror = () => { setListening(false); recognitionRef.current = null; };
    recognition.onresult = event => {
      const parts: string[] = [];
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result?.isFinal && result?.[0]?.transcript) parts.push(result[0].transcript);
      }
      const spoken = parts.join(' ').trim();
      if (spoken) setInput(previous => previous.trim() ? previous.trim() + ' ' + spoken : spoken);
    };
    recognitionRef.current = recognition;
    try { recognition.start(); } catch { setListening(false); recognitionRef.current = null; }
  };

  const pickFile = (file: File) => {
    if (!(file.type.startsWith('image/') || file.type === 'application/pdf')) { alert('Sirf Image ya PDF upload karein.'); return; }
    if (file.size > MAX_FILE_BYTES) { alert('File maximum 2.5 MB ki ho sakti hai.'); return; }
    setAttachment(file);
  };

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('File read failed.'));
    reader.onerror = () => reject(reader.error || new Error('File read failed.'));
    reader.readAsDataURL(file);
  });

  const send = async () => {
    const text = input.trim();
    if ((!text && !attachment) || sending) return;
    const file = attachment;
    const userMessage: Message = { id: makeId(), role: 'user', text: text || 'Is file ko analyze karo.', attachmentName: file?.name };
    setMessages(previous => [...previous.slice(-99), userMessage]);
    setInput('');
    setAttachment(null);
    setSending(true);

    try {
      const history = [...messages, userMessage].slice(-20).map(message => ({ role: message.role, content: message.text }));
      const body: Record<string, unknown> = {
        exam: exam === 'Any Exam' ? selectedExam : exam,
        subject,
        mode,
        studyContext: readTrackerContext(studyContext),
        messages: history,
        providerConfig: providerConfig || undefined,
      };
      if (file) body.attachment = { name: file.name, type: file.type, dataUrl: await fileToDataUrl(file) };

      const response = await fetch(apiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({})) as Record<string, unknown>;
      if (!response.ok || data.success !== true || typeof data.answer !== 'string') throw new Error(typeof data.error === 'string' ? data.error : 'AI service se response nahi mila.');
      const answer = String(data.answer);
      setMessages(previous => [...previous.slice(-99), { id: makeId(), role: 'assistant', text: answer }]);
      if (autoSpeak) requestAnimationFrame(() => speak(answer));
    } catch (error) {
      setMessages(previous => [...previous.slice(-99), { id: makeId(), role: 'assistant', text: error instanceof Error ? error.message : 'AI request failed.' }]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <section className="w-full min-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
      <header className="border-b border-slate-800 bg-slate-950/70 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500"><Bot size={25} className="text-white" /></div>
            <div><div className="flex items-center gap-2"><h1 className="text-xl font-bold text-slate-100">AI Study Coach</h1><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-black uppercase text-emerald-400">Online</span></div><p className="mt-1 text-xs text-slate-500">Government Exam Tracker • AI mentor</p></div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select value={exam} onChange={e => setExam(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500"><option>Any Exam</option><option>SSC CHSL</option><option>SSC MTS</option><option>SSC GD</option><option>Railway Group D</option><option>RRB NTPC (12th Level)</option><option>UP Lekhpal</option><option>AOC JOA</option><option>RPF</option></select>
            <select value={mode} onChange={e => setMode(e.target.value as StudyMode)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500"><option>Ask</option><option>Learn</option><option>Practice</option><option>Test</option></select>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 outline-none focus:border-amber-500"><option>Any Subject</option><option>Maths</option><option>Reasoning</option><option>English</option><option>GK</option><option>Science</option><option>Hindi</option><option>Computer</option></select>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-14rem)] grid-cols-1 lg:grid-cols-[1fr_260px]">
        <div className="flex min-h-0 flex-col">
          <div ref={messagesRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600"><Sparkles size={13} /> Live AI Session</div>
            {messages.map(message => <div key={message.id} className={'flex ' + (message.role === 'user' ? 'justify-end' : 'justify-start')}><div className={'max-w-[88%] rounded-2xl px-4 py-3 ' + (message.role === 'user' ? 'bg-amber-600 text-white' : 'border border-slate-800 bg-slate-950 text-slate-200')}><div className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-70">{message.role === 'assistant' ? 'AI Coach' : 'You'}</div>{message.attachmentName && <div className="mb-2 flex items-center gap-2 text-xs"><FileText size={14} /><span className="truncate">{message.attachmentName}</span></div>}<div className="flex items-end gap-2"><p className="flex-1 whitespace-pre-wrap text-sm leading-6">{message.text}</p>{message.role === 'assistant' && <button type="button" onClick={() => speak(message.text)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-amber-400" title="Read answer aloud"><Volume2 size={15} /></button>}</div></div></div>)}
            {sending && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-500"><Loader2 size={14} className="animate-spin text-amber-400" />Coach soch raha hai…</div></div>}
          </div>

          <div className="border-t border-slate-800 bg-slate-950/50 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button type="button" onClick={toggleListening} disabled={!voiceSupported || sending} className={'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ' + (listening ? 'border-rose-500/40 bg-rose-500/10 text-rose-300' : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-amber-500 hover:text-amber-300')}>{listening ? <MicOff size={14} /> : <Mic size={14} />}{listening ? 'Listening…' : 'Speak'}</button>
              <select value={voiceLanguage} onChange={e => setVoiceLanguage(e.target.value as 'hi-IN' | 'en-IN')} className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-500 outline-none focus:border-amber-500"><option value="hi-IN">Hindi Voice</option><option value="en-IN">English Voice</option></select>
              <button type="button" onClick={() => { if (autoSpeak) stopSpeaking(); setAutoSpeak(v => !v); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 hover:border-amber-500 hover:text-amber-300">{autoSpeak ? <Volume2 size={14} /> : <VolumeX size={14} />}{autoSpeak ? 'Auto Voice ON' : 'Auto Voice OFF'}</button>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={sending} className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 hover:border-amber-500 hover:text-amber-300"><Paperclip size={14} /> Image / PDF</button>
              <span className="ml-auto text-[10px] text-slate-600">{providerConfig ? providerConfig.provider + ' • Configured' : 'Server AI fallback'}</span>
            </div>
            {attachment && <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300"><span className="truncate">{attachment.name}</span><button type="button" onClick={() => setAttachment(null)} className="text-slate-600 hover:text-white">Remove</button></div>}
            <input ref={fileRef} type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) pickFile(file); e.currentTarget.value = ''; }} />
            <div className="flex items-end gap-2"><textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} rows={2} maxLength={8000} disabled={sending} placeholder="Bhai, kya padhna hai? Ya 🎤 Speak dabao…" className="min-h-12 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-amber-500" /><button type="button" onClick={() => void send()} disabled={sending || (!input.trim() && !attachment)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600"><Send size={18} /></button></div>
          </div>
        </div>

        <aside className="hidden border-l border-slate-800 bg-slate-950/30 p-5 lg:block">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Session</div>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><div className="text-[10px] uppercase text-slate-600">Exam</div><div className="mt-1 text-sm font-semibold text-slate-300">{exam}</div></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><div className="text-[10px] uppercase text-slate-600">Mode</div><div className="mt-1 text-sm font-semibold text-slate-300">{mode}</div></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><div className="text-[10px] uppercase text-slate-600">Voice</div><div className="mt-1 text-sm font-semibold text-slate-300">{voiceSupported ? 'Available' : 'Not supported'}</div></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><div className="text-[10px] uppercase text-slate-600">Provider</div><div className="mt-1 break-words text-sm font-semibold text-slate-300">{providerConfig?.provider || 'Server fallback'}</div></div>
          </div>
        </aside>
      </div>
    </section>
  );
}
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  FileText,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  X,
} from 'lucide-react';

type ChatRole = 'user' | 'assistant';
type StudyMode = 'Ask' | 'Learn' | 'Practice' | 'Test';

type Message = {
  id: string;
  role: ChatRole;
  text: string;
  attachment?: {
    name: string;
    type: string;
  };
};

type MockRecord = Record<string, unknown>;

type TrackerSnapshot = {
  weakTopics: Array<{
    subject: string;
    topic: string;
    count: number;
    risk: 'Moderate' | 'Critical';
  }>;
  syllabusPercent: number;
  recentMocks: Array<{
    date: string;
    exam: string;
    test: string;
    score: number;
    accuracy: number;
  }>;
};

type AIProvider =
  | 'OpenAI'
  | 'OpenRouter'
  | 'NVIDIA NIM'
  | 'Free Tier API (Groq/Gemini)';

type ProviderConfig = {
  provider: AIProvider;
  apiKey: string;
  model: string;
  endpoint: string;
};

type AIStudyBotProps = {
  apiEndpoint?: string;
  selectedExam?: string;
  defaultExam?: string;
  studyContext?: string;
};

const ADMIN_SETTINGS_KEY = 'field-log:v1:admin-settings';
const ADMIN_SETTINGS_EVENT = 'field-log:admin-settings-updated';

const CHAT_KEY = 'field-log:v1:aiMessages';
const MAX_FILE_BYTES = 2_500_000;
const MAX_CONTEXT_CHARS = 24_000;

const STATUS_VALUES = new Set([
  'Not Started',
  'Learning',
  'Completed',
  'Revision',
]);

const WELCOME_MESSAGE =
  'Namaste bhai! Main tumhara personal exam coach hoon. Mock, syllabus aur weak topics ke basis par seedha actionable plan dunga.';
const isAIProvider = (value: unknown): value is AIProvider =>
  value === 'OpenAI' ||
  value === 'OpenRouter' ||
  value === 'NVIDIA NIM' ||
  value === 'Free Tier API (Groq/Gemini)';

const loadProviderConfig = (): ProviderConfig | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(ADMIN_SETTINGS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const provider = parsed.aiProvider;
    const apiKey = typeof parsed.aiApiKey === 'string' ? parsed.aiApiKey.trim() : '';
    const model = typeof parsed.aiModel === 'string' ? parsed.aiModel.trim() : '';
    const endpoint = typeof parsed.aiEndpoint === 'string' ? parsed.aiEndpoint.trim() : '';

    if (!isAIProvider(provider) || !apiKey || !model || !endpoint) {
      return null;
    }

    return {
      provider,
      apiKey,
      model,
      endpoint,
    };
  } catch {
    return null;
  }
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2);
};

const readJson = (keys: string[]): unknown => {
  if (typeof window === 'undefined') return null;

  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      return JSON.parse(raw) as unknown;
    } catch {
      // Ignore malformed/legacy storage and try the next compatible key.
    }
  }

  return null;
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeMessages = (value: unknown): Message[] => {
  if (!Array.isArray(value)) {
    return [
      {
        id: 'welcome',
        role: 'assistant',
        text: WELCOME_MESSAGE,
      },
    ];
  }

  const safeMessages = value
    .filter(item => item && typeof item === 'object')
    .map(item => item as Record<string, unknown>)
    .filter(
      item =>
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.text === 'string',
    )
    .slice(-100)
    .map(item => {
      const rawAttachment = item.attachment;

      return {
        id:
          typeof item.id === 'string' && item.id.trim()
            ? item.id
            : createId(),
        role: item.role as ChatRole,
        text: String(item.text),
        attachment:
          rawAttachment &&
          typeof rawAttachment === 'object' &&
          typeof (rawAttachment as Record<string, unknown>).name === 'string'
            ? {
                name: String(
                  (rawAttachment as Record<string, unknown>).name,
                ),
                type: String(
                  (rawAttachment as Record<string, unknown>).type || '',
                ),
              }
            : undefined,
      };
    });

  return safeMessages.length
    ? safeMessages
    : [
        {
          id: 'welcome',
          role: 'assistant',
          text: WELCOME_MESSAGE,
        },
      ];
};

const loadMessages = (): Message[] => {
  const stored = readJson([CHAT_KEY]);
  return normalizeMessages(stored);
};

const buildTrackerSnapshot = (): TrackerSnapshot => {
  const mockHistory = readJson([
    'mockHistory',
    'field-log:v1:mockHistory',
    'field-log:v1:mocks',
    'mocks',
  ]);

  const masterProgress = readJson([
    'field-log:v3:master-syllabus',
    'syllabusProgress',
    'field-log:v2:master-syllabus:maths',
  ]);

  const legacySyllabus = readJson([
    'field-log:v1:syllabus',
    'syllabus',
  ]);

  const manualWeakTopics = readJson([
    'weakTopics',
    'field-log:v1:weakTopics',
  ]);

  const mocks: MockRecord[] = Array.isArray(mockHistory)
    ? (mockHistory.filter(
        item => item && typeof item === 'object',
      ) as MockRecord[])
    : [];

  const counts = new Map<
    string,
    {
      subject: string;
      topic: string;
      count: number;
    }
  >();

  mocks.forEach(mock => {
    const wrongTopics = Array.isArray(mock.wrongTopics)
      ? mock.wrongTopics
      : [];

    wrongTopics.forEach(item => {
      if (!item || typeof item !== 'object') return;

      const topic = item as Record<string, unknown>;
      const subject = String(topic.subject || '').trim();
      const name = String(topic.topic || '').trim();

      if (!subject || !name) return;

      const key =
        subject.toLowerCase() + '::' + name.toLowerCase();
      const current = counts.get(key);

      counts.set(key, {
        subject,
        topic: name,
        count: (current?.count || 0) + 1,
      });
    });
  });

  if (Array.isArray(manualWeakTopics)) {
    manualWeakTopics.forEach(item => {
      if (!item || typeof item !== 'object') return;

      const topic = item as Record<string, unknown>;
      const subject = String(topic.subject || '').trim();
      const name = String(topic.topic || '').trim();
      const count = Math.max(0, toNumber(topic.count));

      if (!subject || !name || count < 2) return;

      const key =
        subject.toLowerCase() + '::' + name.toLowerCase();
      const current = counts.get(key);

      counts.set(key, {
        subject,
        topic: name,
        count: Math.max(count, current?.count || 0),
      });
    });
  }

  const weakTopics = [...counts.values()]
    .filter(item => item.count >= 2)
    .sort(
      (a, b) =>
        b.count - a.count || a.topic.localeCompare(b.topic),
    )
    .slice(0, 3)
    .map(item => ({
      ...item,
      risk:
        item.count >= 3
          ? ('Critical' as const)
          : ('Moderate' as const),
    }));

  let syllabusTotal = 0;
  let syllabusCompleted = 0;

  const masterProgressSource =
    masterProgress &&
    typeof masterProgress === 'object' &&
    !Array.isArray(masterProgress) &&
    'progress' in (masterProgress as Record<string, unknown>)
      ? (masterProgress as { progress?: unknown }).progress
      : masterProgress;

  if (
    masterProgressSource &&
    typeof masterProgressSource === 'object' &&
    !Array.isArray(masterProgressSource)
  ) {
    Object.values(
      masterProgressSource as Record<string, unknown>,
    ).forEach(value => {
      if (!STATUS_VALUES.has(String(value))) return;

      syllabusTotal += 1;

      if (value === 'Completed') {
        syllabusCompleted += 1;
      }
    });
  }

  if (
    !syllabusTotal &&
    legacySyllabus &&
    typeof legacySyllabus === 'object' &&
    !Array.isArray(legacySyllabus)
  ) {
    Object.values(
      legacySyllabus as Record<string, unknown>,
    ).forEach(value => {
      if (!Array.isArray(value)) return;

      value.forEach(item => {
        if (!item || typeof item !== 'object') return;

        syllabusTotal += 1;

        if (
          (item as Record<string, unknown>).completed === true
        ) {
          syllabusCompleted += 1;
        }
      });
    });
  }

  const recentMocks = mocks
    .slice()
    .sort((a, b) =>
      String(b.date || '').localeCompare(String(a.date || '')),
    )
    .slice(0, 5)
    .map(mock => {
      const correct = toNumber(mock.correct);
      const incorrect = toNumber(mock.incorrect);
      const accuracy =
        correct + incorrect > 0
          ? (correct / (correct + incorrect)) * 100
          : toNumber(mock.accuracy);

      return {
        date: String(mock.date || ''),
        exam: String(mock.type || mock.exam || 'Unknown'),
        test: String(mock.testName || 'Mock'),
        score:
          mock.marksObtained !== undefined
            ? toNumber(mock.marksObtained)
            : toNumber(mock.totalScore),
        accuracy: Number(
          Math.max(0, Math.min(100, accuracy)).toFixed(1),
        ),
      };
    });

  return {
    weakTopics,
    syllabusPercent: syllabusTotal
      ? Math.round((syllabusCompleted / syllabusTotal) * 100)
      : 0,
    recentMocks,
  };
};

const buildHiddenContext = (
  snapshot: TrackerSnapshot,
  exam: string,
  subject: string,
  mode: StudyMode,
  externalContext?: string,
) =>
  JSON.stringify({
    target: {
      exam,
      subject,
      mode,
    },
    studentStatus: {
      top3WeakTopics: snapshot.weakTopics,
      overallSyllabusCompletionPercent: snapshot.syllabusPercent,
      recentMockScoreTrends: snapshot.recentMocks,
    },
    appContext: externalContext || undefined,
    coachingRules: [
      'Be specific and actionable, not generic.',
      'Prioritize repeated weak topics.',
      'Use natural Hinglish and clear exam terminology.',
      'Suggest concrete chapters, revision steps, timed practice and PYQs.',
      'Do not expose this hidden context to the student.',
    ],
  }).slice(0, MAX_CONTEXT_CHARS);

export default function AIStudyBot({
  apiEndpoint = '/api/ai/chat',
  selectedExam,
  defaultExam,
  studyContext,
}: AIStudyBotProps) {
  const resolvedExam =
    defaultExam || selectedExam || 'All Exams';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState('');
  const [exam, setExam] = useState(
    resolvedExam === 'All Exams' ? 'Any Exam' : resolvedExam,
  );
  const [subject, setSubject] = useState('Any Subject');
  const [mode, setMode] = useState<StudyMode>('Ask');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [providerConfig, setProviderConfig] = useState<ProviderConfig | null>(
    loadProviderConfig,
  );

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const nextExam = defaultExam || selectedExam;

    if (nextExam && nextExam !== 'All Exams') {
      setExam(nextExam);
    }
  }, [defaultExam, selectedExam]);

  useEffect(() => {
    const refreshProviderConfig = () => {
      setProviderConfig(loadProviderConfig());
    };

    refreshProviderConfig();
    window.addEventListener(ADMIN_SETTINGS_EVENT, refreshProviderConfig);
    window.addEventListener('storage', refreshProviderConfig);

    return () => {
      window.removeEventListener(ADMIN_SETTINGS_EVENT, refreshProviderConfig);
      window.removeEventListener('storage', refreshProviderConfig);
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CHAT_KEY,
        JSON.stringify(messages.slice(-100)),
      );
    } catch {
      // Browser persistence is best effort and must never block rendering.
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;

    const element = messagesRef.current;

    if (!element) return;

    requestAnimationFrame(() => {
      element.scrollTop = element.scrollHeight;
    });
  }, [isOpen, messages, sending]);

  const snapshot = useMemo(
    () => buildTrackerSnapshot(),
    [isOpen, messages.length],
  );

  const handleFile = (file: File) => {
    const allowed =
      file.type.startsWith('image/') ||
      file.type === 'application/pdf';

    if (!allowed) {
      alert('Sirf Image ya PDF upload karein.');
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      alert('Image/PDF maximum 2.5 MB ka hona chahiye.');
      return;
    }

    setAttachment(file);
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('Unable to read attachment.'));
      };

      reader.onerror = () => {
        reject(
          reader.error ||
            new Error('Unable to read attachment.'),
        );
      };

      reader.readAsDataURL(file);
    });

  const send = async () => {
    const text = input.trim();

    if ((!text && !attachment) || sending) return;

    const outgoing = attachment;
    const prompt = text || 'Is file ko analyze karo.';

    const userMessage: Message = {
      id: createId(),
      role: 'user',
      text: prompt,
      attachment: outgoing
        ? {
            name: outgoing.name,
            type: outgoing.type,
          }
        : undefined,
    };

    setMessages(prev => [...prev.slice(-99), userMessage]);
    setInput('');
    setAttachment(null);
    setSending(true);

    try {
      const targetExam =
        exam === 'Any Exam' ? resolvedExam : exam;

      const history = [...messages, userMessage]
        .slice(-20)
        .map(message => ({
          role: message.role,
          content: message.text,
        }));

      const payload = {
        exam: targetExam,
        subject,
        mode,
        studyContext: buildHiddenContext(
          snapshot,
          targetExam,
          subject,
          mode,
          studyContext,
        ),
        messages: history,
        providerConfig: providerConfig
          ? {
              provider: providerConfig.provider,
              apiKey: providerConfig.apiKey,
              model: providerConfig.model,
              endpoint: providerConfig.endpoint,
            }
          : undefined,
        attachment: outgoing
          ? {
              name: outgoing.name,
              type: outgoing.type,
              dataUrl: await fileToDataUrl(outgoing),
            }
          : undefined,
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: unknown = await response
        .json()
        .catch(() => ({}));

      if (
        !response.ok ||
        !data ||
        typeof data !== 'object' ||
        (data as Record<string, unknown>).success !== true ||
        typeof (data as Record<string, unknown>).answer !==
          'string'
      ) {
        const errorMessage =
          data &&
          typeof data === 'object' &&
          typeof (data as Record<string, unknown>).error ===
            'string'
            ? String(
                (data as Record<string, unknown>).error,
              )
            : 'AI service se response nahi mila.';

        throw new Error(errorMessage);
      }

      setMessages(prev => [
        ...prev.slice(-99),
        {
          id: createId(),
          role: 'assistant',
          text: String(
            (data as Record<string, unknown>).answer,
          ),
        },
      ]);
    } catch (error) {
      console.error('AI Study Bot request failed:', error);

      setMessages(prev => [
        ...prev.slice(-99),
        {
          id: createId(),
          role: 'assistant',
          text:
            error instanceof Error
              ? error.message
              : 'AI service se response nahi mila. Thodi der baad try karo.',
        },
      ]);
    } finally {
      setSending(false);

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {isOpen ? (
        <section
          role="dialog"
          aria-modal="false"
          aria-label="AI Study Coach"
          className="bg-slate-900 border border-slate-800 rounded-2xl w-80 sm:w-96 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 h-[min(680px,calc(100vh-6rem))]"
        >
          <header className="shrink-0 border-b border-slate-800 bg-slate-900 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 shadow-lg shadow-amber-600/20">
                  <Bot
                    size={21}
                    className="text-white"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-bold text-slate-100">
                      AI Study Coach
                    </h2>
                    <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-400">
                      Online
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-slate-500">
                    Personal mentor • tracker-aware
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Close AI Study Coach"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="sr-only" htmlFor="ai-study-exam">
                Exam
              </label>
              <select
                id="ai-study-exam"
                value={exam}
                onChange={event =>
                  setExam(event.target.value)
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-[11px] text-slate-300 outline-none transition-colors focus:border-amber-500"
                aria-label="Exam"
              >
                <option>Any Exam</option>
                <option>SSC CHSL</option>
                <option>Railway Group D</option>
                <option>UP Lekhpal</option>
                <option>RRB Group D</option>
                <option>RRB NTPC</option>
                <option>RRB NTPC (12th Level)</option>
                <option>SSC MTS</option>
                <option>SSC GD</option>
                <option>AOC JOA</option>
                <option>RPF</option>
              </select>

              <label className="sr-only" htmlFor="ai-study-mode">
                Study mode
              </label>
              <select
                id="ai-study-mode"
                value={mode}
                onChange={event =>
                  setMode(event.target.value as StudyMode)
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-[11px] text-slate-300 outline-none transition-colors focus:border-amber-500"
                aria-label="Study mode"
              >
                <option>Ask</option>
                <option>Learn</option>
                <option>Practice</option>
                <option>Test</option>
              </select>
            </div>
          </header>

          <div
            ref={messagesRef}
            className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <Sparkles size={12} aria-hidden="true" />
              Live tracker context
            </div>

            {messages.map(message => (
              <div
                key={message.id}
                className={'flex ' + (
                  message.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                )}
              >
                <div
                  className={
                    'max-w-[88%] rounded-2xl px-3.5 py-3 ' +
                    (
                      message.role === 'user'
                        ? 'rounded-br-md bg-amber-600 text-white'
                        : 'rounded-bl-md border border-slate-800 bg-slate-950 text-slate-200'
                    )
                  }
                >
                  {message.role === 'assistant' && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-400">
                      <Bot size={12} aria-hidden="true" />
                      AI Coach
                    </div>
                  )}

                  {message.attachment && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg bg-black/15 px-2.5 py-2">
                      <FileText
                        size={14}
                        aria-hidden="true"
                      />
                      <span className="truncate text-[11px]">
                        {message.attachment.name}
                      </span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-3 text-xs text-slate-500">
                  <Loader2
                    size={14}
                    className="animate-spin text-amber-400"
                  />
                  Coach soch raha hai…
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-800 bg-slate-900 p-3">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {[
                'Aaj kya padhna hai?',
                'Meri top weak topics batao',
                'Mock trend analyze karo',
                '10 MCQ poochho',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setInput(suggestion);
                    requestAnimationFrame(() =>
                      inputRef.current?.focus(),
                    );
                  }}
                  className="whitespace-nowrap rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-[10px] text-slate-400 transition-colors hover:border-amber-500 hover:text-slate-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {snapshot.weakTopics.length > 0 && (
              <div className="mb-2 rounded-xl border border-rose-500/15 bg-rose-500/5 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-300">
                  <AlertTriangle
                    size={12}
                    aria-hidden="true"
                  />
                  Top weak signals
                </div>

                <div className="mt-1 flex flex-wrap gap-1.5">
                  {snapshot.weakTopics.map(item => (
                    <span
                      key={
                        item.subject + '::' + item.topic
                      }
                      className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[9px] text-slate-400"
                      title={
                        item.risk + ' • ' + item.count + 'x'
                      }
                    >
                      {item.topic} • {item.count}x
                    </span>
                  ))}
                </div>
              </div>
            )}

            {attachment && (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Paperclip
                    size={13}
                    className="text-amber-400"
                    aria-hidden="true"
                  />
                  <span className="truncate text-[11px] text-slate-300">
                    {attachment.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-slate-600 transition-colors hover:text-white"
                  aria-label="Remove attachment"
                  title="Remove attachment"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,application/pdf"
              className="hidden"
              onChange={event => {
                const file = event.target.files?.[0];

                if (file) {
                  handleFile(file);
                }

                event.currentTarget.value = '';
              }}
            />

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-400 transition-colors hover:border-amber-500 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Upload image or PDF"
                title="Upload image or PDF"
              >
                <Paperclip
                  size={17}
                  aria-hidden="true"
                />
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={event =>
                  setInput(event.target.value)
                }
                onKeyDown={event => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    void send();
                  }
                }}
                placeholder="Bhai, kya padhna hai?"
                rows={1}
                maxLength={8000}
                disabled={sending}
                className="min-h-10 max-h-28 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-amber-500 disabled:opacity-60"
                aria-label="Message"
              />

              <button
                type="button"
                onClick={() => void send()}
                disabled={
                  (!input.trim() && !attachment) || sending
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
                aria-label="Send message"
                title="Send message"
              >
                {sending ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 text-[9px] text-slate-600">
              <span className="truncate">
                {mode} • {exam} • {subject}
              </span>
              <span className="shrink-0">
                {providerConfig
                  ? providerConfig.provider + ' • Configured'
                  : 'Server AI fallback'}
              </span>
            </div>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/30 bg-gradient-to-tr from-amber-600 to-amber-500 shadow-xl shadow-amber-600/30 transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/40"
          aria-label="Open AI Study Coach"
          title="Open AI Study Coach"
        >
          <Bot
            size={28}
            className="text-white"
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}

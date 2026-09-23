import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PenTool, 
  Target, 
  BookOpen, 
  Calendar, 
  AlertTriangle, 
  ListChecks, 
  TrendingUp, 
  ExternalLink,
  Plus,
  CheckCircle2,
  Circle,
  Menu,
  X,
  Trash2,
  Sparkles,
  ArrowUpRight,
  Play,
  Pause,
  RotateCcw,
  Minimize2,
  Maximize2,
  Timer as TimerIcon,
  Bot,
  Send,
  Paperclip,
  FileText,
  Image as ImageIcon,
  XCircle,
  GraduationCap,
  Download,
  Upload
} from 'lucide-react';

// --- CONSTANTS & COLOR THEMES ---
const SUBJECT_COLORS: Record<string, string> = { 
  'Maths': 'bg-amber-600', 
  'Reasoning': 'bg-emerald-600', 
  'Science': 'bg-sky-600', 
  'English': 'bg-fuchsia-600', 
  'Hindi': 'bg-rose-600', 
  'GK': 'bg-indigo-600',
  'Computer': 'bg-cyan-600'
};

const EXAM_COLORS: Record<string, string> = { 
  'SSC CHSL': 'bg-indigo-600',
  'SSC MTS': 'bg-sky-600', 
  'SSC GD': 'bg-amber-600', 
  'RRB Group D': 'bg-emerald-600',
  'RRB NTPC': 'bg-cyan-600',
  'UP Lekhpal': 'bg-orange-600',
  'AOC JOA': 'bg-purple-600',
  'RPF': 'bg-rose-600'
};

const EXAM_SUBJECTS: Record<string, string[]> = {
  'All Exams': ['Maths', 'Reasoning', 'Science', 'English', 'Hindi', 'GK'],
  'SSC CHSL': ['Maths', 'Reasoning', 'English', 'GK'],
  'SSC MTS': ['Maths', 'Reasoning', 'English', 'GK', 'Science'],
  'SSC GD': ['Maths', 'Reasoning', 'English', 'Hindi', 'GK', 'Science'],
  'RRB Group D': ['Maths', 'Reasoning', 'Science', 'GK'],
  'RRB NTPC': ['Maths', 'Reasoning', 'English', 'GK'],
  'UP Lekhpal': ['Maths', 'Reasoning', 'Hindi', 'GK'],
  'AOC JOA': ['Maths', 'Reasoning', 'English', 'GK', 'Computer'],
  'RPF': ['Maths', 'Reasoning', 'English', 'GK'],
};


const getSubjectsForExam = (exam: string) =>
  EXAM_SUBJECTS[exam] || EXAM_SUBJECTS["All Exams"];
// --- INITIAL STATE DATA ---
const initialDailyLogs = [
  { id: 1, date: '2026-08-28', exam: 'SSC CHSL', subject: 'Maths', topic: 'Percentage & Successive Change', hours: 2.5, notes: 'Formula clarity achieved, practiced 30 PYQs.' },
  { id: 2, date: '2026-08-29', exam: 'RRB Group D', subject: 'Reasoning', topic: 'Syllogism (Only a few cases)', hours: 2.0, notes: 'Need more practice on Possibility statements.' },
];

const initialMocks = [
  { id: 1, date: '2026-08-20', type: 'SSC GD', totalScore: 135, maths: 40, reasoning: 45, lang: 30, ga: 20, correct: 75, incorrect: 25 },
  { id: 2, date: '2026-08-27', type: 'SSC MTS', totalScore: 112, maths: 45, reasoning: 40, lang: 15, ga: 12, correct: 60, incorrect: 10 },
];

const initialPyqLogs = [
  { id: 1, date: '2026-08-25', exam: 'SSC GD', subject: 'Maths', topic: 'Time & Work', sets: 2, shiftYear: 'SSC GD 2024 Shift-1 & 2', notes: 'Repeated questions from Time-Work & Compound Interest.' },
  { id: 2, date: '2026-08-28', exam: 'RRB Group D', subject: 'Reasoning', topic: 'Seating Arrangement', sets: 3, shiftYear: 'RRB Group D 2022 All Shifts', notes: 'High frequency of circular seating arrangements.' }
];

const initialWeakTopics = [
  { id: 1, exam: 'SSC CHSL', subject: 'Maths', topic: 'Compound Interest Installments', count: 6, lastDate: '2026-08-29' },
  { id: 2, exam: 'RRB Group D', subject: 'Reasoning', topic: 'Circular Seating Arrangement', count: 8, lastDate: '2026-08-30' },
  { id: 3, exam: 'SSC CHSL', subject: 'English', topic: 'Preposition Rules & Phrasal Verbs', count: 4, lastDate: '2026-08-27' },
  { id: 4, exam: 'All Exams', subject: 'GK', topic: 'Classical Dances & Folk Arts', count: 5, lastDate: '2026-08-28' },
];

const initialSyllabus: Record<string, Array<{ id: string; name: string; completed: boolean; custom?: boolean }>> = {
  Maths: [
    { id: 'm1', name: 'Number System, Simplification & BODMAS', completed: true },
    { id: 'm2', name: 'LCM & HCF (Word Problems & Fractions)', completed: true },
    { id: 'm3', name: 'Percentage & Successive Changes', completed: false },
    { id: 'm4', name: 'Ratio, Proportion & Partnership', completed: false },
    { id: 'm5', name: 'Average & Age Problems', completed: false },
    { id: 'm6', name: 'Profit, Loss & Discount / Marked Price', completed: false },
    { id: 'm7', name: 'Simple Interest & Compound Interest (Installments)', completed: false },
    { id: 'm8', name: 'Time & Work, Pipes & Cisterns', completed: false },
    { id: 'm9', name: 'Time, Speed, Distance & Trains / Boats', completed: false },
    { id: 'm10', name: 'Mensuration 2D (Area, Perimeter)', completed: false },
    { id: 'm11', name: 'Mensuration 3D (Volume, Surface Area)', completed: false },
    { id: 'm12', name: 'Data Interpretation (DI - Tables & Bar Graphs)', completed: false },
  ],
  Reasoning: [
    { id: 'r1', name: 'Analogy & Number/Word Classification', completed: true },
    { id: 'r2', name: 'Coding-Decoding & Letter Shifts', completed: true },
    { id: 'r3', name: 'Number & Alphabet Series / Missing Terms', completed: true },
    { id: 'r4', name: 'Blood Relations (Coded & Direct)', completed: false },
    { id: 'r5', name: 'Direction Sense & Distance Test', completed: false },
    { id: 'r6', name: 'Syllogism (Standard & "Only a few" Cases)', completed: false },
    { id: 'r7', name: 'Seating Arrangement (Circular & Linear)', completed: false },
    { id: 'r8', name: 'Order & Ranking / Comparison Puzzles', completed: false },
    { id: 'r9', name: 'Mathematical Operations & Sign Interchange', completed: false },
    { id: 'r10', name: 'Venn Diagrams & Set Representation', completed: false },
    { id: 'r11', name: 'Clock & Calendar Calculations', completed: false },
    { id: 'r12', name: 'Non-Verbal (Mirror Image, Paper Fold, Embedded Figures)', completed: false },
  ],
  Science: [
    { id: 's1', name: 'Physics: Units, Motion, Laws of Motion & Gravitation', completed: false },
    { id: 's2', name: 'Physics: Work, Energy, Power & Pressure', completed: false },
    { id: 's3', name: 'Physics: Light (Reflection/Refraction), Sound & Electricity', completed: false },
    { id: 's4', name: 'Chemistry: Matter, Elements, Atoms & Molecules', completed: false },
    { id: 's5', name: 'Chemistry: Acids, Bases, Salts & pH Scale', completed: false },
    { id: 's6', name: 'Chemistry: Periodic Table & Common Metals/Alloys', completed: false },
    { id: 's7', name: 'Biology: Cell Structure, Cell Division & Genetics', completed: false },
    { id: 's8', name: 'Biology: Human Body Systems (Digestive, Circulatory, Nervous)', completed: false },
    { id: 's9', name: 'Biology: Vitamins, Nutrition & Deficiency Diseases', completed: false },
    { id: 's10', name: 'Biology: Plant Physiology & Photosynthesis', completed: false },
    { id: 's11', name: 'Scientific Inventions, Discoveries & Everyday Science', completed: false },
  ],
  English: [
    { id: 'e1', name: 'Parts of Speech & Subject-Verb Agreement', completed: true },
    { id: 'e2', name: 'Tenses & Voice (Active/Passive)', completed: false },
    { id: 'e3', name: 'Direct & Indirect Speech (Narration)', completed: false },
    { id: 'e4', name: 'Prepositions & Phrasal Verbs', completed: false },
    { id: 'e5', name: 'Spotting Errors & Sentence Correction', completed: false },
    { id: 'e6', name: 'Fill in the Blanks (Grammar & Vocab based)', completed: false },
    { id: 'e7', name: 'Synonyms & Antonyms (High-Yield PYQ Vocab)', completed: false },
    { id: 'e8', name: 'Idioms, Phrases & One-Word Substitution', completed: false },
    { id: 'e9', name: 'Spelling Mistakes & Correction Rules', completed: false },
    { id: 'e10', name: 'Cloze Test Practice (Paragraph Gap-Fill)', completed: false },
    { id: 'e11', name: 'Reading Comprehension (Passage Analysis)', completed: false },
  ],
  Hindi: [
    { id: 'h1', name: 'वर्णमाला, वर्तनी शुद्धि एवं विराम चिह्न', completed: false },
    { id: 'h2', name: 'संधि एवं संधि-विच्छेद (स्वर, व्यंजन, विसर्ग)', completed: false },
    { id: 'h3', name: 'समास एवं समास-विग्रह', completed: false },
    { id: 'h4', name: 'उपसर्ग एवं प्रत्यय', completed: false },
    { id: 'h5', name: 'तत्सम एवं तद्भव शब्द', completed: false },
    { id: 'h6', name: 'विलोम एवं पर्यायवाची शब्द', completed: true },
    { id: 'h7', name: 'अनेकार्थी शब्द एवं समरूपी भिन्नार्थक शब्द', completed: false },
    { id: 'h8', name: 'वाक्यांश के लिए एक शब्द (One Word)', completed: false },
    { id: 'h9', name: 'मुहावरे और लोकोक्तियाँ (अर्थ एवं प्रयोग)', completed: false },
    { id: 'h10', name: 'वाक्य रचना, लिंग, वचन, कारक एवं काल शुद्धि', completed: false },
    { id: 'h11', name: 'रिक्त स्थानों की पूर्ति (शब्द चयन आधारित)', completed: false },
    { id: 'h12', name: 'अपठित गद्यांश (Comprehension Passage)', completed: false },
  ],
  GK: [
    { id: 'g1', name: 'History: Ancient India (Indus Valley, Buddhism, Maurya)', completed: false },
    { id: 'g2', name: 'History: Medieval India (Delhi Sultanate & Mughals)', completed: false },
    { id: 'g3', name: 'History: Modern India (1857 Revolt & Freedom Movement)', completed: false },
    { id: 'g4', name: 'Polity: Preamble, Fundamental Rights & DPSP', completed: false },
    { id: 'g5', name: 'Polity: Parliament, President, PM & Important Articles', completed: false },
    { id: 'g6', name: 'Geography: Indian Rivers, Mountains, Passes & Drainage', completed: false },
    { id: 'g7', name: 'Geography: National Parks, Wildlife Sanctuaries & Climate', completed: false },
    { id: 'g8', name: 'Economics: National Income, Inflation & 5-Year Plans / Budget', completed: false },
    { id: 'g9', name: 'Static GK: Classical & Folk Dances, Music & Instruments', completed: false },
    { id: 'g10', name: 'Static GK: Major Indian Festivals & State Fairs', completed: false },
    { id: 'g11', name: 'Static GK: Books, Authors, Awards & First in India', completed: false },
    { id: 'g12', name: 'Sports: Olympic Games, Cups-Trophies & Player Terminology', completed: false },
    { id: 'g13', name: 'Current Affairs: Last 6 Months High-Yield Events & Schemes', completed: false },
  ],
  Computer: [
    { id: 'c1', name: 'Computer Fundamentals & Generations', completed: false },
    { id: 'c2', name: 'Hardware, Input/Output Devices & Memory', completed: false },
    { id: 'c3', name: 'Operating Systems & File Management', completed: false },
    { id: 'c4', name: 'MS Word, Excel & PowerPoint Basics', completed: false },
    { id: 'c5', name: 'Internet, Email, Browsers & Search Basics', completed: false },
    { id: 'c6', name: 'Networking, LAN/WAN & Common Protocols', completed: false },
    { id: 'c7', name: 'Cyber Security, Malware & Safe Online Practices', completed: false },
  ]
};

// --- LOCAL PERSISTENCE ---

type PersistentStateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

const STORAGE_PREFIX = "field-log:v1:";

function usePersistentState<T>(key: string, initialValue: T): [T, PersistentStateSetter<T>] {
  const storageKey = `${STORAGE_PREFIX}${key}`;

  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch (error) {
      console.warn("Field Log: unable to restore saved data.", error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn("Field Log: unable to save data locally.", error);
    }
  }, [storageKey, state]);

  return [state, setState];
}

// --- FLOATING STUDY TIMER COMPONENT ---
const TIMER_STORAGE_KEY = "field-log:v1:studyTimer";

type TimerStorage = {
  time: number;
  isRunning: boolean;
  startedAt: number | null;
};

const FloatingTimer = () => {
  const [timer, setTimer] = useState<TimerStorage>(() => {
    if (typeof window === "undefined") {
      return { time: 0, isRunning: false, startedAt: null };
    }

    try {
      const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as TimerStorage) : null;

      if (
        !saved ||
        !Number.isFinite(saved.time) ||
        typeof saved.isRunning !== "boolean"
      ) {
        return { time: 0, isRunning: false, startedAt: null };
      }

      return {
        time: Math.max(0, Math.floor(saved.time)),
        isRunning: saved.isRunning,
        startedAt:
          saved.isRunning && Number.isFinite(saved.startedAt)
            ? saved.startedAt
            : null
      };
    } catch {
      return { time: 0, isRunning: false, startedAt: null };
    }
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const { time, isRunning, startedAt } = timer;

  useEffect(() => {
    try {
      window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer));
    } catch {
      // Timer persistence is best-effort.
    }
  }, [timer]);

  useEffect(() => {
    if (!isRunning || !startedAt) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);
    setNow(Date.now());

    return () => clearInterval(interval);
  }, [isRunning, startedAt]);

  const elapsed = isRunning && startedAt
    ? Math.max(0, Math.floor((now - startedAt) / 1000))
    : 0;
  const displayTime = time + elapsed;

  const toggleTimer = () => {
    setTimer(prev => {
      if (prev.isRunning && prev.startedAt) {
        const elapsedSinceStart = Math.max(
          0,
          Math.floor((Date.now() - prev.startedAt) / 1000)
        );

        return {
          time: prev.time + elapsedSinceStart,
          isRunning: false,
          startedAt: null
        };
      }

      return {
        ...prev,
        isRunning: true,
        startedAt: Date.now()
      };
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed z-50 transition-all duration-300 shadow-2xl border border-slate-700/50 ${
      isMinimized 
        ? 'bottom-6 right-6 bg-slate-900/90 backdrop-blur-sm rounded-full px-4 py-2.5 flex items-center gap-4 cursor-pointer hover:bg-slate-800'
        : 'bottom-6 right-6 bg-slate-900 rounded-2xl p-5 w-64'
    }`}>
      {isMinimized ? (
        // Minimized View
        <div className="flex items-center gap-3 w-full" onClick={(e) => { if((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).closest('button') === null) setIsMinimized(false); }}>
          <TimerIcon size={16} className={`text-amber-500 ${isRunning ? 'animate-pulse' : ''}`} />
          <span className="font-mono font-bold text-slate-100 text-sm tracking-wider">{formatTime(displayTime)}</span>
          <div className="flex items-center gap-1 border-l border-slate-700 pl-3 ml-1">
            <button onClick={toggleTimer} className="text-slate-400 hover:text-amber-500 p-1">
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={() => setIsMinimized(false)} className="text-slate-400 hover:text-white p-1">
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        // Expanded View
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <TimerIcon size={16} className={`text-amber-500 ${isRunning ? 'animate-pulse' : ''}`} /> Study Timer
            </div>
            <button onClick={() => setIsMinimized(true)} className="text-slate-500 hover:text-white bg-slate-800/50 p-1.5 rounded-md">
              <Minimize2 size={14} />
            </button>
          </div>
          
          <div className="text-4xl font-mono font-bold text-center text-slate-100 mb-6 tracking-wider">
            {formatTime(time)}
          </div>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setIsRunning(!isRunning)} 
              className={`p-3 rounded-full flex-1 flex justify-center items-center gap-2 font-semibold text-sm transition-colors ${
                isRunning 
                  ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20' 
                  : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}
            >
              {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
            </button>
            <button 
              onClick={() => setTimer({ time: 0, isRunning: false, startedAt: null })} 
              className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};


// --- 8. AI STUDY BOT ---
const AIStudyBot = ({ studyContext, defaultExam }: { studyContext: string; defaultExam: string }) => {
  type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    attachment?: { name: string; type: string };
  };

  const [messages, setMessages] = usePersistentState<Message[]>('aiMessages', [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Namaste! Main AI Study Bot hoon. Kisi bhi exam, subject ya topic ke baare mein poochho. Tracker ka syllabus, PYQ, mock aur weak-topic data bhi mere context mein rahega.'
    }
  ]);
  const [input, setInput] = useState('');
  const [exam, setExam] = useState('Any Exam');
  const [subject, setSubject] = useState('Any Subject');
  const [mode, setMode] = useState('Ask');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (defaultExam && defaultExam !== 'All Exams' && exam === 'Any Exam') {
      setExam(defaultExam);
    }
  }, [defaultExam, exam]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Unable to read attachment.'));
      };
      reader.onerror = () => reject(reader.error || new Error('Unable to read attachment.'));
      reader.readAsDataURL(file);
    });

  const sendMessage = async () => {
    const text = input.trim();
    if ((!text && !attachment) || isSending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text || 'Is file ko analyze karo.',
      attachment: attachment ? { name: attachment.name, type: attachment.type } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const outgoingAttachment = attachment;
    setInput('');
    setAttachment(null);
    setIsSending(true);

    try {
      const attachmentPayload = outgoingAttachment
        ? {
            name: outgoingAttachment.name,
            type: outgoingAttachment.type,
            dataUrl: await readFileAsDataUrl(outgoingAttachment)
          }
        : undefined;

      const attachmentNote = outgoingAttachment
        ? '[Attached file: ' + outgoingAttachment.name + '. Analyze the uploaded file directly and explain only what is supported by its contents.]'
        : '';

      const history = [...messages, { role: 'user' as const, content: text || 'Is file ko analyze karo.' }]
        .slice(-20)
        .map(message => ({ role: message.role, content: message.content }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam: exam === 'Any Exam' ? defaultExam : exam,
          subject,
          mode,
          studyContext: studyContext + (attachmentNote ? '\n\n' + attachmentNote : ''),
          messages: history,
          attachment: attachmentPayload
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success || typeof data.answer !== 'string') {
        throw new Error(data?.error || 'AI service request failed.');
      }

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer
      }]);
    } catch (error) {
      console.error('AI Study Bot request failed:', error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'AI service se response nahi mila.'
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const maxBytes = 2_500_000;
    if (!isImage && !isPdf) {
      alert('Sirf Image ya PDF upload karein.');
      return;
    }
    if (file.size > maxBytes) {
      alert('Image/PDF maximum 2.5 MB ka hona chahiye.');
      return;
    }
    setAttachment(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[650px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in duration-500">
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100">AI Study Bot</h2>
              <p className="text-xs text-slate-500">Your Exam Data • AI Learning • Practice • Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Ready
            </div>
            <button
              onClick={() => setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: 'Namaste! Main AI Study Bot hoon. Tracker ka syllabus, PYQ, mock aur weak-topic data bhi mere context mein rahega.'
              }])}
              className="text-xs text-slate-500 hover:text-rose-400"
            >
              Clear Chat
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
          <select value={exam} onChange={e => setExam(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300">
            <option>Any Exam</option><option>RRB Group D</option><option>RRB NTPC</option><option>UP Lekhpal</option><option>SSC MTS</option><option>SSC GD</option><option>SSC CHSL</option><option>NEET</option><option>JEE</option><option>Banking</option><option>UPSC</option><option>Other</option>
          </select>
          <select value={subject} onChange={e => setSubject(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300">
            <option>Any Subject</option><option>Mathematics</option><option>Reasoning</option><option>Science</option><option>GK</option><option>Current Affairs</option><option>English</option><option>Hindi</option><option>Physics</option><option>Chemistry</option><option>Biology</option><option>Computer</option><option>Other</option>
          </select>
          <select value={mode} onChange={e => setMode(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300">
            <option>Ask</option><option>Learn</option><option>Practice</option><option>Test</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-amber-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-200'}`}>
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 text-xs text-amber-400 font-bold"><Bot className="w-4 h-4" /> AI Study Bot</div>
              )}
              {message.attachment && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-black/20">
                  {message.attachment.type.startsWith('image/') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  <span className="text-xs truncate">{message.attachment.name}</span>
                </div>
              )}
              <p className="text-sm leading-6 whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isSending && <div className="text-xs text-slate-500">AI response prepare ho raha hai…</div>}
      </div>

      <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
        {['Aaj mujhe kya padhna chahiye?', 'Meri weak topics batao', 'Mera mock performance analyze karo', '10 MCQ poochho'].map(suggestion => (
          <button key={suggestion} onClick={() => setInput(suggestion)} className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900 text-xs text-slate-400 hover:text-slate-200 hover:border-amber-500">
            {suggestion}
          </button>
        ))}
      </div>

      {attachment && (
        <div className="mx-4 mb-2 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            {attachment.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-sky-400" /> : <FileText className="w-4 h-4 text-rose-400" />}
            <span className="text-xs text-slate-300 truncate">{attachment.name}</span>
            <span className="text-[10px] text-emerald-400">ready • max 2.5 MB</span>
          </div>
          <button onClick={() => setAttachment(null)} className="text-slate-500 hover:text-white"><XCircle className="w-4 h-4" /></button>
        </div>
      )}

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="flex items-end gap-2">
          <input ref={fileInputRef} type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleFile(file); e.currentTarget.value = ''; }} />
          <button onClick={() => fileInputRef.current?.click()} className="w-11 h-11 flex-shrink-0 rounded-xl border border-slate-700 bg-slate-950 text-slate-400 hover:text-amber-400 hover:border-amber-500 flex items-center justify-center" title="Upload Image/PDF">
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={`Ask anything about ${subject}...`} rows={2} className="flex-1 resize-none bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500" />
          <button onClick={sendMessage} disabled={(!input.trim() && !attachment) || isSending} className="w-11 h-11 flex-shrink-0 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-white flex items-center justify-center">
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-600"><GraduationCap className="w-3 h-3" /><span>Study Mode: {mode} • {exam} • {subject}</span></div>
      </div>
    </div>
  );
};

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App State
  const [dailyLogs, setDailyLogs] = usePersistentState("dailyLogs", initialDailyLogs);
  const [mocks, setMocks] = usePersistentState("mocks", initialMocks);
  const [pyqLogs, setPyqLogs] = usePersistentState("pyqLogs", initialPyqLogs);
  const [weakTopics, setWeakTopics] = usePersistentState("weakTopics", initialWeakTopics);
  const [syllabus, setSyllabus] = usePersistentState("syllabus", initialSyllabus);
  const [nextPlan, setNextPlan] = usePersistentState("nextPlan", "Maths CI Installments + Reasoning Circular Puzzle revision + 1 Full Mock Test.");
  const [selectedExam, setSelectedExam] = usePersistentState("selectedExam", "All Exams");
  const [plannerGoalHours, setPlannerGoalHours] = usePersistentState("plannerGoalHours", 5);
  const [plannerDone, setPlannerDone] = usePersistentState<Record<string, boolean>>("plannerDone", {});
  const [dailyFormExam, setDailyFormExam] = useState(selectedExam === "All Exams" ? "SSC CHSL" : selectedExam);
  const [pyqFormExam, setPyqFormExam] = useState(selectedExam === "All Exams" ? "SSC CHSL" : selectedExam);
  const [mockFormExam, setMockFormExam] = useState(selectedExam === "All Exams" ? "SSC CHSL" : selectedExam);
  const [weakFormExam, setWeakFormExam] = useState(selectedExam === "All Exams" ? "SSC CHSL" : selectedExam);

  useEffect(() => {
    const nextExam = selectedExam === "All Exams" ? "SSC CHSL" : selectedExam;
    setDailyFormExam(nextExam);
    setPyqFormExam(nextExam);
    setMockFormExam(nextExam);
    setWeakFormExam(nextExam);
  }, [selectedExam]);

  useEffect(() => {
    const migrationKey = "field-log:v1:exam-migration-1";
    if (window.localStorage.getItem(migrationKey) === "done") return;

    setDailyLogs(prev =>
      prev.map(log => log.exam ? log : { ...log, exam: "All Exams" })
    );
    setPyqLogs(prev =>
      prev.map(log => log.exam ? log : { ...log, exam: "All Exams" })
    );
    setWeakTopics(prev =>
      prev.map(topic => topic.exam ? topic : { ...topic, exam: "All Exams" })
    );

    window.localStorage.setItem(migrationKey, "done");
  }, [setDailyLogs, setPyqLogs, setWeakTopics]);

  const navItems = [
    { id: 'dashboard', num: '01', label: 'Dashboard & Analytics', icon: LayoutDashboard },
    { id: 'daily', num: '02', label: 'Daily Log', icon: PenTool },
    { id: 'mocks', num: '03', label: 'Mock/Test Tracker', icon: Target },
    { id: 'pyq', num: '04', label: 'PYQ Practice Log', icon: BookOpen },
    { id: 'timetable', num: '05', label: 'Interactive Timetable', icon: Calendar },
    { id: 'weak', num: '06', label: 'Weak Topics Tracker', icon: AlertTriangle },
    { id: 'syllabus', num: '07', label: 'Syllabus Checklist', icon: ListChecks },
    { id: 'planner', num: '08', label: 'Smart Study Planner', icon: Target },
    { id: 'ai-bot', num: '09', label: 'AI Study Bot', icon: Bot },
  ];

  const resetAllData = () => {
    if(window.confirm('Pura tracker data delete ho jayega. Pakka reset karna hai?')) {
      setDailyLogs([]);
      setMocks([]);
      setPyqLogs([]);
      setWeakTopics([]);
      setNextPlan("");
      setSelectedExam("All Exams");
      setPlannerGoalHours(5);
      setPlannerDone({});
      window.localStorage.removeItem(TIMER_STORAGE_KEY);
      window.localStorage.removeItem("field-log:v1:aiMessages");
      const resetSyllabus: Record<string, Array<{ id: string; name: string; completed: boolean; custom?: boolean }>> = {};
      Object.entries(initialSyllabus).forEach(([key, topics]) => {
        resetSyllabus[key] = topics.map(t => ({ ...t, completed: false }));
      });
      setSyllabus(resetSyllabus);
    }
  };

  const backupKeys = [
    'dailyLogs',
    'mocks',
    'pyqLogs',
    'weakTopics',
    'syllabus',
    'nextPlan',
    'selectedExam',
    'plannerGoalHours',
    'plannerDone',
    'aiMessages',
    'studyTimer'
  ] as const;

  const exportBackup = () => {
    const payload: Record<string, unknown> = {
      app: 'Field Log',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {}
    };

    const data = payload.data as Record<string, unknown>;
    backupKeys.forEach(key => {
      const storageKey = key === "studyTimer" ? TIMER_STORAGE_KEY : `field-log:v1:${key}`;
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        try {
          data[key] = JSON.parse(raw);
        } catch {
          // Skip corrupt local entries rather than breaking the full backup.
        }
      }
    });

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `field-log-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
    if (file.size > 2_000_000) {
      alert('Backup file 2 MB se chhoti honi chahiye.');
      return;
    }

    try {
      const payload = JSON.parse(await file.text());
      if (
        !payload ||
        payload.app !== 'Field Log' ||
        payload.version !== 1 ||
        !payload.data ||
        typeof payload.data !== 'object'
      ) {
        throw new Error('Invalid backup format');
      }

      const data = payload.data as Record<string, unknown>;
      backupKeys.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const storageKey = key === "studyTimer" ? TIMER_STORAGE_KEY : `field-log:v1:${key}`;
          window.localStorage.setItem(storageKey, JSON.stringify(data[key]));
        }
      });

      alert('Backup restore ho gaya. Tracker reload hoga.');
      window.location.reload();
    } catch (error) {
      console.error('Backup import failed:', error);
      alert('Backup file valid nahi hai.');
    }
  };

  // --- AI STUDY CONTEXT ---
  const aiStudyContext = (() => {
    const exam = selectedExam === 'All Exams' ? 'All Exams' : selectedExam;
    const subjects = EXAM_SUBJECTS[exam] || EXAM_SUBJECTS['All Exams'];
    const syllabusSummary = subjects.map(subject => {
      const topics = syllabus[subject] || [];
      const completed = topics.filter(t => t.completed).length;
      const pending = topics.filter(t => !t.completed).slice(0, 6).map(t => t.name);
      return `${subject}: ${completed}/${topics.length} completed; pending: ${pending.join(', ') || 'none'}`;
    }).join('\n');

    const weakSummary = [...weakTopics]
      .filter(topic => exam === 'All Exams' || !topic.exam || topic.exam === 'All Exams' || topic.exam === exam)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(topic => `${topic.subject} - ${topic.topic} (${topic.count} mistakes)`)
      .join('\n');

    const recentStudy = [...dailyLogs]
      .filter(log => exam === 'All Exams' || !log.exam || log.exam === 'All Exams' || log.exam === exam)
      .slice(0, 8)
      .map(log => `${log.date}: ${log.subject} - ${log.topic} - ${Number(log.hours).toFixed(1)}h`)
      .join('\n');

    const recentMocks = [...mocks]
      .filter(mock => exam === 'All Exams' || mock.type === exam)
      .slice(0, 5)
      .map(mock => `${mock.date}: ${mock.type} score=${mock.totalScore}, correct=${mock.correct}, wrong=${mock.incorrect}`)
      .join('\n');

    const recentPyq = [...pyqLogs]
      .filter(log => exam === 'All Exams' || !log.exam || log.exam === 'All Exams' || log.exam === exam)
      .slice(0, 5)
      .map(log => `${log.date}: ${log.subject} - ${log.topic || 'topic not tagged'} - ${log.sets} sets - ${log.shiftYear}`)
      .join('\n');

    return [
      `Target exam: ${exam}`,
      `Selected subjects: ${subjects.join(', ')}`,
      'Syllabus progress:',
      syllabusSummary || 'No syllabus data.',
      'Weak topics:',
      weakSummary || 'No weak topics logged.',
      'Recent study:',
      recentStudy || 'No study log yet.',
      'Recent mocks:',
      recentMocks || 'No mock yet.',
      'Recent PYQ:',
      recentPyq || 'No PYQ log yet.'
    ].join('\n');
  })();

  // --- 1. DASHBOARD & ANALYTICS ---
  const renderDashboard = () => {
    const matchesExam = (exam?: string) =>
      selectedExam === "All Exams" || !exam || exam === "All Exams" || exam === selectedExam;

    const filteredDailyLogs = dailyLogs.filter(log => matchesExam(log.exam));
    const filteredPyqLogs = pyqLogs.filter(log => matchesExam(log.exam));
    const filteredWeakTopics = weakTopics.filter(topic => matchesExam(topic.exam));
    const filteredMocks = selectedExam === "All Exams"
      ? mocks
      : mocks.filter(mock => mock.type === selectedExam);

    const totalHours = filteredDailyLogs.reduce((acc, log) => acc + Number(log.hours), 0);
    const totalPyqSets = filteredPyqLogs.reduce((acc, log) => acc + Number(log.sets), 0);
    const avgScore = filteredMocks.length ? (filteredMocks.reduce((acc, m) => acc + m.totalScore, 0) / filteredMocks.length).toFixed(1) : '—';

    const subjectHours = filteredDailyLogs.reduce((acc: Record<string, number>, log) => {
      acc[log.subject] = (acc[log.subject] || 0) + Number(log.hours);
      return acc;
    }, {});
    const maxHour = Math.max(1, ...Object.values(subjectHours));

    let totalItems = 0; let completedItems = 0;
    const dashboardSubjects = EXAM_SUBJECTS[selectedExam] || EXAM_SUBJECTS["All Exams"];
    dashboardSubjects.forEach(subject => {
      const topics = syllabus[subject] || [];
      totalItems += topics.length;
      completedItems += topics.filter(t => t.completed).length;
    });
    const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressPercent / 100) * circumference;

    const topWeak = [...filteredWeakTopics].sort((a, b) => b.count - a.count).slice(0, 3);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-xs uppercase font-bold tracking-widest mb-1">
            <Sparkles size={14} /> Comprehensive Control Centre
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 font-serif">Mission Dashboard & Analytics</h2>
          <p className="text-slate-400 text-sm mt-1">Selected exam ke hisaab se study, PYQ, mock aur weak-topic progress dekho.</p>
          <div className="mt-4 max-w-sm">
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Target Exam</label>
            <select
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
            >
              {Object.keys(EXAM_SUBJECTS).map(exam => <option key={exam}>{exam}</option>)}
            </select>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Total Study Hours</h3>
            <div className="text-3xl font-mono font-bold text-amber-500">{totalHours.toFixed(1)}h</div>
            <div className="text-xs text-slate-500 mt-1">All subjects logged</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Mocks Attempted</h3>
            <div className="text-3xl font-mono font-bold text-sky-400">{mocks.length}</div>
            <div className="text-xs text-slate-500 mt-1">Full-length tests</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Avg Mock Score</h3>
            <div className="text-3xl font-mono font-bold text-emerald-400">{avgScore}</div>
            <div className="text-xs text-slate-500 mt-1">Overall performance</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">PYQ Sets Solved</h3>
            <div className="text-3xl font-mono font-bold text-fuchsia-400">{totalPyqSets}</div>
            <div className="text-xs text-slate-500 mt-1">Previous Year Papers</div>
          </div>
        </div>

        {/* 2 Grids: Syllabus Progress Ring & Hours By Subject */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-6 shadow-sm">
            <div className="relative flex-shrink-0 w-28 h-28">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r={radius} className="fill-none stroke-slate-800" strokeWidth="8" />
                <circle cx="60" cy="60" r={radius} className="fill-none stroke-amber-500 transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                <g className="rotate-90 origin-center">
                  <text x="60" y="55" alignmentBaseline="middle" textAnchor="middle" className="fill-slate-100 font-mono text-xl font-bold">{progressPercent}%</text>
                  <text x="60" y="75" alignmentBaseline="middle" textAnchor="middle" className="fill-slate-500 font-sans text-[8px] uppercase tracking-widest">Syllabus</text>
                </g>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-1">Syllabus Readiness</h3>
              <p className="text-sm text-slate-400">{completedItems} of {totalItems} topics mastered.</p>
              <div className="mt-3 text-xs text-amber-500 font-medium cursor-pointer hover:underline" onClick={() => setActiveTab('syllabus')}>
                Check remaining topics →
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Study Hours by Subject</h3>
            <div className="space-y-2.5">
              {['Maths', 'Reasoning', 'Science', 'English', 'Hindi', 'GK'].map(sub => {
                const hrs = subjectHours[sub] || 0;
                const pct = (hrs / maxHour) * 100;
                return (
                  <div key={sub} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-slate-400 font-medium truncate">{sub}</span>
                    <div className="flex-1 bg-slate-800 h-2.5 rounded-sm overflow-hidden border border-slate-700/50">
                      <div className={`h-full rounded-sm ${SUBJECT_COLORS[sub]} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="w-10 text-right text-xs font-mono text-slate-300">{hrs.toFixed(1)}h</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mock Score Trend Line & Critical Alert Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Mock Score Trend Line</h3>
              <TrendingUp size={16} className="text-slate-500" />
            </div>
            {mocks.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-8 text-center">No mock score logged yet.</p>
            ) : (
              <div className="h-40 flex items-end justify-between gap-3 border-b border-l border-slate-700 pb-2 pl-2 relative">
                {[...filteredMocks].reverse().map((mock) => {
                  const heightPercent = Math.min((mock.totalScore / 160) * 100, 100);
                  const color = EXAM_COLORS[mock.type] || 'bg-indigo-500';
                  return (
                    <div key={mock.id} className="w-full flex flex-col items-center group z-10">
                      <div className={`w-full max-w-[28px] ${color} rounded-t-sm opacity-85 hover:opacity-100 transition-all relative`} style={{ height: `${heightPercent}%` }}>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-950 px-1 rounded">{mock.totalScore}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-2 truncate w-14 text-center">{mock.type}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-rose-400 font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle size={14} /> High-Priority Weak Areas
              </h3>
              <div className="space-y-2">
                {topWeak.map(w => (
                  <div key={w.id} className="flex items-center justify-between p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-slate-200">{w.topic}</div>
                      <div className="text-xs text-rose-400">{w.subject} · Last flagged {w.lastDate}</div>
                    </div>
                    <span className="px-2.5 py-1 bg-rose-500 text-white font-mono text-xs font-bold rounded-md">{w.count}x Errors</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setActiveTab('weak')} className="mt-4 text-xs text-slate-400 hover:text-white flex items-center justify-end gap-1">
              Open Weak Topics Module <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* EMBEDDED REFERENCE MATRIX TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm mt-8">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
            <div>
              <h3 className="text-sm uppercase tracking-wider text-amber-500 font-bold">Career Matrix: Matched Exams, 2026 Timelines & Salaries</h3>
              <p className="text-xs text-slate-500 mt-0.5">Verified timeline and pay scale breakdown for competitive targets.</p>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">2026 Cycle</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-3.5 border-b border-slate-800 font-semibold">Exam / Post</th>
                  <th className="p-3.5 border-b border-slate-800 font-semibold">Form Timeline & Status</th>
                  <th className="p-3.5 border-b border-slate-800 font-semibold">Pay Level & Salary Range</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-300 divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-medium text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> RPF Constable
                  </td>
                  <td className="p-3.5 text-slate-400">Upcoming SSC 2026-27 Calendar</td>
                  <td className="p-3.5"><span className="text-amber-400 font-semibold">Level 3</span> (Basic ₹21,700) | Gross: ₹26,000–₹35,000</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-medium text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span> RPF Sub-Inspector (SI)
                  </td>
                  <td className="p-3.5 text-slate-400">Expected late 2026 notification</td>
                  <td className="p-3.5"><span className="text-emerald-400 font-semibold">Level 6</span> (Basic ₹35,400) | Gross: ₹43,000–₹52,000</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-medium text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> RRB NTPC (CEN 07/2025)
                  </td>
                  <td className="p-3.5 text-slate-400">CBT 1 completed, CBT 2 scheduled on <span className="text-slate-200 font-mono font-medium">17 Sep 2026</span></td>
                  <td className="p-3.5"><span className="text-amber-400 font-semibold">Level 2/3</span> (Basic ₹19,900–₹21,700)</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-medium text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> SSC CHSL (2026 Cycle)
                  </td>
                  <td className="p-3.5 text-slate-400">Reg: Aug–Sep 2026 | Tier 1: Oct 2026</td>
                  <td className="p-3.5">Pay Range: ₹25,500–₹81,100 (L4/L5)</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-medium text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span> IB Security Assistant
                  </td>
                  <td className="p-3.5 text-slate-400">2026 cycles wrapping up selections</td>
                  <td className="p-3.5"><span className="text-amber-400 font-semibold">Level 3</span> (Basic ₹21,700) + 20% SSA | Gross: ~₹34,130</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-medium text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> UP Police Constable
                  </td>
                  <td className="p-3.5 text-slate-400">32,679 posts June exams concluded</td>
                  <td className="p-3.5">Gross Monthly: ₹30,000–₹40,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- 2. DAILY LOG COMPONENT ---
  const renderDailyLog = () => {
    const handleAddLog = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const date = String(formData.get('date') || '').trim();
      const selectedLogExam = String(formData.get('exam') || selectedExam).trim();
      const subject = String(formData.get('subject') || '').trim();
      const topic = String(formData.get('topic') || '').trim();
      const hours = Number(formData.get('hours'));
      const notes = String(formData.get('notes') || '').trim();

      if (!date || !subject || !topic || topic.length > 120 || !Number.isFinite(hours) || hours < 0.5 || hours > 16) {
        alert('Please enter valid study details. Topic max 120 characters and hours must be between 0.5 and 16.');
        return;
      }

      const newLog = { id: Date.now(), date, exam: selectedLogExam, subject, topic, hours, notes };
      setDailyLogs([newLog, ...dailyLogs]);
      form.reset();
    };

    const visibleDailyLogs = selectedExam === "All Exams"
      ? dailyLogs
      : dailyLogs.filter(log => !log.exam || log.exam === "All Exams" || log.exam === selectedExam);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-serif">Daily Study Log</h2>
          <p className="text-slate-400 text-sm mt-1">Har subject ke roz ke topic, hours aur self-notes track karo • View: {selectedExam}</p>
        </div>
        
        <form onSubmit={handleAddLog} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Date</label>
              <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Exam</label>
              <select required name="exam" value={dailyFormExam} onChange={e => setDailyFormExam(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500">
                {Object.keys(EXAM_SUBJECTS).filter(e => e !== "All Exams").map(exam => <option key={exam}>{exam}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Subject</label>
              <select required name="subject" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500">
                {getSubjectsForExam(dailyFormExam).map(subject => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Topic Name</label>
              <input required name="topic" type="text" placeholder="e.g. Percentage Basics" maxLength={120} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Hours Studied</label>
              <input required name="hours" type="number" step="0.5" min="0.5" max="16" placeholder="2.5" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Revision Notes & Formulas</label>
            <textarea name="notes" rows={2} placeholder="Key concept, formula, mistakes observed during practice..." className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"></textarea>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm flex items-center gap-2">
              <Plus size={16} /> Log Daily Study
            </button>
          </div>
        </form>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 border-b border-slate-800 font-semibold">Date</th>
                  <th className="p-4 border-b border-slate-800 font-semibold">Exam</th>
                  <th className="p-4 border-b border-slate-800 font-semibold">Subject</th>
                  <th className="p-4 border-b border-slate-800 font-semibold">Topic</th>
                  <th className="p-4 border-b border-slate-800 font-semibold">Hours</th>
                  <th className="p-4 border-b border-slate-800 font-semibold">Notes</th>
                  <th className="p-4 border-b border-slate-800 font-semibold w-10"></th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-300">
                {visibleDailyLogs.map(log => (
                  <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-4 font-mono whitespace-nowrap">{log.date}</td>
                    <td className="p-4"><span className="px-2 py-1 rounded text-[10px] font-bold text-white bg-slate-700">{log.exam || 'All Exams'}</span></td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold text-white ${SUBJECT_COLORS[log.subject]}`}>{log.subject}</span></td>
                    <td className="p-4 font-medium text-slate-200">{log.topic}</td>
                    <td className="p-4 font-mono text-amber-400 font-bold">{log.hours}h</td>
                    <td className="p-4 text-slate-400 text-xs max-w-sm">{log.notes || '—'}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => setDailyLogs(dailyLogs.filter(d => d.id !== log.id))} className="text-slate-600 hover:text-rose-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- 3. MOCK/TEST TRACKER ---
  const renderMockTracker = () => {
    const section3Label = mockFormExam === "RRB Group D"
      ? "Science"
      : mockFormExam === "UP Lekhpal"
        ? "Hindi"
        : "Language";
    const section4Label = "GK / GA";

    const handleAddMock = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const date = String(formData.get('date') || '').trim();
      const type = String(formData.get('type') || '').trim();
      const totalScore = Number(formData.get('total'));
      const maths = Number(formData.get('maths'));
      const reasoning = Number(formData.get('reasoning'));
      const lang = Number(formData.get('lang'));
      const ga = Number(formData.get('ga'));
      const correct = Number(formData.get('correct'));
      const incorrect = Number(formData.get('incorrect'));

    const values = [totalScore, maths, reasoning, lang, ga, correct, incorrect];
      if (!date || !type || values.some(value => !Number.isFinite(value) || value < 0) || correct + incorrect === 0) {
        alert('Please enter valid non-negative mock scores and at least one attempted question.');
        return;
      }

      const newMock = { id: Date.now(), date, type, totalScore, maths, reasoning, lang, ga, correct, incorrect };
      setMocks([newMock, ...mocks]);
      form.reset();
    };

    const visibleMocks = selectedExam === "All Exams"
      ? mocks
      : mocks.filter(mock => mock.type === selectedExam);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-serif">Mock Test Performance Tracker</h2>
          <p className="text-slate-400 text-sm mt-1">Sectional score, overall score aur automatic accuracy percentage log karein • View: {selectedExam}</p>
        </div>

        <form onSubmit={handleAddMock} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Exam Type</label>
              <select required name="type" value={mockFormExam} onChange={e => setMockFormExam(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none">
                <option value="SSC GD">SSC GD</option>
                <option value="SSC MTS">SSC MTS</option>
                <option value="RRB Group D">RRB Group D</option>
                <option value="RRB NTPC">RRB NTPC</option>
                <option value="UP Lekhpal">UP Lekhpal</option>
                <option value="AOC JOA">AOC JOA</option>
                <option value="SSC CHSL">SSC CHSL</option>
                <option value="RPF">RPF</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Mock Date</label>
              <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Total Score</label>
              <input required name="total" type="number" step="0.5" min="0" placeholder="e.g. 135" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none" />
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Maths</label>
              <input required name="maths" type="number" min="0" placeholder="40" className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Reasoning</label>
              <input required name="reasoning" type="number" min="0" placeholder="45" className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">{section3Label}</label>
              <input required name="lang" type="number" min="0" placeholder="30" className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">{section4Label}</label>
              <input required name="ga" type="number" min="0" placeholder="20" className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-emerald-400 mb-1">Correct Qs</label>
              <input required name="correct" type="number" min="0" placeholder="75" className="w-full bg-slate-950 border border-emerald-900/60 rounded px-2.5 py-1.5 text-sm text-emerald-400" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-rose-400 mb-1">Incorrect Qs</label>
              <input required name="incorrect" type="number" min="0" placeholder="15" className="w-full bg-slate-950 border border-rose-900/60 rounded px-2.5 py-1.5 text-sm text-rose-400" />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button type="submit" className="bg-slate-100 hover:bg-white text-slate-950 font-bold py-2 px-6 rounded-lg transition-colors text-sm">
              Save Mock Result
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {visibleMocks.map(mock => {
            const accuracy = mock.correct + mock.incorrect > 0 
              ? ((mock.correct / (mock.correct + mock.incorrect)) * 100).toFixed(1) 
              : '0.0';
            const badgeColor = EXAM_COLORS[mock.type] || 'bg-slate-600';

            return (
              <div key={mock.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold text-white ${badgeColor}`}>{mock.type}</span>
                  <div>
                    <div className="text-2xl font-mono font-bold text-slate-100">{mock.totalScore} <span className="text-xs text-slate-500 font-sans">Score</span></div>
                    <div className="text-xs text-slate-500">{mock.date}</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                  <div><div className="text-[10px] text-slate-500">MATHS</div><div className="font-mono font-semibold text-slate-300">{mock.maths}</div></div>
                  <div><div className="text-[10px] text-slate-500">REAS</div><div className="font-mono font-semibold text-slate-300">{mock.reasoning}</div></div>
                  <div><div className="text-[10px] text-slate-500">LANG</div><div className="font-mono font-semibold text-slate-300">{mock.lang}</div></div>
                  <div><div className="text-[10px] text-slate-500">GA</div><div className="font-mono font-semibold text-slate-300">{mock.ga}</div></div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4">
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold rounded">
                      {accuracy}% Accuracy
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">{mock.correct} Correct / {mock.incorrect} Wrong</div>
                  </div>
                  <button onClick={() => setMocks(mocks.filter(m => m.id !== mock.id))} className="text-slate-600 hover:text-rose-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- 4. PYQ PRACTICE LOG ---
  const renderPYQ = () => {
    const handleAddPyq = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const date = String(formData.get('date') || '').trim();
      const subject = String(formData.get('subject') || '').trim();
      const sets = Number(formData.get('sets'));
      const shiftYear = String(formData.get('shiftYear') || '').trim();
      const notes = String(formData.get('notes') || '').trim();

      if (!date || !subject || !shiftYear || shiftYear.length > 80 || !Number.isInteger(sets) || sets < 1 || sets > 1000) {
        alert('Please enter valid PYQ details. Sets must be a whole number between 1 and 1000.');
        return;
      }

      const exam = String(formData.get('exam') || (selectedExam === "All Exams" ? "SSC CHSL" : selectedExam)).trim();
      const topic = String(formData.get('topic') || '').trim();

      if (!exam || !topic || topic.length > 120) {
        alert('Please select an exam and enter a valid topic (maximum 120 characters).');
        return;
      }

      const newPyq = { id: Date.now(), date, exam, subject, topic, sets, shiftYear, notes };
      setPyqLogs([newPyq, ...pyqLogs]);
      form.reset();
    };

    const visiblePyqLogs = selectedExam === "All Exams"
      ? pyqLogs
      : pyqLogs.filter(log => !log.exam || log.exam === "All Exams" || log.exam === selectedExam);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-serif">Previous Year Question (PYQ) Practice Log</h2>
          <p className="text-slate-400 text-sm mt-1">Shift-wise past papers, total sets solved aur paper patterns ka record • View: {selectedExam}</p>
        </div>

        {/* 4 Direct Practice Portals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'SSC GD PYPs', desc: 'Previous 3 Years Shifts', link: 'https://testbook.com/ssc-gd-constable-previous-year-papers' },
            { name: 'SSC MTS PYPs', desc: 'All Shifts Solved Sets', link: 'https://testbook.com/ssc-mts-previous-year-papers' },
            { name: 'RRB Group D PYPs', desc: 'Official Railway CBT Sets', link: 'https://testbook.com/rrb-group-d-previous-year-papers' },
            { name: 'Oliveboard Railway PYP', desc: 'Direct Practice Portal', link: 'https://www.oliveboard.in/railway-exams/' }
          ].map((portal, i) => (
            <a key={i} href={portal.link} target="_blank" rel="noreferrer" className="bg-slate-900 border border-slate-800 hover:border-amber-500/60 p-4 rounded-xl transition-all group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-slate-200 font-semibold group-hover:text-amber-500 text-sm">
                  {portal.name}
                  <ExternalLink size={14} className="text-slate-600 group-hover:text-amber-500" />
                </div>
                <p className="text-xs text-slate-500 mt-1">{portal.desc}</p>
              </div>
              <span className="text-[11px] text-amber-500/80 font-medium mt-3">Start Solved Set →</span>
            </a>
          ))}
        </div>

        <form onSubmit={handleAddPyq} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Date</label>
              <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Exam</label>
              <select required name="exam" value={pyqFormExam} onChange={e => setPyqFormExam(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none">
                {Object.keys(EXAM_SUBJECTS).filter(e => e !== "All Exams").map(exam => <option key={exam}>{exam}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Subject</label>
              <select required name="subject" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none">
                {getSubjectsForExam(pyqFormExam).map(subject => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Sets Solved</label>
              <input required name="sets" type="number" min="1" placeholder="2" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Topic</label>
              <input required name="topic" type="text" maxLength={120} placeholder="e.g. Percentage / Time & Work" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Shift / Year</label>
              <input required name="shiftYear" type="text" placeholder="e.g. SSC GD 2024 Shift-1" maxLength={80} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Recurring Pattern / Notes</label>
            <input name="notes" type="text" placeholder="Observed repeated questions or trick questions..." className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none" />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm">
              Log PYQ Set
            </button>
          </div>
        </form>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 border-b border-slate-800 font-semibold">Date</th>
                  <th className="p-4 border-b border-slate-800 font-semibold">Exam</th>
                  <th className="p-4 border-b border-slate-800 font-semibold">Subject</th>
                  <th className="p-4 border-b border-slate-800 font-semibold">Topic</th>
                  <th className="p-4 border-b border-slate-800 font-semibold">Sets</th>
                  <th className="p-4 border-b border-slate-800 font-semibold">Shift / Year</th>
                  <th className="p-4 border-b border-slate-800 font-semibold">Pattern Notes</th>
                  <th className="p-4 border-b border-slate-800 font-semibold w-10"></th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-300">
                {visiblePyqLogs.map(log => (
                  <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-4 font-mono whitespace-nowrap">{log.date}</td>
                    <td className="p-4"><span className="px-2 py-1 rounded text-[10px] font-bold text-white bg-slate-700">{log.exam || 'All Exams'}</span></td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold text-white ${SUBJECT_COLORS[log.subject]}`}>{log.subject}</span></td>
                    <td className="p-4 font-medium text-slate-200">{log.topic || '—'}</td>
                    <td className="p-4 font-mono font-bold text-fuchsia-400">{log.sets}</td>
                    <td className="p-4 font-medium text-slate-200">{log.shiftYear}</td>
                    <td className="p-4 text-slate-400 text-xs">{log.notes || '—'}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => setPyqLogs(pyqLogs.filter(p => p.id !== log.id))} className="text-slate-600 hover:text-rose-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- 5. SMART STUDY PLANNER ---
  const renderSmartPlanner = () => {
    const today = new Date().toISOString().split('T')[0];
    const exam = selectedExam === "All Exams" ? "SSC CHSL" : selectedExam;
    const subjects = EXAM_SUBJECTS[selectedExam] || EXAM_SUBJECTS["All Exams"];

    const filteredWeak = weakTopics
      .filter(w => selectedExam === "All Exams" || !w.exam || w.exam === "All Exams" || w.exam === exam)
      .sort((a, b) => b.count - a.count);

    const incompleteTasks = subjects.flatMap(subject =>
      (syllabus[subject] || [])
        .filter(topic => !topic.completed)
        .slice(0, 2)
        .map(topic => ({
          id: `syllabus-${subject}-${topic.id}`,
          type: "Syllabus",
          title: topic.name,
          subtitle: `${subject} • Concept + examples`,
          priority: 2
        }))
    );

    const revisionCandidates = dailyLogs
      .filter(log => {
        if (selectedExam !== "All Exams" && log.exam && log.exam !== "All Exams" && log.exam !== exam) return false;
        const age = (Date.now() - new Date(log.date).getTime()) / 86400000;
        return age >= 2;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter((log, index, arr) => arr.findIndex(item => item.topic.toLowerCase() === log.topic.toLowerCase()) === index)
      .slice(0, 3)
      .map(log => ({
        id: `revision-${log.id}`,
        type: "Revision",
        title: log.topic,
        subtitle: `${log.subject} • Last studied ${log.date}`,
        priority: 3
      }));

    const weakTasks = filteredWeak.slice(0, 3).map(topic => ({
      id: `weak-${topic.id}`,
      type: "Weak Topic",
      title: topic.topic,
      subtitle: `${topic.subject} • ${topic.count} mistakes`,
      priority: 1
    }));

    const latestMock = mocks
      .filter(mock => selectedExam === "All Exams" || mock.type === exam)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const mockAge = latestMock ? (Date.now() - new Date(latestMock.date).getTime()) / 86400000 : Infinity;
    const mockTask = mockAge >= 7 ? [{
      id: `mock-${exam}`,
      type: "Mock",
      title: "1 Full Mock Test",
      subtitle: latestMock ? `No full mock in ${Math.floor(mockAge)} days` : "No mock logged yet",
      priority: 2
    }] : [];

    const tasks = [...weakTasks, ...revisionCandidates, ...incompleteTasks, ...mockTask]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 8);

    const activeTasks = tasks.map(task => ({
      ...task,
      key: `${today}:${exam}:${task.id}`
    }));
    const completedTasks = activeTasks.filter(task => plannerDone[task.key]).length;
    const goalHours = Math.max(1, Number(plannerGoalHours) || 5);
    const todayHours = dailyLogs
      .filter(log => log.date === today && (selectedExam === "All Exams" || !log.exam || log.exam === "All Exams" || log.exam === exam))
      .reduce((sum, log) => sum + Number(log.hours), 0);
    const hourPercent = Math.min(100, Math.round((todayHours / goalHours) * 100));

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-xs uppercase font-bold tracking-widest mb-1">
            <Sparkles size={14} /> Smart Daily Plan
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 font-serif">Today’s Study Planner</h2>
          <p className="text-slate-400 text-sm mt-1">Weak topics, revision due aur incomplete syllabus ko ek daily priority list me lao.</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-end">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Target Exam</label>
              <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500">
                {Object.keys(EXAM_SUBJECTS).map(item => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Daily Study Goal (Hours)</label>
              <input
                type="number"
                min="1"
                max="16"
                step="0.5"
                value={plannerGoalHours}
                onChange={e => setPlannerGoalHours(Math.min(16, Math.max(1, Number(e.target.value) || 1)))}
                className="w-full sm:w-40 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Tasks Done</div>
            <div className="text-3xl font-mono font-bold text-emerald-400 mt-1">{completedTasks}/{activeTasks.length}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Study Hours</div>
            <div className="text-3xl font-mono font-bold text-amber-500 mt-1">{todayHours.toFixed(1)}h</div>
            <div className="text-xs text-slate-500 mt-1">Goal {goalHours.toFixed(1)}h • {hourPercent}%</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Next Focus</div>
            <div className="text-base font-semibold text-slate-200 mt-2 truncate">{activeTasks[0]?.title || "All clear"}</div>
            <div className="text-xs text-slate-500 mt-1">{activeTasks[0]?.type || "No pending priority"}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm uppercase tracking-wider text-slate-300 font-bold">Priority Queue</h3>
              <p className="text-xs text-slate-500 mt-1">1 = highest priority • checkbox tick karte jao</p>
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-xs text-amber-500 hover:text-amber-400"
            >
              Dashboard →
            </button>
          </div>

          {activeTasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">Aaj ke liye koi urgent task nahi mila. Daily log ya syllabus me next task add karo.</div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {activeTasks.map((task, index) => {
                const done = Boolean(plannerDone[task.key]);
                return (
                  <button
                    key={task.key}
                    onClick={() => setPlannerDone({ ...plannerDone, [task.key]: !done })}
                    className="w-full text-left p-4 hover:bg-slate-800/40 transition-colors flex items-start gap-3"
                  >
                    {done ? <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 flex-shrink-0" /> : <Circle size={20} className="text-slate-600 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className={`flex flex-wrap items-center gap-2 ${done ? 'opacity-50' : ''}`}>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">#{index + 1}</span>
                        <span className="text-[10px] font-bold uppercase text-slate-500">{task.type}</span>
                        <span className={`text-sm font-semibold ${done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task.title}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{task.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <h3 className="text-sm uppercase tracking-wider text-slate-300 font-bold mb-3">How the plan is decided</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800"><span className="text-rose-400 font-bold">1.</span> Weak Topic → repeat mistakes first</div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800"><span className="text-amber-400 font-bold">2.</span> Revision → old topics due for review</div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800"><span className="text-sky-400 font-bold">3.</span> Syllabus → incomplete chapters next</div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800"><span className="text-emerald-400 font-bold">4.</span> Mock → add a full test when due</div>
          </div>
        </div>
      </div>
    );
  };

  // --- 5. INTERACTIVE TIMETABLE ---
  const renderTimetable = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-serif">Master Daily Schedule & Resources</h2>
          <p className="text-slate-400 text-sm mt-1">Structured 5-block routine with direct verified hyperlinks for lectures & practice.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            {
              block: 'Block 1 (2 Hours)',
              slot: 'Maths Study Slot',
              desc: 'Concept building, formula sheet revision, 25 high-yield problems.',
              resources: [
                { label: 'Rankers Gurukul Maths Playlist', url: 'https://www.youtube.com/@RankersGurukul' },
                { label: 'Rojgar with Ankit (RWA) Maths', url: 'https://www.youtube.com/@RojgarwithAnkit' }
              ]
            },
            {
              block: 'Block 2 (1.5 Hours)',
              slot: 'English / Hindi Grammar Slot',
              desc: 'Grammar rules, Idioms/Synonyms (English) ya Sandhi/Samas (Hindi).',
              resources: [
                { label: 'RWA Free Hindi/English Classes', url: 'https://www.youtube.com/@RojgarwithAnkit' }
              ]
            },
            {
              block: 'Block 3 (1.5 Hours)',
              slot: 'Reasoning Quiz & Puzzles',
              desc: 'Fast sectional quizzes, circular/linear seating arrangements and syllogism.',
              resources: [
                { label: 'Testbook Reasoning Free Quizzes', url: 'https://testbook.com/reasoning-questions' }
              ]
            },
            {
              block: 'Block 4 (1 Hour)',
              slot: 'General Science & GK NCERT',
              desc: 'NCERT Class 9-10 science notes, Lucent static GK, Polity articles.',
              resources: [
                { label: 'Oliveboard Static GK Series', url: 'https://www.oliveboard.in' }
              ]
            },
            {
              block: 'Block 5 (45 Min)',
              slot: 'Typing Practice & Current Affairs Tracker',
              desc: 'Speed typing practice (for CHSL/NTPC/JOA) + Daily morning current affairs capsule.',
              resources: [
                { label: 'TypingMaster Live Online', url: 'https://www.typing.com' },
                { label: 'NextGen Daily CA Tracker', url: 'https://nextgenacademy1.lovable.app' }
              ]
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-amber-600/20 text-amber-500 font-mono text-xs font-bold rounded">{item.block}</span>
                  <h3 className="text-base font-semibold text-slate-100">{item.slot}</h3>
                </div>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.resources.map((res, rIdx) => (
                  <a key={rIdx} href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs bg-slate-950 border border-slate-700 hover:border-amber-500 text-slate-300 hover:text-white px-3 py-1.5 rounded-md transition-colors">
                    {res.label} <ExternalLink size={12} className="text-amber-500" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- 6. WEAK TOPICS TRACKER ---
  const renderWeakTopics = () => {
    const sortedTopics = [...visibleWeakTopics].sort((a, b) => b.count - a.count);

    const handleIncrement = (id: number) => {
      setWeakTopics(weakTopics.map(w => w.id === id ? { ...w, count: w.count + 1, lastDate: new Date().toISOString().split('T')[0] } : w));
    };

    const handleAddWeak = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const subject = formData.get('subject') as string;
      const topic = (formData.get('topic') as string).trim();
      const today = new Date().toISOString().split('T')[0];

      if (!subject || !topic || topic.length > 120) {
        alert('Please enter a valid weak topic (maximum 120 characters).');
        return;
      }

      const newEntryExam = String(formData.get('exam') || (selectedExam === "All Exams" ? "SSC CHSL" : selectedExam)).trim();
      if (!newEntryExam) {
        alert('Please select an exam.');
        return;
      }

      const existing = weakTopics.find(w => w.exam === newEntryExam && w.subject === subject && w.topic.toLowerCase() === topic.toLowerCase());
      if (existing) {
        setWeakTopics(weakTopics.map(w => w.id === existing.id ? { ...w, count: w.count + 1, lastDate: today } : w));
      } else {
        setWeakTopics([...weakTopics, { id: Date.now(), exam: newEntryExam, subject, topic, count: 1, lastDate: today }]);
      }
      form.reset();
    };

    const visibleWeakTopics = selectedExam === "All Exams"
      ? weakTopics
      : weakTopics.filter(topic => !topic.exam || topic.exam === "All Exams" || topic.exam === selectedExam);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 font-serif">Weak Topic Tracker (Frequency Counter)</h2>
            <p className="text-slate-400 text-sm mt-1">Jo topic mock mein baar-baar galat ho, uska error count increment karein • View: {selectedExam}</p>
          </div>
          <div className="flex gap-2">
            <a href="https://testbook.com/pass" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-300 px-3 py-2 rounded-lg">
              Testbook Pass <ExternalLink size={12} />
            </a>
            <a href="https://www.oliveboard.in/ssc-mts/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-300 px-3 py-2 rounded-lg">
              Oliveboard MTS <ExternalLink size={12} />
            </a>
            <a href="https://www.oliveboard.in/railway-rrb-group-d/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-300 px-3 py-2 rounded-lg">
              Oliveboard Group D <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <form onSubmit={handleAddWeak} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/4">
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Exam</label>
            <select required name="exam" value={weakFormExam} onChange={e => setWeakFormExam(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none">
              {Object.keys(EXAM_SUBJECTS).filter(e => e !== "All Exams").map(exam => <option key={exam}>{exam}</option>)}
            </select>
          </div><div className="w-full md:w-1/4">
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Subject</label>
            <select required name="subject" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none">
              {getSubjectsForExam(weakFormExam).map(subject => <option key={subject} value={subject}>{subject}</option>)}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Weak Topic Name</label>
            <input required name="topic" type="text" placeholder="e.g. CI Installments / Seating Arrangement" maxLength={120} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none" />
          </div>
          <button type="submit" className="w-full md:w-auto bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm">
            Flag Topic
          </button>
        </form>

        <div className="space-y-3">
          {sortedTopics.map(w => {
            const isCritical = w.count >= 5;
            return (
              <div key={w.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                isCritical ? 'bg-rose-950/20 border-rose-500/40' : 'bg-slate-900 border-slate-800'
              }`}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-300 bg-slate-800">{w.exam || 'All Exams'}</span>
                    {isCritical && <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded uppercase">Critical Priority</span>}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${SUBJECT_COLORS[w.subject]}`}>{w.subject}</span>
                    <h3 className="text-base font-medium text-slate-200">{w.topic}</h3>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Last marked wrong on: {w.lastDate}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-lg font-mono font-bold text-rose-400">{w.count}x</span>
                    <span className="text-[10px] text-slate-500 uppercase block">Frequency</span>
                  </div>
                  <button onClick={() => handleIncrement(w.id)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-md font-semibold border border-slate-700">
                    +1 Mistake
                  </button>
                  <button onClick={() => setWeakTopics(weakTopics.filter(item => item.id !== w.id))} className="text-slate-600 hover:text-rose-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- 7. SYLLABUS CHECKLIST ---
  const renderSyllabus = () => {
    const toggleTopic = (subject: string, id: string) => {
      setSyllabus({
        ...syllabus,
        [subject]: syllabus[subject].map(topic => 
          topic.id === id ? { ...topic, completed: !topic.completed } : topic
        )
      });
    };

    const addCustomTopic = (subject: string, inputId: string) => {
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (!input || !input.value.trim()) return;
      
      const newTopic = { id: `custom_${Date.now()}`, name: input.value.trim(), completed: false, custom: true };
      setSyllabus({
        ...syllabus,
        [subject]: [...syllabus[subject], newTopic]
      });
      input.value = '';
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-serif">Subject-wise Syllabus Checklist</h2>
          <p className="text-slate-400 text-sm mt-1">Target exam select karo; relevant subjects ka syllabus aur progress yahin track hoga.</p>
          <div className="mt-4 max-w-sm">
            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Target Exam</label>
            <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500">
              {Object.keys(EXAM_SUBJECTS).map(exam => <option key={exam}>{exam}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(syllabus)
            .filter(([subject]) => (EXAM_SUBJECTS[selectedExam] || EXAM_SUBJECTS["All Exams"]).includes(subject))
            .map(([subject, topics]) => {
            const completed = topics.filter(t => t.completed).length;
            const pct = topics.length ? Math.round((completed / topics.length) * 100) : 0;
            const inputId = `custom-sub-${subject}`;

            return (
              <div key={subject} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${SUBJECT_COLORS[subject]}`}></span>
                      {subject}
                    </h3>
                    <span className="text-xs font-mono text-slate-400">{completed}/{topics.length} ({pct}%)</span>
                  </div>
                  
                  <div className="w-full bg-slate-950 rounded-sm h-1.5 mb-4 border border-slate-800 overflow-hidden">
                    <div className={`h-full ${SUBJECT_COLORS[subject]} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                  </div>

                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {topics.map(topic => (
                      <div key={topic.id} className="flex items-center gap-2 p-2 hover:bg-slate-800/40 rounded-lg cursor-pointer select-none" onClick={() => toggleTopic(subject, topic.id)}>
                        {topic.completed ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" /> : <Circle size={16} className="text-slate-600 flex-shrink-0" />}
                        <span className={`text-xs flex-1 ${topic.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{topic.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
                  <input id={inputId} type="text" placeholder="+ Add topic" className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 outline-none focus:border-amber-500" />
                  <button onClick={() => addCustomTopic(subject, inputId)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1 rounded">Add</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-amber-500/30 relative">
      {/* Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#12181F] border-b border-slate-800 z-40 flex items-center justify-between px-4">
        <span className="font-serif font-bold text-slate-100 text-xl">Field Log</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400 hover:text-white">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Left Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#12181F] border-r border-slate-800 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="pt-20 md:pt-6 px-6 pb-4 border-b border-slate-800/50">
          <div className="text-[10px] tracking-widest uppercase text-amber-500 font-bold mb-1">WRITTEN EXAM TRACKER</div>
          <h1 className="font-serif font-bold text-2xl text-white">Field Log</h1>
          <div className="text-xs text-slate-500 mt-1">SSC · RRB · UP Exams · AOC</div>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-baseline space-x-3 px-3 py-2.5 rounded-md transition-all text-left ${
                  isActive 
                    ? 'bg-slate-800 text-white border-l-2 border-amber-500' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <span className={`font-mono text-xs ${isActive ? 'text-amber-500 font-bold' : 'text-slate-600'}`}>{item.num}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 mt-auto space-y-2">
          <input
            id="field-log-backup-input"
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) void importBackup(file);
              e.currentTarget.value = '';
            }}
          />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={exportBackup} className="flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-400 text-xs py-2 rounded transition-colors">
              <Download size={13} /> Backup
            </button>
            <button onClick={() => document.getElementById('field-log-backup-input')?.click()} className="flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-emerald-400 text-xs py-2 rounded transition-colors">
              <Upload size={13} /> Restore
            </button>
          </div>
          <button onClick={resetAllData} className="w-full bg-slate-900 border border-slate-700 hover:border-rose-500 hover:text-rose-400 text-slate-400 text-xs py-2 rounded transition-colors">
            Reset all data
          </button>
        </div>
      </div>

      {/* Main Viewport Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 md:p-10 pb-32">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'daily' && renderDailyLog()}
          {activeTab === 'mocks' && renderMockTracker()}
          {activeTab === 'pyq' && renderPYQ()}
          {activeTab === 'timetable' && renderTimetable()}
          {activeTab === 'weak' && renderWeakTopics()}
          {activeTab === 'syllabus' && renderSyllabus()}
          {activeTab === 'planner' && renderSmartPlanner()}
          {activeTab === 'ai-bot' && <AIStudyBot studyContext={aiStudyContext} defaultExam={selectedExam} />}
        </div>
      </main>

      {/* GLOBAL FLOATING TIMER WIDGET */}
      <FloatingTimer />
    </div>
  );
}

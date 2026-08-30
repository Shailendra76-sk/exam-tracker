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
  Timer as TimerIcon
} from 'lucide-react';

// --- CONSTANTS & COLOR THEMES ---
const SUBJECT_COLORS: Record<string, string> = { 
  'Maths': 'bg-amber-600', 
  'Reasoning': 'bg-emerald-600', 
  'Science': 'bg-sky-600', 
  'English': 'bg-fuchsia-600', 
  'Hindi': 'bg-rose-600', 
  'GK': 'bg-indigo-600'
};

const EXAM_COLORS: Record<string, string> = { 
  'SSC GD': 'bg-amber-600', 
  'SSC MTS': 'bg-sky-600', 
  'RRB Group D': 'bg-emerald-600',
  'AOC JOA': 'bg-purple-600',
  'SSC CHSL': 'bg-indigo-600',
  'RPF': 'bg-rose-600'
};

// --- INITIAL STATE DATA ---
const initialDailyLogs = [
  { id: 1, date: '2026-08-28', subject: 'Maths', topic: 'Percentage & Successive Change', hours: 2.5, notes: 'Formula clarity achieved, practiced 30 PYQs.' }
];

const initialMocks = [
  { id: 1, date: '2026-08-20', type: 'SSC GD', totalScore: 135, maths: 40, reasoning: 45, lang: 30, ga: 20, correct: 75, incorrect: 25 }
];

const initialPyqLogs = [
  { id: 1, date: '2026-08-25', subject: 'Maths', sets: 2, shiftYear: 'SSC GD 2024 Shift-1 & 2', notes: 'Repeated questions from Time-Work.' }
];

const initialWeakTopics = [
  { id: 1, subject: 'Maths', topic: 'Compound Interest Installments', count: 6, lastDate: '2026-08-29' }
];

const initialSyllabus: Record<string, Array<{ id: string; name: string; completed: boolean; custom?: boolean }>> = {
  Maths: [
    { id: 'm1', name: 'Number System, Simplification & BODMAS', completed: true },
    { id: 'm2', name: 'LCM & HCF (Word Problems & Fractions)', completed: true },
    { id: 'm3', name: 'Percentage & Successive Changes', completed: false },
    { id: 'm4', name: 'Ratio, Proportion & Partnership', completed: false },
    { id: 'm5', name: 'Average & Age Problems', completed: false },
    { id: 'm6', name: 'Profit, Loss & Discount / Marked Price', completed: false },
    { id: 'm7', name: 'Simple Interest & Compound Interest', completed: false },
    { id: 'm8', name: 'Time & Work, Pipes & Cisterns', completed: false },
    { id: 'm9', name: 'Time, Speed, Distance & Trains / Boats', completed: false },
    { id: 'm10', name: 'Mensuration 2D & 3D', completed: false },
  ],
  Reasoning: [
    { id: 'r1', name: 'Analogy & Classification', completed: true },
    { id: 'r2', name: 'Coding-Decoding & Letter Shifts', completed: true },
    { id: 'r3', name: 'Number & Alphabet Series', completed: true },
    { id: 'r4', name: 'Blood Relations & Direction Test', completed: false },
    { id: 'r5', name: 'Syllogism (Only a few Cases)', completed: false },
    { id: 'r6', name: 'Seating Arrangement & Puzzles', completed: false },
    { id: 'r7', name: 'Non-Verbal & Mirror Image', completed: false },
  ],
  Science: [
    { id: 's1', name: 'Physics: Units, Motion & Laws', completed: false },
    { id: 's2', name: 'Physics: Work, Energy & Light', completed: false },
    { id: 's3', name: 'Chemistry: Matter & Elements', completed: false },
    { id: 's4', name: 'Chemistry: Acids, Bases & Periodic Table', completed: false },
    { id: 's5', name: 'Biology: Cell, Vitamins & Diseases', completed: false },
    { id: 's6', name: 'Biology: Human Body Systems', completed: false },
  ],
  English: [
    { id: 'e1', name: 'Parts of Speech & Error Spotting', completed: true },
    { id: 'e2', name: 'Tenses & Voice (Active/Passive)', completed: false },
    { id: 'e3', name: 'Prepositions & Phrasal Verbs', completed: false },
    { id: 'e4', name: 'Synonyms, Antonyms & Spelling', completed: false },
    { id: 'e5', name: 'Idioms & One-Word Substitution', completed: false },
    { id: 'e6', name: 'Cloze Test & Comprehension', completed: false },
  ],
  Hindi: [
    { id: 'h1', name: 'वर्णमाला एवं वर्तनी शुद्धि', completed: false },
    { id: 'h2', name: 'संधि एवं समास', completed: false },
    { id: 'h3', name: 'विलोम एवं पर्यायवाची शब्द', completed: true },
    { id: 'h4', name: 'मुहावरे और लोकोक्तियाँ', completed: false },
    { id: 'h5', name: 'वाक्यांश के लिए एक शब्द', completed: false },
    { id: 'h6', name: 'अपठित गद्यांश', completed: false },
  ],
  GK: [
    { id: 'g1', name: 'History: Ancient, Medieval & Modern', completed: false },
    { id: 'g2', name: 'Polity: Constitution & Articles', completed: false },
    { id: 'g3', name: 'Geography: Rivers, Mountains & Climate', completed: false },
    { id: 'g4', name: 'Static GK: Dances, Festivals & Books', completed: false },
    { id: 'g5', name: 'Current Affairs: Last 6 Months', completed: false },
  ]
};

// --- FLOATING STUDY TIMER COMPONENT ---
const FloatingTimer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed z-50 transition-all duration-300 shadow-2xl border border-slate-700/50 ${
      isMinimized 
        ? 'bottom-6 right-6 bg-slate-900/90 backdrop-blur-sm rounded-full px-4 py-2.5 flex items-center gap-4 cursor-pointer hover:bg-slate-800'
        : 'bottom-6 right-6 bg-slate-900 rounded-2xl p-5 w-64'
    }`}>
      {isMinimized ? (
        <div className="flex items-center gap-3 w-full" onClick={(e) => { if((e.target as HTMLElement).closest('button') === null) setIsMinimized(false); }}>
          <TimerIcon size={16} className={`text-amber-500 ${isRunning ? 'animate-pulse' : ''}`} />
          <span className="font-mono font-bold text-slate-100 text-sm tracking-wider">{formatTime(time)}</span>
          <div className="flex items-center gap-1 border-l border-slate-700 pl-3 ml-1">
            <button onClick={() => setIsRunning(!isRunning)} className="text-slate-400 hover:text-amber-500 p-1">
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={() => setIsMinimized(false)} className="text-slate-400 hover:text-white p-1">
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <TimerIcon size={16} className={`text-amber-500 ${isRunning ? 'animate-pulse' : ''}`} /> Study Timer
            </div>
            <button onClick={() => setIsMinimized(true)} className="text-slate-500 hover:text-white bg-slate-800/50 p-1.5 rounded-md">
              <Minimize2 size={14} />
            </button>
          </div>
          <div className="text-4xl font-mono font-bold text-center text-slate-100 mb-6 tracking-wider">{formatTime(time)}</div>
          <div className="flex justify-center gap-4">
            <button onClick={() => setIsRunning(!isRunning)} className={`p-3 rounded-full flex-1 flex justify-center items-center gap-2 font-semibold text-sm transition-colors ${
                isRunning ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}>
              {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
            </button>
            <button onClick={() => { setTime(0); setIsRunning(false); }} className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700" title="Reset Timer">
              <RotateCcw size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App State
  const [dailyLogs, setDailyLogs] = useState(initialDailyLogs);
  const [mocks, setMocks] = useState(initialMocks);
  const [pyqLogs, setPyqLogs] = useState(initialPyqLogs);
  const [weakTopics, setWeakTopics] = useState(initialWeakTopics);
  const [syllabus, setSyllabus] = useState(initialSyllabus);
  const [nextPlan, setNextPlan] = useState("Maths revision + 1 Mock Test.");

  const navItems = [
    { id: 'dashboard', num: '01', label: 'Dashboard & Analytics', icon: LayoutDashboard },
    { id: 'daily', num: '02', label: 'Daily Log', icon: PenTool },
    { id: 'mocks', num: '03', label: 'Mock/Test Tracker', icon: Target },
    { id: 'pyq', num: '04', label: 'PYQ Practice Log', icon: BookOpen },
    { id: 'timetable', num: '05', label: 'Interactive Timetable', icon: Calendar },
    { id: 'weak', num: '06', label: 'Weak Topics Tracker', icon: AlertTriangle },
    { id: 'syllabus', num: '07', label: 'Syllabus Checklist', icon: ListChecks },
  ];

  const resetAllData = () => {
    if(window.confirm('Pura tracker data delete ho jayega. Pakka reset karna hai?')) {
      setDailyLogs([]); setMocks([]); setPyqLogs([]); setWeakTopics([]); setNextPlan("");
      const resetSyllabus: Record<string, Array<{ id: string; name: string; completed: boolean }>> = {};
      Object.keys(syllabus).forEach(key => { resetSyllabus[key] = syllabus[key].map(t => ({ ...t, completed: false })); });
      setSyllabus(resetSyllabus);
    }
  };

  // --- 1. DASHBOARD & ANALYTICS ---
  const renderDashboard = () => {
    const totalHours = dailyLogs.reduce((acc, log) => acc + Number(log.hours), 0);
    const totalPyqSets = pyqLogs.reduce((acc, log) => acc + Number(log.sets), 0);
    const avgScore = mocks.length ? (mocks.reduce((acc, m) => acc + m.totalScore, 0) / mocks.length).toFixed(1) : '—';
    const subjectHours = dailyLogs.reduce((acc: Record<string, number>, log) => {
      acc[log.subject] = (acc[log.subject] || 0) + Number(log.hours);
      return acc;
    }, {});
    const maxHour = Math.max(1, ...Object.values(subjectHours));

    let totalItems = 0; let completedItems = 0;
    Object.values(syllabus).forEach(topics => {
      totalItems += topics.length; completedItems += topics.filter(t => t.completed).length;
    });
    const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    const topWeak = [...weakTopics].sort((a, b) => b.count - a.count).slice(0, 3);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-xs uppercase font-bold tracking-widest mb-1"><Sparkles size={14} /> Control Centre</div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 font-serif">Mission Dashboard</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl"><h3 className="text-xs uppercase text-slate-400 font-semibold mb-2">Study Hours</h3><div className="text-3xl font-mono font-bold text-amber-500">{totalHours.toFixed(1)}h</div></div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl"><h3 className="text-xs uppercase text-slate-400 font-semibold mb-2">Mocks Given</h3><div className="text-3xl font-mono font-bold text-sky-400">{mocks.length}</div></div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl"><h3 className="text-xs uppercase text-slate-400 font-semibold mb-2">Avg Mock Score</h3><div className="text-3xl font-mono font-bold text-emerald-400">{avgScore}</div></div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl"><h3 className="text-xs uppercase text-slate-400 font-semibold mb-2">PYQ Sets</h3><div className="text-3xl font-mono font-bold text-fuchsia-400">{totalPyqSets}</div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Study Hours by Subject</h3>
            <div className="space-y-2.5">
              {['Maths', 'Reasoning', 'Science', 'English', 'Hindi', 'GK'].map(sub => {
                const hrs = subjectHours[sub] || 0;
                const pct = maxHour > 0 ? (hrs / maxHour) * 100 : 0;
                return (
                  <div key={sub} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-slate-400 font-medium truncate">{sub}</span>
                    <div className="flex-1 bg-slate-800 h-2.5 rounded-sm overflow-hidden"><div className={`h-full rounded-sm ${SUBJECT_COLORS[sub]} transition-all`} style={{ width: `${pct}%` }}></div></div>
                    <span className="w-10 text-right text-xs font-mono text-slate-300">{hrs.toFixed(1)}h</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase text-rose-400 font-semibold mb-4">High-Priority Weak Areas</h3>
              <div className="space-y-2">
                {topWeak.map(w => (
                  <div key={w.id} className="flex items-center justify-between p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                    <div><div className="text-sm font-medium text-slate-200">{w.topic}</div><div className="text-xs text-rose-400">{w.subject}</div></div>
                    <span className="px-2.5 py-1 bg-rose-500 text-white font-mono text-xs font-bold rounded-md">{w.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-8">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
            <h3 className="text-sm uppercase tracking-wider text-amber-500 font-bold">2026 Career Matrix</h3>
          </div>
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase"><th className="p-3">Exam</th><th className="p-3">Status</th><th className="p-3">Salary</th></thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/30"><td className="p-3 text-slate-100">RPF Constable</td><td className="p-3 text-slate-400">Upcoming 2026</td><td className="p-3">Level 3 (Basic ₹21,700)</td></tr>
              <tr className="hover:bg-slate-800/30"><td className="p-3 text-slate-100">RRB NTPC</td><td className="p-3 text-slate-400">CBT 2 on 17 Sep 2026</td><td className="p-3">Level 2/3</td></tr>
              <tr className="hover:bg-slate-800/30"><td className="p-3 text-slate-100">SSC CHSL</td><td className="p-3 text-slate-400">Oct 2026</td><td className="p-3">₹25,500–₹81,100</td></tr>
              <tr className="hover:bg-slate-800/30"><td className="p-3 text-slate-100">UP Police</td><td className="p-3 text-slate-400">Next Notification Pending</td><td className="p-3">₹30,000–₹40,000</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDailyLog = () => {
    const handleAddLog = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const newLog = {
        id: Date.now(),
        date: formData.get('date') as string,
        subject: formData.get('subject') as string,
        topic: formData.get('topic') as string,
        hours: Number(formData.get('hours')),
        notes: formData.get('notes') as string
      };
      setDailyLogs([newLog, ...dailyLogs]);
      e.currentTarget.reset();
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div><h2 className="text-2xl font-bold text-slate-100 font-serif">Daily Study Log</h2></div>
        <form onSubmit={handleAddLog} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div><label className="block text-xs text-slate-400 mb-1">Date</label><input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Subject</label><select required name="subject" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"><option value="Maths">Maths</option><option value="Reasoning">Reasoning</option><option value="Science">Science</option><option value="English">English</option><option value="Hindi">Hindi</option><option value="GK">GK</option></select></div>
            <div><label className="block text-xs text-slate-400 mb-1">Topic Name</label><input required name="topic" type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Hours</label><input required name="hours" type="number" step="0.5" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" /></div>
          </div>
          <div><label className="block text-xs text-slate-400 mb-1">Notes</label><textarea name="notes" rows={2} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"></textarea></div>
          <div className="flex justify-end"><button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-6 rounded-lg text-sm">Add Log</button></div>
        </form>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs"><th className="p-4">Date</th><th className="p-4">Subject</th><th className="p-4">Topic</th><th className="p-4">Hours</th><th className="p-4">Notes</th><th className="p-4"></th></thead>
            <tbody>
              {dailyLogs.map(log => (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="p-4 font-mono">{log.date}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] text-white ${SUBJECT_COLORS[log.subject]}`}>{log.subject}</span></td>
                  <td className="p-4">{log.topic}</td><td className="p-4 font-mono text-amber-400">{log.hours}h</td><td className="p-4 text-xs">{log.notes}</td>
                  <td className="p-4 text-right"><button onClick={() => setDailyLogs(dailyLogs.filter(d => d.id !== log.id))} className="text-slate-600 hover:text-rose-400"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMockTracker = () => {
    const handleAddMock = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const newMock = {
        id: Date.now(), date: formData.get('date') as string, type: formData.get('type') as string,
        totalScore: Number(formData.get('total')), maths: Number(formData.get('maths')), reasoning: Number(formData.get('reasoning')),
        lang: Number(formData.get('lang')), ga: Number(formData.get('ga')), correct: Number(formData.get('correct')), incorrect: Number(formData.get('incorrect')),
      };
      setMocks([newMock, ...mocks]);
      e.currentTarget.reset();
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div><h2 className="text-2xl font-bold text-slate-100 font-serif">Mock Test Tracker</h2></div>
        <form onSubmit={handleAddMock} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs text-slate-400 mb-1">Exam</label><select required name="type" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"><option value="SSC GD">SSC GD</option><option value="SSC MTS">SSC MTS</option><option value="RRB Group D">RRB Group D</option><option value="SSC CHSL">SSC CHSL</option></select></div>
            <div><label className="block text-xs text-slate-400 mb-1">Date</label><input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Total Score</label><input required name="total" type="number" step="0.5" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" /></div>
          </div>
          <div className="border-t border-slate-800 pt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
            <div><label className="block text-[10px] text-slate-400 mb-1">Maths</label><input required name="maths" type="number" className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm" /></div>
            <div><label className="block text-[10px] text-slate-400 mb-1">Reas</label><input required name="reasoning" type="number" className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm" /></div>
            <div><label className="block text-[10px] text-slate-400 mb-1">Lang</label><input required name="lang" type="number" className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm" /></div>
            <div><label className="block text-[10px] text-slate-400 mb-1">GA</label><input required name="ga" type="number" className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sm" /></div>
            <div><label className="block text-[10px] text-emerald-400 mb-1">Correct</label><input required name="correct" type="number" className="w-full bg-slate-950 border border-emerald-900/60 rounded px-2.5 py-1.5 text-sm text-emerald-400" /></div>
            <div><label className="block text-[10px] text-rose-400 mb-1">Incorrect</label><input required name="incorrect" type="number" className="w-full bg-slate-950 border border-rose-900/60 rounded px-2.5 py-1.5 text-sm text-rose-400" /></div>
          </div>
          <div className="flex justify-end"><button type="submit" className="bg-slate-100 text-slate-950 font-bold py-2 px-6 rounded-lg text-sm">Save Mock</button></div>
        </form>
        <div className="space-y-3">
          {mocks.map(mock => {
            const accuracy = mock.correct + mock.incorrect > 0 ? ((mock.correct / (mock.correct + mock.incorrect)) * 100).toFixed(1) : '0.0';
            return (
              <div key={mock.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
                <div className="flex items-center gap-4"><span className={`px-2 py-1 rounded text-xs text-white ${EXAM_COLORS[mock.type] || 'bg-slate-600'}`}>{mock.type}</span><div><div className="text-2xl font-mono text-slate-100">{mock.totalScore}</div><div className="text-xs text-slate-500">{mock.date}</div></div></div>
                <div className="flex items-center gap-4 text-right"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">{accuracy}% Acc</span><button onClick={() => setMocks(mocks.filter(m => m.id !== mock.id))} className="text-slate-600 hover:text-rose-400"><Trash2 size={16} /></button></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPYQ = () => {
    const handleAddPyq = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const newPyq = { id: Date.now(), date: formData.get('date') as string, subject: formData.get('subject') as string, sets: Number(formData.get('sets')), shiftYear: formData.get('shiftYear') as string, notes: formData.get('notes') as string };
      setPyqLogs([newPyq, ...pyqLogs]); e.currentTarget.reset();
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div><h2 className="text-2xl font-bold text-slate-100 font-serif">PYQ Practice Log</h2></div>
        <form onSubmit={handleAddPyq} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" /></div>
            <div><select required name="subject" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"><option value="Maths">Maths</option><option value="Reasoning">Reasoning</option><option value="Science">Science</option><option value="English">English</option><option value="Hindi">Hindi</option><option value="GK">GK</option></select></div>
            <div><input required name="sets" type="number" min="1" placeholder="Sets Solved" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" /></div>
            <div><input required name="shiftYear" type="text" placeholder="Shift/Year" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" /></div>
          </div>
          <div><input name="notes" type="text" placeholder="Notes..." className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" /></div>
          <div className="flex justify-end"><button type="submit" className="bg-fuchsia-600 text-white font-semibold py-2 px-6 rounded-lg text-sm">Log PYQ</button></div>
        </form>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs"><th className="p-4">Date</th><th className="p-4">Subject</th><th className="p-4">Sets</th><th className="p-4">Notes</th><th className="p-4"></th></thead>
            <tbody>
              {pyqLogs.map(log => (
                <tr key={log.id} className="border-b border-slate-800/50">
                  <td className="p-4 font-mono">{log.date}</td><td className="p-4"><span className={`px-2 py-1 rounded text-[10px] text-white ${SUBJECT_COLORS[log.subject]}`}>{log.subject}</span></td>
                  <td className="p-4 text-fuchsia-400">{log.sets}</td><td className="p-4 text-xs">{log.notes}</td>
                  <td className="p-4 text-right"><button onClick={() => setPyqLogs(pyqLogs.filter(p => p.id !== log.id))} className="text-slate-600 hover:text-rose-400"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTimetable = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div><h2 className="text-2xl font-bold text-slate-100 font-serif">Daily Schedule</h2></div>
      <div className="grid grid-cols-1 gap-4">
        {[
          { block: 'Block 1', slot: 'Maths Study Slot' },
          { block: 'Block 2', slot: 'English / Hindi Grammar Slot' },
          { block: 'Block 3', slot: 'Reasoning Quiz & Puzzles' },
          { block: 'Block 4', slot: 'General Science & GK NCERT' },
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl"><span className="text-amber-500 font-mono text-xs">{item.block}</span><h3 className="text-base text-slate-100">{item.slot}</h3></div>
        ))}
      </div>
    </div>
  );

  const renderWeakTopics = () => {
    const handleAddWeak = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const subject = formData.get('subject') as string;
      const topic = (formData.get('topic') as string).trim();
      const existing = weakTopics.find(w => w.subject === subject && w.topic.toLowerCase() === topic.toLowerCase());
      if (existing) {
        setWeakTopics(weakTopics.map(w => w.id === existing.id ? { ...w, count: w.count + 1 } : w));
      } else {
        setWeakTopics([...weakTopics, { id: Date.now(), subject, topic, count: 1, lastDate: new Date().toISOString().split('T')[0] }]);
      }
      e.currentTarget.reset();
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div><h2 className="text-2xl font-bold text-slate-100 font-serif">Weak Topics</h2></div>
        <form onSubmit={handleAddWeak} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex gap-4">
          <select required name="subject" className="w-1/4 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"><option value="Maths">Maths</option><option value="Reasoning">Reasoning</option><option value="English">English</option></select>
          <input required name="topic" type="text" placeholder="Topic Name" className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none" />
          <button type="submit" className="bg-rose-600 text-white py-2 px-6 rounded-lg text-sm">Flag</button>
        </form>
        <div className="space-y-3">
          {weakTopics.map(w => (
            <div key={w.id} className="p-4 rounded-xl border bg-slate-900 border-slate-800 flex justify-between items-center">
              <div><span className={`px-2 py-0.5 rounded text-[10px] text-white ${SUBJECT_COLORS[w.subject]}`}>{w.subject}</span><h3 className="text-slate-200 mt-1">{w.topic}</h3></div>
              <div className="flex items-center gap-4"><span className="text-rose-400 font-mono font-bold">{w.count}x</span><button onClick={() => setWeakTopics(weakTopics.filter(item => item.id !== w.id))} className="text-slate-600 hover:text-rose-400"><Trash2 size={16} /></button></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSyllabus = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div><h2 className="text-2xl font-bold text-slate-100 font-serif">Syllabus Checklist</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(syllabus).map(([subject, topics]) => (
          <div key={subject} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="font-semibold text-slate-200 mb-4">{subject}</h3>
            <div className="space-y-2 h-64 overflow-y-auto">
              {topics.map(topic => (
                <div key={topic.id} className="flex items-center gap-2" onClick={() => {
                  setSyllabus({...syllabus, [subject]: syllabus[subject].map(t => t.id === topic.id ? { ...t, completed: !t.completed } : t)});
                }}>
                  {topic.completed ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-slate-600" />}
                  <span className={`text-sm cursor-pointer ${topic.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{topic.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-300 font-sans relative">
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#12181F] border-b border-slate-800 z-40 flex items-center justify-between px-4">
        <span className="font-serif font-bold text-slate-100 text-xl">Field Log</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#12181F] border-r border-slate-800 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="pt-20 md:pt-6 px-6 pb-4 border-b border-slate-800/50">
          <div className="text-[10px] uppercase text-amber-500 font-bold mb-1">EXAM TRACKER</div>
          <h1 className="font-serif font-bold text-2xl text-white">Field Log</h1>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-baseline space-x-3 px-3 py-2.5 rounded-md text-left ${isActive ? 'bg-slate-800 text-white border-l-2 border-amber-500' : 'text-slate-400 hover:bg-slate-800/40'}`}>
                <span className={`font-mono text-xs ${isActive ? 'text-amber-500' : 'text-slate-600'}`}>{item.num}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 md:p-10 pb-32">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'daily' && renderDailyLog()}
          {activeTab === 'mocks' && renderMockTracker()}
          {activeTab === 'pyq' && renderPYQ()}
          {activeTab === 'timetable' && renderTimetable()}
          {activeTab === 'weak' && renderWeakTopics()}
          {activeTab === 'syllabus' && renderSyllabus()}
        </div>
      </main>
      <FloatingTimer />
    </div>
  );
}

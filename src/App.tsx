import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, PenTool, Target, BookOpen, Calendar, AlertTriangle, 
  ListChecks, TrendingUp, ExternalLink, CheckCircle2, Circle, Menu, X, 
  Trash2, Sparkles, ArrowUpRight, Play, Pause, RotateCcw, Minimize2, 
  Maximize2, Timer as TimerIcon, GripHorizontal, Plus
} from 'lucide-react';

const SUBJECT_COLORS: Record<string, string> = { 
  'Maths': 'bg-amber-600', 'Reasoning': 'bg-emerald-600', 'Science': 'bg-sky-600', 
  'English': 'bg-fuchsia-600', 'Hindi': 'bg-rose-600', 'GK': 'bg-indigo-600' 
};

const EXAM_COLORS: Record<string, string> = { 
  'SSC GD': 'bg-amber-600', 'SSC MTS': 'bg-sky-600', 'RRB Group D': 'bg-emerald-600',
  'AOC JOA': 'bg-purple-600', 'SSC CHSL': 'bg-indigo-600', 'RPF': 'bg-rose-600' 
};

const initialDailyLogs = [{ id: 1, date: '2026-08-28', subject: 'Maths', topic: 'Percentage & Successive Change', hours: 2.5, notes: 'Formula clarity achieved' }];
const initialMocks = [{ id: 1, date: '2026-08-20', type: 'SSC GD', totalScore: 135, maths: 40, reasoning: 45, lang: 30, ga: 20, correct: 75, incorrect: 25 }];
const initialPyqLogs = [{ id: 1, date: '2026-08-25', subject: 'Maths', sets: 2, shiftYear: 'SSC GD 2024 Shift-1 & 2', notes: 'Repeated questions from Time-Work.' }];
const initialWeakTopics = [{ id: 1, subject: 'Maths', topic: 'Compound Interest Installments', count: 6, lastDate: '2026-08-29' }];

const initialSyllabus: Record<string, Array<{ id: string; name: string; completed: boolean; custom?: boolean }>> = {
  Maths: [
    { id: 'm1', name: 'Number System, Simplification & BODMAS', completed: true },
    { id: 'm2', name: 'LCM & HCF (Word Problems & Fractions)', completed: true },
    { id: 'm3', name: 'Percentage & Successive Changes', completed: false },
    { id: 'm4', name: 'Ratio, Proportion & Partnership', completed: false },
    { id: 'm5', name: 'Average & Age Problems', completed: false },
    { id: 'm6', name: 'Profit, Loss & Discount', completed: false },
    { id: 'm7', name: 'Simple & Compound Interest', completed: false },
    { id: 'm8', name: 'Time & Work, Pipes & Cisterns', completed: false },
    { id: 'm9', name: 'Time, Speed, Distance & Trains', completed: false },
    { id: 'm10', name: 'Mensuration 2D & 3D', completed: false },
  ],
  Reasoning: [
    { id: 'r1', name: 'Analogy & Classification', completed: true },
    { id: 'r2', name: 'Coding-Decoding', completed: true },
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

// --- DRAGGABLE FLOATING TIMER ---
const FloatingTimer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Dragging State
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Set initial position to bottom right safely
    setPosition({ x: window.innerWidth - 300, y: window.innerHeight - 250 });
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      style={{ left: position.x, top: position.y, touchAction: 'none' }}
      className={`fixed z-50 transition-shadow duration-300 shadow-2xl border border-slate-700/50 ${
        isMinimized ? 'bg-slate-900/90 backdrop-blur-sm rounded-full px-4 py-2.5 flex items-center gap-4 cursor-pointer hover:bg-slate-800' : 'bg-slate-900 rounded-2xl p-5 w-64'
      }`}
    >
      {/* Drag Handle */}
      {!isMinimized && (
        <div 
          onPointerDown={handlePointerDown} 
          onPointerMove={handlePointerMove} 
          onPointerUp={handlePointerUp}
          className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center cursor-move hover:bg-slate-800/50 rounded-t-2xl"
        >
          <GripHorizontal size={14} className="text-slate-500" />
        </div>
      )}

      {isMinimized ? (
        <div className="flex items-center gap-3 w-full" onClick={(e) => { if((e.target as HTMLElement).closest('button') === null) setIsMinimized(false); }}>
          <div 
            onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
            className="cursor-move mr-1 p-1 hover:bg-slate-800 rounded text-slate-500"
          >
            <GripHorizontal size={14} />
          </div>
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
        <div className="mt-2">
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
            <button onClick={() => setIsRunning(!isRunning)} className={`p-3 rounded-full flex-1 flex justify-center items-center gap-2 font-semibold text-sm transition-colors ${isRunning ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'}`}>
              {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
            </button>
            <button onClick={() => { setTime(0); setIsRunning(false); }} className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700" title="Reset Timer">
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APPLICATION ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [dailyLogs, setDailyLogs] = useState(initialDailyLogs);
  const [mocks, setMocks] = useState(initialMocks);
  const [pyqLogs, setPyqLogs] = useState(initialPyqLogs);
  const [weakTopics, setWeakTopics] = useState(initialWeakTopics);
  const [syllabus, setSyllabus] = useState(initialSyllabus);

  const navItems = [
    { id: 'dashboard', num: '01', label: 'Dashboard & Analytics', icon: LayoutDashboard },
    { id: 'daily', num: '02', label: 'Daily Log', icon: PenTool },
    { id: 'mocks', num: '03', label: 'Mock Tracker', icon: Target },
    { id: 'pyq', num: '04', label: 'PYQ Practice', icon: BookOpen },
    { id: 'timetable', num: '05', label: 'Timetable', icon: Calendar },
    { id: 'weak', num: '06', label: 'Weak Topics', icon: AlertTriangle },
    { id: 'syllabus', num: '07', label: 'Syllabus', icon: ListChecks },
  ];

  // 1. DASHBOARD
  const renderDashboard = () => {
    const totalHours = dailyLogs.reduce((acc, log) => acc + Number(log.hours), 0);
    const avgScore = mocks.length ? (mocks.reduce((acc, m) => acc + m.totalScore, 0) / mocks.length).toFixed(1) : '—';

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <h2 className="text-3xl font-bold text-slate-100 font-serif">Mission Dashboard</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl"><h3 className="text-xs uppercase text-slate-400 font-semibold mb-2">Study Hours</h3><div className="text-3xl font-mono font-bold text-amber-500">{totalHours.toFixed(1)}h</div></div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl"><h3 className="text-xs uppercase text-slate-400 font-semibold mb-2">Mocks Given</h3><div className="text-3xl font-mono font-bold text-sky-400">{mocks.length}</div></div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl"><h3 className="text-xs uppercase text-slate-400 font-semibold mb-2">Avg Score</h3><div className="text-3xl font-mono font-bold text-emerald-400">{avgScore}</div></div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl"><h3 className="text-xs uppercase text-slate-400 font-semibold mb-2">Weak Topics</h3><div className="text-3xl font-mono font-bold text-rose-400">{weakTopics.length}</div></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-8">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60"><h3 className="text-sm uppercase tracking-wider text-amber-500 font-bold">2026 Career Matrix</h3></div>
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

  // 2. DAILY LOG
  const renderDailyLog = () => {
    const handleAddLog = (e: any) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      setDailyLogs([{ id: Date.now(), date: fd.get('date') as string, subject: fd.get('subject') as string, topic: fd.get('topic') as string, hours: Number(fd.get('hours')) }, ...dailyLogs]);
      e.target.reset();
    };
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-100 font-serif">Daily Study Log</h2>
        <form onSubmit={handleAddLog} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div><label className="block text-xs text-slate-400 mb-1">Date</label><input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm outline-none text-white" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Subject</label><select required name="subject" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm outline-none text-white"><option>Maths</option><option>Reasoning</option><option>Science</option><option>English</option><option>Hindi</option><option>GK</option></select></div>
            <div><label className="block text-xs text-slate-400 mb-1">Topic</label><input required name="topic" type="text" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm outline-none text-white" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Hours</label><input required name="hours" type="number" step="0.5" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm outline-none text-white" /></div>
          </div>
          <button type="submit" className="bg-amber-600 text-white py-2 px-6 rounded text-sm w-full md:w-auto">Add Log</button>
        </form>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs"><th className="p-4">Date</th><th className="p-4">Subject</th><th className="p-4">Topic</th><th className="p-4">Hours</th><th className="p-4"></th></thead>
            <tbody>
              {dailyLogs.map(log => (
                <tr key={log.id} className="border-b border-slate-800/50"><td className="p-4">{log.date}</td><td className="p-4"><span className={`px-2 py-1 rounded text-[10px] text-white ${SUBJECT_COLORS[log.subject]}`}>{log.subject}</span></td><td className="p-4">{log.topic}</td><td className="p-4">{log.hours}h</td><td className="p-4 text-right"><button onClick={() => setDailyLogs(dailyLogs.filter(d => d.id !== log.id))} className="text-rose-400"><Trash2 size={16} /></button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 3. MOCK TRACKER
  const renderMockTracker = () => {
    const handleAddMock = (e: any) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      setMocks([{ id: Date.now(), date: fd.get('date') as string, type: fd.get('type') as string, totalScore: Number(fd.get('ts')), correct: Number(fd.get('c')), incorrect: Number(fd.get('i')) }, ...mocks]);
      e.target.reset();
    };
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-100 font-serif">Mock Test Tracker</h2>
        <form onSubmit={handleAddMock} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select required name="type" className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white"><option>SSC GD</option><option>SSC MTS</option><option>RRB Group D</option><option>SSC CHSL</option></select>
            <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white" />
            <input required name="ts" type="number" step="0.5" placeholder="Total Score" className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input required name="c" type="number" placeholder="Correct Qs" className="bg-slate-950 border border-emerald-900/60 text-emerald-400 rounded px-3 py-2 text-sm" />
            <input required name="i" type="number" placeholder="Incorrect Qs" className="bg-slate-950 border border-rose-900/60 text-rose-400 rounded px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-sky-600 text-white py-2 px-6 rounded text-sm w-full md:w-auto">Save Mock</button>
        </form>
        <div className="space-y-3">
          {mocks.map(m => (
            <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center">
              <div><span className={`px-2 py-1 rounded text-xs text-white ${EXAM_COLORS[m.type] || 'bg-slate-600'}`}>{m.type}</span><div className="text-2xl font-mono text-slate-100 mt-2">{m.totalScore}</div></div>
              <button onClick={() => setMocks(mocks.filter(x => x.id !== m.id))} className="text-rose-400"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 4. PYQ LOG
  const renderPYQ = () => {
    const handleAddPyq = (e: any) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      setPyqLogs([{ id: Date.now(), date: fd.get('date') as string, subject: fd.get('subject') as string, sets: Number(fd.get('sets')), shiftYear: fd.get('sy') as string }, ...pyqLogs]);
      e.target.reset();
    };
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-100 font-serif">PYQ Practice Log</h2>
        <form onSubmit={handleAddPyq} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white" />
            <select required name="subject" className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white"><option>Maths</option><option>Reasoning</option><option>Science</option><option>English</option><option>Hindi</option><option>GK</option></select>
            <input required name="sets" type="number" placeholder="Sets Solved" className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white" />
            <input required name="sy" type="text" placeholder="Shift/Year" className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white" />
          </div>
          <button type="submit" className="bg-fuchsia-600 text-white py-2 px-6 rounded text-sm w-full md:w-auto">Log PYQ</button>
        </form>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs"><th className="p-4">Date</th><th className="p-4">Subject</th><th className="p-4">Sets</th><th className="p-4">Shift/Year</th><th className="p-4"></th></thead>
            <tbody>
              {pyqLogs.map(p => (
                <tr key={p.id} className="border-b border-slate-800/50"><td className="p-4">{p.date}</td><td className="p-4"><span className={`px-2 py-1 rounded text-[10px] text-white ${SUBJECT_COLORS[p.subject]}`}>{p.subject}</span></td><td className="p-4">{p.sets}</td><td className="p-4">{p.shiftYear}</td><td className="p-4 text-right"><button onClick={() => setPyqLogs(pyqLogs.filter(x => x.id !== p.id))} className="text-rose-400"><Trash2 size={16}/></button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 5. TIMETABLE
  const renderTimetable = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 font-serif">Interactive Timetable</h2>
      <div className="grid grid-cols-1 gap-4">
        {[
          { block: 'Block 1 (2 Hours)', slot: 'Maths Study Slot', link: 'https://youtube.com' },
          { block: 'Block 2 (1.5 Hours)', slot: 'English / Hindi Grammar', link: 'https://youtube.com' },
          { block: 'Block 3 (1.5 Hours)', slot: 'Reasoning Quiz & Puzzles', link: 'https://testbook.com' },
          { block: 'Block 4 (1 Hour)', slot: 'General Science & GK', link: 'https://oliveboard.in' },
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex justify-between items-center">
            <div><span className="text-amber-500 font-mono text-xs">{item.block}</span><h3 className="text-base text-slate-100">{item.slot}</h3></div>
            <a href={item.link} target="_blank" rel="noreferrer" className="text-xs border border-slate-700 px-3 py-1.5 rounded hover:bg-slate-800 flex items-center gap-1">Practice <ExternalLink size={12}/></a>
          </div>
        ))}
      </div>
    </div>
  );

  // 6. WEAK TOPICS
  const renderWeakTopics = () => {
    const handleAddWeak = (e: any) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      setWeakTopics([{ id: Date.now(), subject: fd.get('subject') as string, topic: fd.get('topic') as string, count: 1, lastDate: new Date().toISOString().split('T')[0] }, ...weakTopics]);
      e.target.reset();
    };
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-100 font-serif">Weak Topics Tracker</h2>
        <form onSubmit={handleAddWeak} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row gap-4">
          <select required name="subject" className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white md:w-1/4"><option>Maths</option><option>Reasoning</option><option>English</option><option>GK</option></select>
          <input required name="topic" type="text" placeholder="Topic Name" className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white" />
          <button type="submit" className="bg-rose-600 text-white py-2 px-6 rounded text-sm">Flag</button>
        </form>
        <div className="space-y-3">
          {weakTopics.map(w => (
            <div key={w.id} className="p-4 rounded-xl border bg-slate-900 border-slate-800 flex justify-between items-center">
              <div><span className={`px-2 py-0.5 rounded text-[10px] text-white ${SUBJECT_COLORS[w.subject]}`}>{w.subject}</span><h3 className="text-slate-200 mt-1">{w.topic}</h3></div>
              <div className="flex items-center gap-4"><span className="text-rose-400 font-mono font-bold text-lg">{w.count}x</span><button onClick={() => setWeakTopics(weakTopics.map(x => x.id === w.id ? {...x, count: x.count+1} : x))} className="bg-slate-800 px-2 py-1 rounded text-xs">+1</button><button onClick={() => setWeakTopics(weakTopics.filter(item => item.id !== w.id))} className="text-rose-400"><Trash2 size={16} /></button></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 7. SYLLABUS
  const renderSyllabus = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 font-serif">Syllabus Checklist</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(syllabus).map(([subject, topics]) => (
          <div key={subject} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="font-semibold text-slate-200 mb-4">{subject}</h3>
            <div className="space-y-2 h-64 overflow-y-auto pr-2">
              {topics.map(topic => (
                <div key={topic.id} className="flex items-center gap-2 cursor-pointer" onClick={() => setSyllabus({...syllabus, [subject]: syllabus[subject].map(t => t.id === topic.id ? { ...t, completed: !t.completed } : t)})}> 
                  {topic.completed ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <Circle size={16} className="text-slate-600 shrink-0" />} 
                  <span className={`text-sm ${topic.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{topic.name}</span>
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
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#12181F] border-r border-slate-800 flex flex-col`}>
        <div className="pt-6 px-6 pb-4 border-b border-slate-800/50"><h1 className="font-serif font-bold text-2xl text-white">Field Log</h1></div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-baseline space-x-3 px-3 py-2.5 rounded-md text-left ${activeTab === item.id ? 'bg-slate-800 text-white border-l-2 border-amber-500' : 'text-slate-400 hover:bg-slate-800/50'}`}>
              <span className={`font-mono text-xs ${activeTab === item.id ? 'text-amber-500' : 'text-slate-600'}`}>{item.num}</span><span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <main className="flex-1 ml-64 pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-10 pb-32">
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

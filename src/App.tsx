import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LayoutDashboard, BookOpen, ClipboardList, FileText, CalendarDays,
  AlertTriangle, ListChecks, ExternalLink, Trash2, Plus, ShieldCheck,
  TrendingUp, Clock, Target, RotateCcw, Flame, Award, Info,
  CheckSquare, Download, Upload, GripHorizontal, Play, Pause, Minimize2, Maximize2, Timer as TimerIcon
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

/* ------------------------------------------------------------------ */
/* Static Reference Data                                              */
/* ------------------------------------------------------------------ */
const SUBJECTS = ['Maths', 'Reasoning', 'Science', 'English', 'Hindi', 'GK'];

const SUBJECT_STYLES: Record<string, any> = {
  Maths:     { dot: 'bg-amber-500',    soft: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  Reasoning: { dot: 'bg-emerald-500',  soft: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  Science:   { dot: 'bg-sky-500',      soft: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
  English:   { dot: 'bg-violet-500',   soft: 'bg-violet-500/10 text-violet-300 border-violet-500/30' },
  Hindi:     { dot: 'bg-fuchsia-500',  soft: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30' },
  GK:        { dot: 'bg-orange-500',   soft: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
};

const EXAM_TYPES = ['SSC GD', 'SSC MTS', 'RRB Group D', 'AOC JOA', 'SSC CHSL', 'RPF'];
const EXAM_STYLES: Record<string, string> = {
  'SSC GD':      'bg-amber-500/10 text-amber-300 border-amber-500/30',
  'SSC MTS':     'bg-sky-500/10 text-sky-300 border-sky-500/30',
  'RRB Group D': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  'AOC JOA':     'bg-violet-500/10 text-violet-300 border-violet-500/30',
  'SSC CHSL':    'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
  'RPF':         'bg-orange-500/10 text-orange-300 border-orange-500/30',
};
const EXAM_LINE_COLOR: Record<string, string> = {
  'SSC GD': '#f59e0b', 'SSC MTS': '#38bdf8', 'RRB Group D': '#34d399',
  'AOC JOA': '#a78bfa', 'SSC CHSL': '#e879f9', 'RPF': '#fb923c',
};

const DEFAULT_SYLLABUS = [
  { id: 'm1', subject: 'Maths', topic: 'Number System & LCM-HCF' },
  { id: 'r1', subject: 'Reasoning', topic: 'Analogy & Classification' },
  { id: 's1', subject: 'Science', topic: 'Physics — Motion & Force' },
  { id: 'e1', subject: 'English', topic: 'Grammar Basics' },
].map((t) => ({ ...t, completed: false, custom: false }));

const KEYS = {
  daily: 'field-daily-logs', mocks: 'field-mock-tests', pyq: 'field-pyq-logs',
  syllabus: 'field-syllabus-v3', weak: 'field-weak-topics', nextPlan: 'field-next-plan',
  todos: 'field-todos', targetDate: 'field-target-date'
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
function uid(prefix: string) { return prefix + '_' + Date.now() + '_' + Math.floor(Math.random() * 10000); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function num(v: any) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }

/* ------------------------------------------------------------------ */
/* Dashboard Components                                               */
/* ------------------------------------------------------------------ */
const inputCls = 'bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder:text-slate-600';

function CardTitle({ icon: Icon, children }: any) {
  return (
    <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3">
      {Icon && <Icon size={13} />} {children}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/* Floating Draggable Timer                                           */
/* ------------------------------------------------------------------ */
const FloatingTimer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Center Position initially
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null);

  useEffect(() => {
    setPos({ x: window.innerWidth - 300, y: window.innerHeight - 250 });
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
    setDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: pos.x, initialY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({ x: dragRef.current.initialX + dx, y: dragRef.current.initialY + dy });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    dragRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div
      style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
      className={`fixed z-50 transition-shadow duration-300 shadow-2xl border border-slate-700/50 ${
        isMinimized ? 'bg-slate-900/90 backdrop-blur-sm rounded-full px-4 py-2.5 flex items-center gap-4' : 'bg-slate-900 rounded-2xl p-5 w-64'
      }`}
    >
      {/* Drag Handle */}
      <div 
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
        className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center cursor-move hover:bg-slate-800/50 rounded-t-2xl"
      >
        <GripHorizontal size={14} className="text-slate-600" />
      </div>

      <div className="mt-4">
        {isMinimized ? (
          <div className="flex items-center gap-3 w-full">
            <TimerIcon size={16} className={`text-amber-500 ${isRunning ? 'animate-pulse' : ''}`} />
            <span className="font-mono font-bold text-slate-100 text-sm tracking-wider">{formatTime(time)}</span>
            <div className="flex items-center gap-1 border-l border-slate-700 pl-3 ml-1">
              <button onClick={() => setIsRunning(!isRunning)} className="text-slate-400 hover:text-amber-500 p-1">
                {isRunning ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button onClick={() => setIsMinimized(false)} className="text-slate-400 hover:text-white p-1"><Maximize2 size={14} /></button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <TimerIcon size={16} className={`text-amber-500 ${isRunning ? 'animate-pulse' : ''}`} /> Study Timer
              </div>
              <button onClick={() => setIsMinimized(true)} className="text-slate-500 hover:text-white bg-slate-800/50 p-1.5 rounded-md"><Minimize2 size={14} /></button>
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
          </>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Application                                                   */
/* ------------------------------------------------------------------ */
export default function ExamPrepPortal() {
  const [tab, setTab] = useState('dashboard');
  const [daily, setDaily] = useState<any[]>([]);
  const [mocks, setMocks] = useState<any[]>([]);
  const [pyq, setPyq] = useState<any[]>([]);
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [weak, setWeak] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [targetDate, setTargetDate] = useState('2026-10-01');

  useEffect(() => {
    const d = localStorage.getItem(KEYS.daily); if (d) setDaily(JSON.parse(d));
    const m = localStorage.getItem(KEYS.mocks); if (m) setMocks(JSON.parse(m));
    const p = localStorage.getItem(KEYS.pyq); if (p) setPyq(JSON.parse(p));
    const s = localStorage.getItem(KEYS.syllabus); if (s) setSyllabus(JSON.parse(s)); else setSyllabus(DEFAULT_SYLLABUS);
    const w = localStorage.getItem(KEYS.weak); if (w) setWeak(JSON.parse(w));
    const t = localStorage.getItem(KEYS.todos); if (t) setTodos(JSON.parse(t));
    const td = localStorage.getItem(KEYS.targetDate); if (td) setTargetDate(td);
  }, []);

  useEffect(() => { localStorage.setItem(KEYS.daily, JSON.stringify(daily)); }, [daily]);
  useEffect(() => { localStorage.setItem(KEYS.mocks, JSON.stringify(mocks)); }, [mocks]);
  useEffect(() => { localStorage.setItem(KEYS.pyq, JSON.stringify(pyq)); }, [pyq]);
  useEffect(() => { localStorage.setItem(KEYS.syllabus, JSON.stringify(syllabus)); }, [syllabus]);
  useEffect(() => { localStorage.setItem(KEYS.weak, JSON.stringify(weak)); }, [weak]);
  useEffect(() => { localStorage.setItem(KEYS.todos, JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem(KEYS.targetDate, targetDate); }, [targetDate]);

  // STREAK LOGIC
  const calculateStreak = () => {
    const dates = [...new Set(daily.map(log => log.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if(dates.length === 0) return 0;
    
    let streak = 0;
    const current = new Date(); current.setHours(0,0,0,0);
    const todayStr = current.toISOString().split('T')[0];
    const yesterday = new Date(current); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if(dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0;

    let checkDate = dates[0] === todayStr ? current : yesterday;
    for(let i = 0; i < dates.length; i++) {
       if(dates[i] === checkDate.toISOString().split('T')[0]) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
       } else { break; }
    }
    return streak;
  }
  const currentStreak = calculateStreak();

  // BACKUP & RESTORE
  const handleExport = () => {
    const data = { daily, mocks, pyq, weak, syllabus, todos, targetDate };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `exam_tracker_backup_${todayStr()}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if(data.daily) setDaily(data.daily); if(data.mocks) setMocks(data.mocks);
        if(data.pyq) setPyq(data.pyq); if(data.weak) setWeak(data.weak);
        if(data.syllabus) setSyllabus(data.syllabus); if(data.todos) setTodos(data.todos);
        alert('Data Successfully Restored!');
      } catch(error) { alert('Invalid Backup File!'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* SIDEBAR */}
      <aside className="w-60 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col py-5 hidden md:flex">
        <div className="px-5 pb-4 mb-2 border-b border-slate-800">
          <div className="text-white font-semibold text-lg mt-1 leading-tight">Field Log Pro</div>
          <div className="text-[11px] text-slate-500 mt-1">Smart Exam Tracker</div>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {[{ id:'dashboard', l:'Dashboard', i:LayoutDashboard }, { id:'daily', l:'Daily Log', i:BookOpen },
            { id:'mocks', l:'Mock Tracker', i:Target }, { id:'todos', l:'To-Do List', i:CheckSquare }
          ].map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${tab === n.id ? 'bg-slate-800 text-white border-l-2 border-amber-400' : 'text-slate-400 hover:bg-slate-800/60'}`}>
              <n.i size={16} />{n.l}
            </button>
          ))}
        </nav>
        <div className="px-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
          <button onClick={handleExport} className="w-full text-xs text-amber-400 border border-amber-500/30 bg-amber-500/10 rounded-md py-1.5 flex justify-center items-center gap-2"><Download size={12}/> Backup Data</button>
          <label className="w-full text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded-md py-1.5 flex justify-center items-center gap-2 cursor-pointer">
            <Upload size={12}/> Restore Data <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </aside>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex overflow-x-auto z-10">
        {[{ id:'dashboard', l:'Dash', i:LayoutDashboard }, { id:'daily', l:'Log', i:BookOpen }, { id:'mocks', l:'Mocks', i:Target }, { id:'todos', l:'Tasks', i:CheckSquare }].map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] ${tab === n.id ? 'text-amber-400' : 'text-slate-500'}`}><n.i size={16} />{n.l}</button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-5 md:p-8 pb-24 md:pb-8 max-w-6xl">
        {tab === 'dashboard' && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row justify-between md:items-end">
              <div><h2 className="text-2xl font-semibold text-white">Mission Control</h2><p className="text-sm text-slate-500">Live Analytics & Targets</p></div>
              
              {/* TARGET COUNTDOWN WIDGET */}
              <div className="mt-4 md:mt-0 flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2">
                <Target size={16} className="text-amber-500"/>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">Exam Target Date</div>
                  <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="bg-transparent text-sm font-mono text-white outline-none"/>
                </div>
                <div className="border-l border-slate-700 pl-3">
                  <div className="text-2xl font-black text-amber-400">{Math.max(0, Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / 86400000))}</div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">Days Left</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex justify-between items-start">
                  <div><div className="text-[11px] uppercase text-slate-400 font-semibold mb-2">Study Streak</div><div className="text-2xl font-mono text-white">{currentStreak} Days</div></div>
                  <Flame size={20} className={currentStreak > 0 ? "text-orange-500" : "text-slate-600"}/>
               </div>
               <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex justify-between items-start">
                  <div><div className="text-[11px] uppercase text-slate-400 font-semibold mb-2">Total Hours</div><div className="text-2xl font-mono text-white">{daily.reduce((s, d) => s + num(d.hours), 0).toFixed(1)}h</div></div>
                  <Clock size={20} className="text-amber-400"/>
               </div>
               <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex justify-between items-start">
                  <div><div className="text-[11px] uppercase text-slate-400 font-semibold mb-2">Mocks Given</div><div className="text-2xl font-mono text-white">{mocks.length}</div></div>
                  <Target size={20} className="text-sky-400"/>
               </div>
               <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex justify-between items-start">
                  <div><div className="text-[11px] uppercase text-slate-400 font-semibold mb-2">Syllabus</div><div className="text-2xl font-mono text-white">{Math.round((syllabus.filter(t=>t.completed).length / (syllabus.length||1))*100)}%</div></div>
                  <ShieldCheck size={20} className="text-emerald-400"/>
               </div>
            </div>

            {/* SUBJECT ANALYTICS RADAR CHART */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <CardTitle icon={TrendingUp}>Subject-wise Strength (Avg Score)</CardTitle>
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <RadarChart data={[
                      { subject: 'Maths', mark: Math.round(mocks.reduce((s, m) => s + num(m.maths), 0) / (mocks.length || 1)) },
                      { subject: 'Reasoning', mark: Math.round(mocks.reduce((s, m) => s + num(m.reasoning), 0) / (mocks.length || 1)) },
                      { subject: 'Language', mark: Math.round(mocks.reduce((s, m) => s + num(m.lang || m.language), 0) / (mocks.length || 1)) },
                      { subject: 'GK', mark: Math.round(mocks.reduce((s, m) => s + num(m.ga), 0) / (mocks.length || 1)) }
                    ]}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 50]} tick={false} />
                      <Radar name="Avg Marks" dataKey="mark" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <CardTitle icon={AlertTriangle}>Urgent To-Do List</CardTitle>
                <div className="space-y-2 mt-4">
                  {todos.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center gap-3 bg-slate-950 p-3 rounded-md border border-slate-800">
                      <input type="checkbox" checked={t.done} readOnly className="accent-amber-500 w-4 h-4"/>
                      <span className={`text-sm ${t.done ? 'line-through text-slate-600' : 'text-slate-300'}`}>{t.text}</span>
                    </div>
                  ))}
                  <button onClick={() => setTab('todos')} className="text-xs text-amber-500 hover:underline mt-2">Manage All Tasks →</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TO-DO LIST TAB */}
        {tab === 'todos' && (
          <div className="space-y-5">
             <h2 className="text-2xl font-semibold text-white">Daily Targets (To-Do)</h2>
             <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <form onSubmit={(e: any) => { e.preventDefault(); const v = e.target.task.value.trim(); if(v) { setTodos([{id: uid('todo'), text: v, done: false}, ...todos]); e.target.reset(); } }} className="flex gap-3 mb-6">
                  <input name="task" placeholder="Add a new target for today..." className={`${inputCls} flex-1`} />
                  <button type="submit" className="bg-amber-500 text-slate-950 px-4 py-2 rounded-md font-semibold text-sm">Add</button>
                </form>
                <div className="space-y-2">
                  {todos.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-md">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setTodos(todos.map(x => x.id === t.id ? {...x, done: !x.done} : x))}>
                        <input type="checkbox" checked={t.done} readOnly className="accent-amber-500 w-4 h-4 cursor-pointer"/>
                        <span className={`text-sm ${t.done ? 'line-through text-slate-600' : 'text-slate-200'}`}>{t.text}</span>
                      </div>
                      <button onClick={() => setTodos(todos.filter(x => x.id !== t.id))} className="text-slate-600 hover:text-rose-500"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* Keep Existing Tabs Basic Placeholders for demo (Daily & Mocks) */}
        {tab === 'daily' && (
           <div className="space-y-5">
             <h2 className="text-2xl font-semibold text-white">Daily Log</h2>
             <form onSubmit={(e:any)=>{e.preventDefault(); setDaily([{id: uid('d'), date: e.target.date.value, subject: e.target.sub.value, topic: e.target.top.value, hours: e.target.hrs.value}, ...daily])}} className="bg-slate-900 p-5 rounded-lg border border-slate-800 grid md:grid-cols-5 gap-3">
               <input name="date" type="date" defaultValue={todayStr()} className={inputCls}/>
               <select name="sub" className={inputCls}>{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select>
               <input name="top" placeholder="Topic" className={`${inputCls} md:col-span-2`}/>
               <input name="hrs" type="number" step="0.5" placeholder="Hours" className={inputCls}/>
               <button type="submit" className="bg-amber-500 text-slate-950 px-4 py-2 rounded-md font-semibold text-sm md:col-span-5 mt-2">Log Study</button>
             </form>
             <div className="bg-slate-900 rounded-lg p-5 border border-slate-800">
               {daily.map(d => <div key={d.id} className="flex justify-between py-2 border-b border-slate-800"><span className="text-slate-300">{d.date} - {d.subject} ({d.topic})</span><span className="text-amber-400">{d.hours}h <Trash2 className="inline ml-2 text-rose-500 cursor-pointer" size={14} onClick={()=>setDaily(daily.filter(x=>x.id!==d.id))}/></span></div>)}
             </div>
           </div>
        )}

        {tab === 'mocks' && (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Mock Tracker</h2>
            <form onSubmit={(e:any)=>{e.preventDefault(); setMocks([{id: uid('m'), type: e.target.type.value, totalScore: e.target.ts.value, maths: e.target.m.value, reasoning: e.target.r.value, lang: e.target.l.value, ga: e.target.g.value, correct: e.target.c.value, incorrect: e.target.i.value }, ...mocks])}} className="bg-slate-900 p-5 rounded-lg border border-slate-800 grid md:grid-cols-4 gap-3">
              <select name="type" className={inputCls}>{EXAM_TYPES.map(s=><option key={s}>{s}</option>)}</select>
              <input name="ts" type="number" placeholder="Total Score" className={inputCls}/>
              <input name="m" type="number" placeholder="Maths" className={inputCls}/>
              <input name="r" type="number" placeholder="Reasoning" className={inputCls}/>
              <input name="l" type="number" placeholder="Lang" className={inputCls}/>
              <input name="g" type="number" placeholder="GK" className={inputCls}/>
              <input name="c" type="number" placeholder="Correct" className={inputCls}/>
              <input name="i" type="number" placeholder="Incorrect" className={inputCls}/>
              <button type="submit" className="bg-amber-500 text-slate-950 px-4 py-2 rounded-md font-semibold text-sm md:col-span-4 mt-2">Log Mock</button>
            </form>
            <div className="bg-slate-900 rounded-lg p-5 border border-slate-800">
               {mocks.map(m => <div key={m.id} className="flex justify-between py-2 border-b border-slate-800"><span className="text-slate-300">{m.type}</span><span className="text-amber-400 font-bold">Score: {m.totalScore} <Trash2 className="inline ml-2 text-rose-500 cursor-pointer" size={14} onClick={()=>setMocks(mocks.filter(x=>x.id!==m.id))}/></span></div>)}
             </div>
          </div>
        )}
      </main>

      <FloatingTimer />
    </div>
  );
}

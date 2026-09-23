import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Check,
  ClipboardList,
  LineChart as LineChartIcon,
  Minus,
  Plus,
  Save,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type MockExam = 'SSC CHSL' | 'Railway Group D' | 'UP Lekhpal';

export type MockWrongTopic = {
  subject: string;
  topic: string;
};

export type MockLog = {
  id: number;
  date: string;
  type: string;
  testName?: string;
  totalScore: number;
  marksObtained?: number;
  accuracy?: number;
  wrongTopics?: MockWrongTopic[];
  // Backward-compatible fields used by older Field Log records.
  maths?: number;
  reasoning?: number;
  lang?: number;
  ga?: number;
  correct?: number;
  incorrect?: number;
};

type MockTrackerProps = {
  mocks: MockLog[];
  setMocks: React.Dispatch<React.SetStateAction<MockLog[]>>;
  selectedExam?: string;
};

type TopicGroup = {
  subject: string;
  hint: string;
  topics: string[];
};

const EXAM_OPTIONS: MockExam[] = [
  'SSC CHSL',
  'Railway Group D',
  'UP Lekhpal',
];

const TOPIC_GROUPS: TopicGroup[] = [
  {
    subject: 'Maths',
    hint: 'गणित',
    topics: [
      'Percentage',
      'Profit & Loss',
      'Time & Work',
      'Simple Interest',
      'Compound Interest',
      'Geometry',
      'Trigonometry',
      'Mensuration',
      'Number System',
      'Algebra',
    ],
  },
  {
    subject: 'Reasoning',
    hint: 'तर्कशक्ति',
    topics: [
      'Syllogism',
      'Blood Relations',
      'Coding-Decoding',
      'Calendar & Clock',
      'Analogy',
      'Series',
    ],
  },
  {
    subject: 'English',
    hint: 'अंग्रेज़ी',
    topics: [
      'Error Spotting',
      'Fill in the blanks',
      'Synonyms / Antonyms',
      'Cloze Test',
      'Reading Comprehension',
    ],
  },
  {
    subject: 'GK & Science & Hindi',
    hint: 'सामान्य ज्ञान, विज्ञान और हिंदी',
    topics: [
      'Indian History',
      'Geography',
      'Physics',
      'Chemistry',
      'Biology',
      'UP Special GK',
      'General Hindi',
    ],
  },
];

const STORAGE_KEY = 'field-log:v1:mocks';
const MIN_ACCURACY = 75;

const examAlias = (exam: string) => {
  if (exam === 'RRB Group D') return 'Railway Group D';
  return exam;
};

const getStoredScore = (mock: MockLog) =>
  Number.isFinite(mock.marksObtained)
    ? Number(mock.marksObtained)
    : Number(mock.totalScore) || 0;

const getStoredAccuracy = (mock: MockLog) => {
  if (Number.isFinite(mock.accuracy)) return Math.max(0, Math.min(100, Number(mock.accuracy)));
  const correct = Number(mock.correct);
  const incorrect = Number(mock.incorrect);
  if (correct + incorrect > 0) {
    return (correct / (correct + incorrect)) * 100;
  }
  return 0;
};

const getWrongTopics = (mock: MockLog): MockWrongTopic[] =>
  Array.isArray(mock.wrongTopics)
    ? mock.wrongTopics.filter(
        topic =>
          topic &&
          typeof topic.subject === 'string' &&
          typeof topic.topic === 'string' &&
          topic.subject.trim() &&
          topic.topic.trim(),
      )
    : [];

const getLegacySubjectScores = (mock: MockLog) => [
  ['Maths', mock.maths],
  ['Reasoning', mock.reasoning],
  ['Language', mock.lang],
  ['GK / GA', mock.ga],
] as const;

const normalizeInitialExam = (value?: string): MockExam =>
  EXAM_OPTIONS.includes(examAlias(value || '') as MockExam)
    ? (examAlias(value || '') as MockExam)
    : 'SSC CHSL';

const MockTracker = ({ mocks, setMocks, selectedExam }: MockTrackerProps) => {
  const [exam, setExam] = useState<MockExam>(normalizeInitialExam(selectedExam));
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [testName, setTestName] = useState('Full Mock 01');
  const [totalScore, setTotalScore] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [wrongTopics, setWrongTopics] = useState<MockWrongTopic[]>([]);
  const [topicFilter, setTopicFilter] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mocks));
    } catch (error) {
      console.warn('Field Log: unable to persist mock tracker.', error);
    }
  }, [mocks]);

  useEffect(() => {
    const external = normalizeInitialExam(selectedExam);
    setExam(external);
  }, [selectedExam]);

  const wrongTopicKey = (subject: string, topic: string) => `${subject}::${topic}`;

  const selectedWrongTopic = (subject: string, topic: string) =>
    wrongTopics.some(item => item.subject === subject && item.topic === topic);

  const toggleWrongTopic = (subject: string, topic: string) => {
    setWrongTopics(previous => {
      const exists = previous.some(
        item => item.subject === subject && item.topic === topic,
      );

      return exists
        ? previous.filter(
            item => !(item.subject === subject && item.topic === topic),
          )
        : [...previous, { subject, topic }];
    });
  };

  const scoreNumber = Number(totalScore);
  const marksNumber = Number(marksObtained);
  const accuracyNumber = Number(accuracy);

  const formError = useMemo(() => {
    if (!date) return 'Mock date is required.';
    if (!testName.trim()) return 'Test name is required.';
    if (!Number.isFinite(scoreNumber) || scoreNumber <= 0) {
      return 'Total Score must be greater than 0.';
    }
    if (!Number.isFinite(marksNumber) || marksNumber < 0) {
      return 'Marks Obtained cannot be negative.';
    }
    if (marksNumber > scoreNumber) {
      return 'Marks Obtained cannot exceed Total Score.';
    }
    if (!Number.isFinite(accuracyNumber) || accuracyNumber < 0 || accuracyNumber > 100) {
      return 'Accuracy must be between 0 and 100%.';
    }
    return '';
  }, [date, testName, scoreNumber, marksNumber, accuracyNumber]);

  const isLowAccuracy = accuracy !== '' && accuracyNumber < MIN_ACCURACY;

  const topicCounts = useMemo(() => {
    const counts = new Map<string, { subject: string; topic: string; count: number }>();

    mocks.forEach(mock => {
      getWrongTopics(mock).forEach(item => {
        const key = wrongTopicKey(item.subject, item.topic);
        const current = counts.get(key);

        counts.set(key, {
          subject: item.subject,
          topic: item.topic,
          count: (current?.count || 0) + 1,
        });
      });
    });

    return [...counts.values()]
      .filter(item => item.count >= 2)
      .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
  }, [mocks]);

  const analytics = useMemo(() => {
    if (!mocks.length) {
      return {
        averageScore: 0,
        highestScore: 0,
        averageAccuracy: 0,
      };
    }

    const scores = mocks.map(getStoredScore);
    const accuracies = mocks.map(getStoredAccuracy);

    return {
      averageScore: scores.reduce((sum, value) => sum + value, 0) / scores.length,
      highestScore: Math.max(...scores),
      averageAccuracy:
        accuracies.reduce((sum, value) => sum + value, 0) / accuracies.length,
    };
  }, [mocks]);

  const trendData = useMemo(() => {
    return [...mocks]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((mock, index) => ({
        label: mock.testName?.trim() || `Mock ${index + 1}`,
        date: mock.date,
        score: getStoredScore(mock),
        accuracy: Number(getStoredAccuracy(mock).toFixed(1)),
      }));
  }, [mocks]);

  const visibleMocks = useMemo(() => {
    if (!selectedExam || selectedExam === 'All Exams') return mocks;
    const normalized = examAlias(selectedExam);
    return mocks.filter(mock => examAlias(mock.type) === normalized);
  }, [mocks, selectedExam]);

  const filteredTopicGroups = useMemo(() => {
    const query = topicFilter.trim().toLowerCase();
    if (!query) return TOPIC_GROUPS;

    return TOPIC_GROUPS
      .map(group => ({
        ...group,
        topics: group.topics.filter(topic =>
          `${group.subject} ${topic}`.toLowerCase().includes(query),
        ),
      }))
      .filter(group => group.topics.length > 0);
  }, [topicFilter]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formError) {
      alert(formError);
      return;
    }

    const score = Number(scoreNumber);
    const marks = Number(marksNumber);
    const acc = Number(accuracyNumber);

    const newMock: MockLog = {
      id: Date.now(),
      date,
      type: exam,
      testName: testName.trim(),
      totalScore: score,
      marksObtained: marks,
      accuracy: acc,
      wrongTopics: [...wrongTopics],
      // Keep parent/dashboard compatibility with the existing tracker.
      correct: marks,
      incorrect: Math.max(0, score - marks),
    };

    setMocks(previous => [newMock, ...previous]);

    setDate(new Date().toISOString().slice(0, 10));
    setTestName('Full Mock 01');
    setTotalScore('');
    setMarksObtained('');
    setAccuracy('');
    setWrongTopics([]);
    setTopicFilter('');
  };

  const deleteMock = (id: number) => {
    if (window.confirm('Is mock result ko delete karna hai?')) {
      setMocks(previous => previous.filter(mock => mock.id !== id));
    }
  };

  const formatNumber = (value: number, digits = 1) =>
    Number.isFinite(value) ? value.toFixed(digits) : '0.0';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase font-bold tracking-widest mb-2">
              <Target size={15} />
              Mock Tracker
              <span className="px-2 py-0.5 rounded-full border border-slate-700 bg-slate-950 text-slate-400 tracking-normal">
                Multi-subject
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 font-serif">
              Mock Test Performance Centre
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Mock result save karo, galat chapters mark karo, aur tracker automatically repeated weak topics detect karega.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 min-w-[260px]">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Mocks</div>
              <div className="text-xl font-mono font-bold text-slate-100 mt-1">{visibleMocks.length}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Weak</div>
              <div className="text-xl font-mono font-bold text-rose-300 mt-1">{topicCounts.length}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Low Accuracy</div>
              <div className="text-xl font-mono font-bold text-amber-300 mt-1">
                {mocks.filter(mock => getStoredAccuracy(mock) < MIN_ACCURACY).length}
              </div>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Log New Mock</h3>
            <p className="text-xs text-slate-500 mt-1">Enter the result first, then mark chapters where you made mistakes or skipped questions.</p>
          </div>
          <ClipboardList className="text-slate-600" size={20} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <label className="block">
            <span className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Exam Type</span>
            <select
              value={exam}
              onChange={event => setExam(event.target.value as MockExam)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
            >
              {EXAM_OPTIONS.map(option => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Test Date</span>
            <input
              required
              type="date"
              value={date}
              onChange={event => setDate(event.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
            />
          </label>

          <label className="block xl:col-span-2">
            <span className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Test Name</span>
            <input
              required
              maxLength={100}
              type="text"
              value={testName}
              onChange={event => setTestName(event.target.value)}
              placeholder="Full Mock 01"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-amber-500"
            />
          </label>

          <label className="block">
            <span className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Total Score</span>
            <input
              required
              min="0.5"
              step="0.5"
              type="number"
              value={totalScore}
              onChange={event => setTotalScore(event.target.value)}
              placeholder="200"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
            />
          </label>

          <label className="block">
            <span className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Marks Obtained</span>
            <input
              required
              min="0"
              step="0.5"
              type="number"
              value={marksObtained}
              onChange={event => setMarksObtained(event.target.value)}
              placeholder="148"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
            />
          </label>

          <label className="block">
            <span className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Accuracy %</span>
            <input
              required
              min="0"
              max="100"
              step="0.1"
              type="number"
              value={accuracy}
              onChange={event => setAccuracy(event.target.value)}
              placeholder="82.5"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
            />
          </label>

          <div className="xl:col-span-2 flex items-end">
            {formError ? (
              <div className="w-full rounded-lg border border-rose-900/60 bg-rose-950/20 px-3 py-2.5 text-xs text-rose-300">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle size={14} />
                  {formError}
                </div>
              </div>
            ) : isLowAccuracy ? (
              <div className="w-full rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-2.5 text-xs text-amber-200">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle size={14} />
                  Low Accuracy Warning!
                </div>
                <div className="text-[10px] text-amber-300/70 mt-0.5">Accuracy is below {MIN_ACCURACY}%.</div>
              </div>
            ) : (
              <div className="w-full rounded-lg border border-emerald-900/60 bg-emerald-950/20 px-3 py-2.5 text-xs text-emerald-300">
                Ready to save this mock result.
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div>
              <h4 className="font-semibold text-slate-200">Wrong / Skipped Topics</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Har subject se jitne chapters applicable hain select karo.
                <span className="text-slate-300 ml-1">{wrongTopics.length} selected</span>
              </p>
            </div>
            <div className="relative md:w-72">
              <input
                type="search"
                value={topicFilter}
                onChange={event => setTopicFilter(event.target.value)}
                placeholder="Filter chapters…"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-amber-500"
              />
              {topicFilter && (
                <button
                  type="button"
                  onClick={() => setTopicFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-200"
                  aria-label="Clear topic filter"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
            {filteredTopicGroups.map(group => (
              <div key={group.subject} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-200">{group.subject}</h5>
                    <p className="text-[10px] text-slate-600">({group.hint})</p>
                  </div>
                  <span className="text-[10px] text-slate-600">{group.topics.length} chapters</span>
                </div>

                <div className="space-y-1.5">
                  {group.topics.map(topic => {
                    const checked = selectedWrongTopic(group.subject, topic);
                    return (
                      <label
                        key={wrongTopicKey(group.subject, topic)}
                        className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 cursor-pointer transition-colors ${
                          checked
                            ? 'bg-rose-950/30 border-rose-500/40 text-rose-100'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleWrongTopic(group.subject, topic)}
                          className="h-4 w-4 accent-rose-500"
                        />
                        <span className="text-xs">{topic}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-500">
            Selected: <span className="text-slate-300 font-semibold">{wrongTopics.length}</span> wrong/skipped chapters
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            <Save size={16} />
            Save Mock Result
          </button>
        </div>
      </form>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <BarChart3 className="text-amber-500" size={18} />
              Performance Analytics
            </h3>
            <p className="text-xs text-slate-500 mt-1">Score and accuracy trends across your saved mock history.</p>
          </div>
          <TrendingUp size={18} className="text-slate-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Average Score</div>
            <div className="text-2xl font-mono font-bold text-slate-100 mt-1">{formatNumber(analytics.averageScore)}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Highest Score</div>
            <div className="text-2xl font-mono font-bold text-emerald-300 mt-1">{formatNumber(analytics.highestScore)}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Avg Accuracy</div>
            <div className="text-2xl font-mono font-bold text-amber-300 mt-1">{formatNumber(analytics.averageAccuracy)}%</div>
          </div>
        </div>

        {trendData.length ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="score" name="Marks Obtained" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-56 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-sm text-slate-500">
            No mock data yet. Save your first mock to start the trend.
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-600">
          <LineChartIcon size={14} />
          Score is plotted from Marks Obtained; older legacy records fall back to their previous score field.
        </div>
      </section>

      <section className="bg-slate-900 border border-rose-900/40 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="text-rose-400" size={18} />
              Auto-Detected Weak Topics
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Kisi chapter ko 2+ mocks me wrong/skipped mark karte hi engine usse yahan promote karta hai.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 text-[10px] uppercase tracking-wider font-bold text-rose-300">
            Engine Active
          </div>
        </div>

        {topicCounts.length ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {topicCounts.map(item => {
              const critical = item.count >= 3;
              return (
                <div
                  key={wrongTopicKey(item.subject, item.topic)}
                  className={`rounded-xl border p-4 ${
                    critical
                      ? 'border-rose-500/40 bg-rose-950/25'
                      : 'border-amber-500/30 bg-amber-950/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-100 truncate">{item.topic}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.subject}</div>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold ${
                        critical
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {critical ? `Critical Risk (${item.count} times)` : `Moderate Risk (2 times)`}
                    </span>
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2.5">
                    <AlertTriangle size={14} className={critical ? 'text-rose-400 mt-0.5' : 'text-amber-400 mt-0.5'} />
                    <p className="text-xs text-slate-300">
                      <span className="font-semibold text-slate-100">Action Required:</span>{' '}
                      Review concepts and solve 20+ PYQs.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-800 px-4 py-8 text-center text-sm text-slate-500">
            Weak topic engine active. Mark wrong/skipped chapters in mocks to generate automatic recommendations.
          </div>
        )}
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Mock History</h3>
              <p className="text-xs text-slate-500 mt-1">All saved mocks are stored locally and can be deleted individually.</p>
            </div>
            <div className="text-xs text-slate-500">
              Showing <span className="text-slate-200 font-semibold">{visibleMocks.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-950 text-slate-500 text-[10px] uppercase tracking-wider">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Test</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right">Accuracy</th>
                <th className="px-4 py-3 text-center">Wrong Topics</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-300">
              {visibleMocks.map(mock => {
                const acc = getStoredAccuracy(mock);
                const score = getStoredScore(mock);
                const topics = getWrongTopics(mock);

                return (
                  <tr key={mock.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{mock.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-semibold text-slate-300">
                        {examAlias(mock.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{mock.testName || 'Legacy Mock'}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {Number.isFinite(mock.marksObtained) ? `${score} / ${mock.totalScore}` : `${score} score`}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-300">{formatNumber(score)}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex px-2 py-1 rounded-md border text-[10px] font-mono font-bold ${
                          acc < MIN_ACCURACY
                            ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                            : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {formatNumber(acc)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{topics.length}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteMock(mock.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-800 text-slate-600 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                        aria-label="Delete mock"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!visibleMocks.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-600">
                    No mock records for this exam yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-500">
        <span className="text-slate-300 font-semibold">Weak-topic rule:</span>{' '}
        Same subject + chapter marked wrong/skipped in 2 or more saved mocks becomes an automatic weak-topic signal.
      </div>
    </div>
  );
};

export default MockTracker;

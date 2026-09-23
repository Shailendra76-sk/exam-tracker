import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Circle,
  Download,
  Filter,
  Layers3,
  Upload,
} from 'lucide-react';
import {
  EXAM_FILTERS,
  MASTER_SUBJECTS,
  MASTER_SYLLABUS,
  normalizeMasterExam,
  SUBJECT_FILTER_HINTS,
  type MasterExamFilter,
  type MasterSubject,
  type SubjectChapter,
  type SubtopicStatus,
} from '../data/masterSyllabusData';

const STORAGE_KEY = 'field-log:v3:master-syllabus';
const LEGACY_MATHS_KEY = 'field-log:v2:master-syllabus:maths';
const BACKUP_VERSION = 2;

const STATUS_ORDER: SubtopicStatus[] = [
  'Not Started',
  'Learning',
  'Completed',
  'Revision',
];

const STATUS_META: Record<
  SubtopicStatus,
  { label: string; classes: string; iconClasses: string }
> = {
  'Not Started': {
    label: 'Not Started',
    classes: 'bg-slate-950 border-slate-800 text-slate-300',
    iconClasses: 'text-slate-500',
  },
  Learning: {
    label: 'Learning',
    classes: 'bg-amber-950/40 border-amber-500/40 text-amber-100',
    iconClasses: 'text-amber-400',
  },
  Completed: {
    label: 'Completed',
    classes: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100',
    iconClasses: 'text-emerald-400',
  },
  Revision: {
    label: 'Revision',
    classes: 'bg-purple-950/40 border-purple-500/40 text-purple-100',
    iconClasses: 'text-purple-400',
  },
};

const SUBJECT_META: Record<
  MasterSubject,
  { emoji: string; short: string; active: string }
> = {
  Maths: {
    emoji: '🧮',
    short: 'Maths',
    active: 'border-amber-500 bg-amber-500/10 text-amber-300',
  },
  Reasoning: {
    emoji: '🧠',
    short: 'Reasoning',
    active: 'border-emerald-500 bg-emerald-500/10 text-emerald-300',
  },
  English: {
    emoji: '🔤',
    short: 'English',
    active: 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300',
  },
  'GK & Science': {
    emoji: '🌍',
    short: 'GK & Science',
    active: 'border-sky-500 bg-sky-500/10 text-sky-300',
  },
  'General Hindi': {
    emoji: '✍️',
    short: 'General Hindi',
    active: 'border-rose-500 bg-rose-500/10 text-rose-300',
  },
  Computer: {
    emoji: '🖥️',
    short: 'Computer',
    active: 'border-cyan-500 bg-cyan-500/10 text-cyan-300',
  },
};

const allSubtopicIds = MASTER_SUBJECTS.flatMap(subject =>
  MASTER_SYLLABUS[subject].flatMap(section =>
    section.chapters.flatMap(chapter => chapter.subtopics.map(item => item.id)),
  ),
);

const createInitialProgress = (): Record<string, SubtopicStatus> =>
  Object.fromEntries(
    allSubtopicIds.map(id => [id, 'Not Started' as SubtopicStatus]),
  );

const sanitizeProgress = (candidate: unknown): Record<string, SubtopicStatus> => {
  const restored = createInitialProgress();

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return restored;
  }

  const source = candidate as Record<string, unknown>;
  allSubtopicIds.forEach(id => {
    const status = source[id];
    if (typeof status === 'string' && STATUS_ORDER.includes(status as SubtopicStatus)) {
      restored[id] = status as SubtopicStatus;
    }
  });

  return restored;
};

const loadInitialProgress = (): Record<string, SubtopicStatus> => {
  if (typeof window === 'undefined') return createInitialProgress();

  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current) {
      const parsed = JSON.parse(current) as unknown;
      if (
        parsed &&
        typeof parsed === 'object' &&
        'progress' in parsed
      ) {
        return sanitizeProgress((parsed as { progress?: unknown }).progress);
      }
      return sanitizeProgress(parsed);
    }

    const legacy = window.localStorage.getItem(LEGACY_MATHS_KEY);
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy) as unknown;
      return sanitizeProgress(
        parsedLegacy &&
          typeof parsedLegacy === 'object' &&
          'progress' in parsedLegacy
          ? (parsedLegacy as { progress?: unknown }).progress
          : parsedLegacy,
      );
    }
  } catch {
    // Fall back to clean progress.
  }

  return createInitialProgress();
};

const buildSnapshot = (
  progress: Record<string, SubtopicStatus>,
  filter: MasterExamFilter,
  subject: MasterSubject,
) => {
  const chapters = MASTER_SYLLABUS[subject].flatMap(section => section.chapters);
  const relevant = filter === 'All Exams'
    ? chapters
    : chapters;

  const all = relevant.flatMap(chapter => chapter.subtopics);
  const completed = all.filter(item => progress[item.id] === 'Completed').length;
  const learning = all.filter(item => progress[item.id] === 'Learning').length;
  const revision = all.filter(item => progress[item.id] === 'Revision').length;

  return {
    total: all.length,
    completed,
    learning,
    revision,
    tracked: all.filter(item => progress[item.id] !== 'Not Started').length,
    percent: Math.round((completed / Math.max(1, all.length)) * 100),
  };
};

const scopeFor = (chapter: SubjectChapter, filter: MasterExamFilter) => {
  if (filter === 'All Exams') return 'core' as const;
  return chapter.scope[filter];
};

const MasterSyllabus = ({
  selectedExam,
  onSelectedExamChange,
}: {
  selectedExam?: string;
  onSelectedExamChange?: (exam: string) => void;
}) => {
  const externalFilter = normalizeMasterExam(selectedExam);
  const [activeFilter, setActiveFilter] = useState<MasterExamFilter>(externalFilter);
  const [activeSubject, setActiveSubject] = useState<MasterSubject>('Maths');
  const [progress, setProgress] = useState<Record<string, SubtopicStatus>>(loadInitialProgress);
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({
    percentage: true,
    syllogism: true,
    'error-spotting': true,
    'indian-history': true,
    sandhi: true,
    'computer-basics': true,
  });
  const importRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          app: 'Field Log',
          component: 'MasterSyllabus',
          version: BACKUP_VERSION,
          subject: 'Multi Subject',
          progress,
        }),
      );
    } catch {
      // Best-effort browser persistence.
    }
  }, [progress]);

  useEffect(() => {
    setActiveFilter(externalFilter);
  }, [externalFilter]);

  const stats = useMemo(
    () => buildSnapshot(progress, activeFilter, activeSubject),
    [progress, activeFilter, activeSubject],
  );

  const chapters = useMemo(
    () => MASTER_SYLLABUS[activeSubject].flatMap(section => section.chapters),
    [activeSubject],
  );

  const cycleStatus = (id: string) => {
    setProgress(previous => {
      const current = previous[id] ?? 'Not Started';
      const index = STATUS_ORDER.indexOf(current);
      const next = STATUS_ORDER[(index + 1) % STATUS_ORDER.length];
      return { ...previous, [id]: next };
    });
  };

  const setFilter = (filter: MasterExamFilter) => {
    setActiveFilter(filter);
    onSelectedExamChange?.(filter);
  };

  const toggleChapter = (id: string) => {
    setOpenChapters(previous => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  const chapterProgress = (chapter: SubjectChapter) => {
    const completed = chapter.subtopics.filter(
      item => progress[item.id] === 'Completed',
    ).length;
    const percent = Math.round(
      (completed / Math.max(1, chapter.subtopics.length)) * 100,
    );

    return {
      completed,
      total: chapter.subtopics.length,
      percent,
      tracked: chapter.subtopics.filter(
        item => progress[item.id] !== 'Not Started',
      ).length,
    };
  };

  const exportBackup = () => {
    const payload = {
      app: 'Field Log',
      component: 'MasterSyllabus',
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      activeSubject,
      activeFilter,
      progress,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `field-log-master-syllabus-${activeSubject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
    if (file.size > 2_000_000) {
      alert('Backup file 2 MB se chhoti honi chahiye.');
      return;
    }

    try {
      const payload = JSON.parse(await file.text()) as {
        app?: unknown;
        component?: unknown;
        version?: unknown;
        progress?: unknown;
        activeSubject?: unknown;
        activeFilter?: unknown;
      };

      if (
        payload.app !== 'Field Log' ||
        payload.component !== 'MasterSyllabus' ||
        payload.version !== BACKUP_VERSION ||
        !payload.progress ||
        typeof payload.progress !== 'object'
      ) {
        throw new Error('Invalid MasterSyllabus backup');
      }

      setProgress(sanitizeProgress(payload.progress));

      if (
        typeof payload.activeSubject === 'string' &&
        MASTER_SUBJECTS.includes(payload.activeSubject as MasterSubject)
      ) {
        setActiveSubject(payload.activeSubject as MasterSubject);
      }

      if (
        typeof payload.activeFilter === 'string' &&
        EXAM_FILTERS.includes(payload.activeFilter as MasterExamFilter)
      ) {
        const filter = payload.activeFilter as MasterExamFilter;
        setActiveFilter(filter);
        onSelectedExamChange?.(filter);
      }

      alert('MasterSyllabus backup restore ho gaya.');
    } catch (error) {
      console.error('MasterSyllabus import failed:', error);
      alert('MasterSyllabus backup file valid nahi hai.');
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-amber-400 text-xs uppercase font-bold tracking-widest mb-2">
              <BookOpen size={15} />
              Master Syllabus
              <span className="px-2 py-0.5 rounded-full border border-slate-700 bg-slate-950 text-slate-400 tracking-normal">
                Multi Subject
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 font-serif">
              Government Exam MasterSyllabus
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-4xl">
              SSC 12th-level + RRB 12th-level + AOC JOA + UP-focused preparation ko ek shared subject-wise tracker me manage karo. हर chapter ke andar subtopic-level progress alag save hoti hai.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <button
              type="button"
              onClick={exportBackup}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 hover:border-amber-500 hover:text-amber-300 transition-colors text-xs font-semibold"
            >
              <Download size={15} />
              Export Backup
            </button>

            <button
              type="button"
              onClick={() => importRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 hover:border-emerald-500 hover:text-emerald-300 transition-colors text-xs font-semibold"
            >
              <Upload size={15} />
              Import Backup
            </button>

            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) void importBackup(file);
              }}
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
          <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-wider font-semibold text-slate-400">
            <Filter size={14} />
            Smart Hybrid Exam Filter
          </div>

          <div className="flex flex-wrap gap-2">
            {EXAM_FILTERS.map(filter => {
              const active = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setFilter(filter)}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${active ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/10' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500'}`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            Selected exam filter ke hisaab se out-of-core chapters dim + <span className="text-slate-300 font-semibold">Extra</span> badge ke saath visible rahenge.
          </p>
        </div>

        <div className="mt-4 -mx-1 px-1 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {MASTER_SUBJECTS.map(subject => {
              const active = activeSubject === subject;
              const meta = SUBJECT_META[subject];

              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => setActiveSubject(subject)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all ${active ? meta.active + ' shadow-sm' : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'}`}
                  aria-pressed={active}
                >
                  <span aria-hidden="true">{meta.emoji}</span>
                  {meta.short}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p className="text-xs text-slate-500">
            {SUBJECT_FILTER_HINTS[activeSubject]}
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider font-bold">
            <span className="px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-500">
              {activeFilter}
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-500">
              {stats.tracked}/{stats.total} tracked
            </span>
            <span className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              {stats.percent}% completed
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Subject Completion</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{stats.percent}%</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Completed</div>
          <div className="text-2xl font-mono font-bold text-slate-100 mt-1">{stats.completed}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Learning</div>
          <div className="text-2xl font-mono font-bold text-amber-300 mt-1">{stats.learning}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Revision</div>
          <div className="text-2xl font-mono font-bold text-purple-300 mt-1">{stats.revision}</div>
        </div>
      </section>

      <div className="space-y-4">
        {MASTER_SYLLABUS[activeSubject].map(section => {
          const sectionTopics = section.chapters.flatMap(chapter => chapter.subtopics);
          const sectionCompleted = sectionTopics.filter(
            item => progress[item.id] === 'Completed',
          ).length;
          const sectionPercent = Math.round(
            (sectionCompleted / Math.max(1, sectionTopics.length)) * 100,
          );

          return (
            <section
              key={section.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/80">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Layers3 size={16} className="text-amber-500" />
                      <h3 className="font-semibold text-slate-100">{section.title}</h3>
                      {section.priority && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                          Priority
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{section.hint}</p>
                  </div>

                  <div className="w-full md:w-72">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                      <span>Section progress</span>
                      <span>{sectionCompleted}/{sectionTopics.length}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${sectionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-800">
                {section.chapters.map(chapter => {
                  const isExtra =
                    activeFilter !== 'All Exams' &&
                    scopeFor(chapter, activeFilter) === 'extra';
                  const chapterState = chapterProgress(chapter);
                  const isOpen = Boolean(openChapters[chapter.id]);

                  return (
                    <div
                      key={chapter.id}
                      className={`transition-opacity ${isExtra ? 'opacity-50' : 'opacity-100'}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleChapter(chapter.id)}
                        aria-expanded={isOpen}
                        className="w-full text-left px-5 py-4 hover:bg-slate-800/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70"
                      >
                        <div className="flex items-center gap-3">
                          <span className="shrink-0 text-slate-500">
                            {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm md:text-base font-semibold text-slate-200">
                                {chapter.title} <span className="text-slate-500 font-normal">({chapter.hint})</span>
                              </h4>

                              {isExtra ? (
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[9px] uppercase tracking-wider font-bold text-slate-400">
                                  Extra
                                </span>
                              ) : activeFilter !== 'All Exams' ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] uppercase tracking-wider font-bold text-emerald-400">
                                  Core
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {chapterState.tracked}/{chapterState.total} subtopics tracked
                            </p>
                          </div>

                          <div className="hidden sm:block text-right shrink-0">
                            <div className="text-xs font-mono text-slate-300">
                              {chapterState.completed}/{chapterState.total}
                            </div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-600">
                              Completed
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 ml-7 sm:ml-8 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-500"
                              style={{ width: `${chapterState.percent}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-[10px] font-mono text-slate-500">
                            {chapterState.percent}%
                          </span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4 pl-10 md:pl-14 space-y-2">
                          {chapter.subtopics.map(subtopic => {
                            const status = progress[subtopic.id] ?? 'Not Started';
                            const meta = STATUS_META[status];

                            return (
                              <button
                                key={subtopic.id}
                                type="button"
                                role="checkbox"
                                aria-checked={status === 'Completed'}
                                onClick={() => cycleStatus(subtopic.id)}
                                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 ${meta.classes}`}
                                title="Click to cycle: Not Started → Learning → Completed → Revision"
                              >
                                <span className={`mt-0.5 shrink-0 ${meta.iconClasses}`}>
                                  {status === 'Not Started' ? (
                                    <Circle size={18} />
                                  ) : (
                                    <CheckCircle size={18} />
                                  )}
                                </span>

                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`text-sm font-medium ${status === 'Completed' ? 'text-emerald-100 line-through decoration-emerald-500/60' : 'text-slate-200'}`}
                                    >
                                      {subtopic.title}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">
                                      {meta.label}
                                    </span>
                                  </span>
                                  <span className="block text-xs text-slate-500 mt-1">
                                    ({subtopic.hint})
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-500">
        <span className="text-slate-300 font-semibold">Status loop:</span>{' '}
        Not Started → Learning → Completed → Revision → Not Started. Progress all six subjects ke liye independently browser me save hoti hai.
      </div>
    </div>
  );
};

export default MasterSyllabus;

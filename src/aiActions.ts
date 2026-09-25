export type AIAgentActionType =
  | 'navigate'
  | 'set_exam'
  | 'add_daily_log'
  | 'add_pyq_log'
  | 'add_mock'
  | 'add_weak_topic'
  | 'set_next_plan'
  | 'set_planner_goal'
  | 'set_planner_task'
  | 'set_syllabus_topic'
  | 'set_theme'
  | 'export_backup'
  | 'reset_all_data';

export type AIAgentAction = {
  id?: string;
  type: AIAgentActionType;
  payload?: Record<string, unknown>;
  requiresConfirmation?: boolean;
};

export const ALLOWED_NAV_TABS = [
  'ai-bot',
  'dashboard',
  'daily',
  'mocks',
  'pyq',
  'timetable',
  'weak',
  'syllabus',
  'planner',
  'admin',
] as const;

export const ALLOWED_EXAMS = [
  'All Exams',
  'SSC CHSL',
  'SSC MTS',
  'SSC GD',
  'RRB Group D',
  'RRB NTPC',
  'RRB NTPC (12th Level)',
  'AOC JOA',
  'AOC JOA (12th Level)',
  'UP Lekhpal',
  'RPF',
  '12th-Level Govt Core',
] as const;

export const ALLOWED_THEMES = ['dark', 'light'] as const;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const stringValue = (value: unknown, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export const numberValue = (
  value: unknown,
  min: number,
  max: number,
) => {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(max, Math.max(min, number))
    : null;
};

export function validateAIAgentAction(
  action: unknown,
): AIAgentAction | null {
  if (!isRecord(action)) return null;

  const type = action.type;
  if (
    typeof type !== 'string' ||
    !([
      'navigate',
      'set_exam',
      'add_daily_log',
      'add_pyq_log',
      'add_mock',
      'add_weak_topic',
      'set_next_plan',
      'set_planner_goal',
      'set_planner_task',
      'set_syllabus_topic',
      'set_theme',
      'export_backup',
      'reset_all_data',
    ] as string[]).includes(type)
  ) {
    return null;
  }

  const payload = isRecord(action.payload)
    ? action.payload
    : {};

  const safe: AIAgentAction = {
    type: type as AIAgentActionType,
    payload,
    requiresConfirmation:
      action.requiresConfirmation === true ||
      type === 'reset_all_data',
  };

  if (type === 'navigate') {
    const tab = stringValue(payload.tab, 30);
    if (!ALLOWED_NAV_TABS.includes(tab as (typeof ALLOWED_NAV_TABS)[number])) {
      return null;
    }
    safe.payload = { tab };
    return safe;
  }

  if (type === 'set_exam') {
    const exam = stringValue(payload.exam, 80);
    if (!ALLOWED_EXAMS.includes(exam as (typeof ALLOWED_EXAMS)[number])) {
      return null;
    }
    safe.payload = { exam };
    return safe;
  }

  if (type === 'set_theme') {
    const theme = stringValue(payload.theme, 10);
    if (!ALLOWED_THEMES.includes(theme as (typeof ALLOWED_THEMES)[number])) {
      return null;
    }
    safe.payload = { theme };
    return safe;
  }

  if (type === 'set_planner_goal') {
    const hours = numberValue(payload.hours, 1, 16);
    if (hours === null) return null;
    safe.payload = { hours };
    return safe;
  }

  if (type === 'set_next_plan') {
    const plan = stringValue(payload.plan, 1000);
    if (!plan) return null;
    safe.payload = { plan };
    return safe;
  }

  if (type === 'set_planner_task') {
    const key = stringValue(payload.key, 160);
    if (!key || typeof payload.done !== 'boolean') return null;
    safe.payload = { key, done: payload.done };
    return safe;
  }

  if (type === 'set_syllabus_topic') {
    const subject = stringValue(payload.subject, 80);
    const topicId = stringValue(payload.topicId, 120);
    if (!subject || !topicId || typeof payload.completed !== 'boolean') {
      return null;
    }
    safe.payload = {
      subject,
      topicId,
      completed: payload.completed,
    };
    return safe;
  }

  if (type === 'add_daily_log') {
    const subject = stringValue(payload.subject, 80);
    const topic = stringValue(payload.topic, 240);
    const exam = stringValue(payload.exam, 80) || 'All Exams';
    const date =
      stringValue(payload.date, 20) ||
      new Date().toISOString().slice(0, 10);
    const hours = numberValue(payload.hours, 0.25, 16);
    const notes = stringValue(payload.notes, 500);
    if (!subject || !topic || hours === null) return null;
    safe.payload = { exam, subject, topic, date, hours, notes };
    return safe;
  }

  if (type === 'add_pyq_log') {
    const subject = stringValue(payload.subject, 80);
    const topic = stringValue(payload.topic, 240);
    const exam = stringValue(payload.exam, 80) || 'All Exams';
    const date =
      stringValue(payload.date, 20) ||
      new Date().toISOString().slice(0, 10);
    const sets = numberValue(payload.sets, 1, 100);
    const shiftYear = stringValue(payload.shiftYear, 160);
    const notes = stringValue(payload.notes, 500);
    if (!subject || !topic || sets === null) return null;
    safe.payload = {
      exam,
      subject,
      topic,
      date,
      sets: Math.round(sets),
      shiftYear,
      notes,
    };
    return safe;
  }

  if (type === 'add_weak_topic') {
    const subject = stringValue(payload.subject, 80);
    const topic = stringValue(payload.topic, 240);
    const exam = stringValue(payload.exam, 80) || 'All Exams';
    const count = numberValue(payload.count, 1, 999);
    const lastDate =
      stringValue(payload.lastDate, 20) ||
      new Date().toISOString().slice(0, 10);
    if (!subject || !topic || count === null) return null;
    safe.payload = {
      exam,
      subject,
      topic,
      count: Math.round(count),
      lastDate,
    };
    return safe;
  }

  if (type === 'add_mock') {
    const typeName = stringValue(payload.exam, 80) || 'SSC CHSL';
    const testName = stringValue(payload.testName, 160) || 'AI Added Mock';
    const date =
      stringValue(payload.date, 20) ||
      new Date().toISOString().slice(0, 10);
    const totalScore = numberValue(payload.totalScore, 1, 1000);
    const marksObtained = numberValue(
      payload.marksObtained ?? payload.score,
      0,
      1000,
    );
    const accuracy = numberValue(payload.accuracy, 0, 100);
    if (totalScore === null || marksObtained === null) return null;
    safe.payload = {
      exam: typeName,
      testName,
      date,
      totalScore,
      marksObtained: Math.min(totalScore, marksObtained),
      accuracy: accuracy ?? 0,
    };
    return safe;
  }

  if (type === 'export_backup') {
    safe.payload = {};
    return safe;
  }

  if (type === 'reset_all_data') {
    safe.payload = {};
    safe.requiresConfirmation = true;
    return safe;
  }

  return null;
}

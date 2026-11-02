import { useState } from 'react';
import { feedback } from '../engine/feedback';
import type { Outcome, SaveState } from '../engine/progress';
import type { Exercise, TrackId } from '../engine/types';
import type { WidgetState } from '../components/exercises/common';

export interface SessionItem {
  id: string;
  track: TrackId;
  exercise: Exercise;
}

/** lesson/boss/review: hint after the first miss, answer after the second.
 * test (skip-ahead): one try each, no hints. */
export type SessionMode = 'lesson' | 'boss' | 'review' | 'test' | 'exam';

export interface SessionResultItem {
  id: string;
  outcome: Outcome;
}

export const KIND_LABEL: Record<Exercise['kind'], string> = {
  fill: 'Fill in the blank',
  build: 'Build the code',
  order: 'Put it in order',
  fix: 'Find the bug',
  type: 'Write the line',
  write: 'Write the code',
};

export const MODE_LABEL: Record<SessionMode, string> = {
  lesson: '',
  boss: '👾 Boss · ',
  test: '🚀 Skip test · ',
  exam: '🎓 Final exam · ',
  review: '🔁 Review · ',
};

export type Status = 'answering' | 'hint' | 'solved' | 'revealed';

const blankState: WidgetState = { ready: false, correct: false, code: '' };

function initialCode(ex: Exercise): string {
  switch (ex.kind) {
    case 'fill':
      return ex.code.replace(/___/g, '');
    case 'fix':
      return ex.code.replace(/\[\[(.+?)\]\]/, '$1');
    case 'type':
      return ex.template?.replace('___', '') ?? '';
    default:
      return '';
  }
}

/** The answer/check/continue loop shared by the phone and desktop session
 * screens. */
export function useSessionRunner({
  items,
  mode,
  settings,
  onDone,
}: {
  items: SessionItem[];
  mode: SessionMode;
  settings: SaveState['settings'];
  onDone: (results: SessionResultItem[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>('answering');
  const [misses, setMisses] = useState(0);
  const [widget, setWidget] = useState<WidgetState>(() => ({ ...blankState, code: initialCode(items[0].exercise) }));
  const [results, setResults] = useState<SessionResultItem[]>([]);
  const [shaking, setShaking] = useState(false);

  const item = items[index];
  const locked = status === 'solved' || status === 'revealed';

  const check = () => {
    if (widget.correct) {
      feedback('correct', settings);
      setStatus('solved');
      setResults((r) => [...r, { id: item.id, outcome: misses === 0 ? 'first' : 'hinted' }]);
      return;
    }
    feedback('wrong', settings);
    setShaking(true);
    const m = misses + 1;
    setMisses(m);
    // Writing several lines gets one extra try before the answer is shown.
    if (mode === 'test' || mode === 'exam' || m >= (item.exercise.kind === 'write' ? 3 : 2)) {
      setStatus('revealed');
      setResults((r) => [...r, { id: item.id, outcome: 'revealed' }]);
    } else {
      setStatus('hint');
    }
  };

  const next = () => {
    if (index + 1 >= items.length) {
      feedback('complete', settings);
      onDone(results);
      return;
    }
    const n = index + 1;
    setIndex(n);
    setStatus('answering');
    setMisses(0);
    setWidget({ ...blankState, code: initialCode(items[n].exercise) });
  };

  return {
    item,
    index,
    status,
    misses,
    locked,
    widget,
    setWidget,
    shaking,
    stopShaking: () => setShaking(false),
    check,
    next,
    tap: () => feedback('tap', settings),
  };
}

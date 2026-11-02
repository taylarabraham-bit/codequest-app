import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { checkType } from '../../engine/check';
import { feedback } from '../../engine/feedback';
import type { Outcome, SaveState } from '../../engine/progress';
import type { Tour } from '../../engine/types';
import { MockTerminal, OLLAMA_PROMPT, PS_PROMPT, type TermEntry } from '../../components/desktop/MockTerminal';
import { MOCK_NAMES, MOCKS } from '../../components/desktop/mocks';

type Status = 'answering' | 'hint' | 'solved' | 'revealed';

/** A tool tour: instructions on the left, a clickable mock of the real tool on
 * the right. Same rules as a lesson: a hint after one miss, the answer after
 * two. */
export function TourSession({
  tour,
  settings,
  onDone,
  onQuit,
}: {
  tour: Tour;
  settings: SaveState['settings'];
  onDone: (outcomes: Outcome[]) => void;
  onQuit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>('answering');
  const [misses, setMisses] = useState(0);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [typed, setTyped] = useState('');
  const [log, setLog] = useState<TermEntry[]>([]);
  const [shaking, setShaking] = useState(false);
  const screen = useRef<HTMLDivElement>(null);
  const continueBtn = useRef<HTMLButtonElement>(null);

  const step = tour.steps[index];
  const isCommand = 'command' in step;
  const locked = status === 'solved' || status === 'revealed';
  const Mock = MOCKS[tour.screen];
  const prompt = isCommand && step.command[0].startsWith('/') ? OLLAMA_PROMPT : tour.screen === 'devtools' ? '> ' : PS_PROMPT;

  const answer = (right: boolean) => {
    if (locked) return;
    if (right) {
      feedback('correct', settings);
      setStatus('solved');
      setOutcomes((o) => [...o, misses === 0 ? 'first' : 'hinted']);
      return;
    }
    feedback('wrong', settings);
    setShaking(true);
    const m = misses + 1;
    setMisses(m);
    if (m >= 2) {
      setStatus('revealed');
      setOutcomes((o) => [...o, 'revealed']);
    } else setStatus('hint');
  };

  const next = () => {
    if (isCommand) setLog((l) => [...l, { prompt, cmd: status === 'revealed' ? step.command[0] : typed, out: step.output }]);
    if (index + 1 >= tour.steps.length) {
      feedback('complete', settings);
      onDone(outcomes);
      return;
    }
    setIndex(index + 1);
    setStatus('answering');
    setMisses(0);
    setTyped('');
  };

  // Highlight the right spot once the answer is revealed (or found).
  useEffect(() => {
    const root = screen.current;
    if (!root || isCommand) return;
    const el = root.querySelector(`[data-target="${step.target}"]`);
    el?.classList.toggle('mk-reveal', status === 'revealed');
    el?.classList.toggle('mk-found', status === 'solved');
    return () => el?.classList.remove('mk-reveal', 'mk-found');
  }, [status, step, isCommand]);

  useEffect(() => {
    if (locked) continueBtn.current?.focus();
  }, [locked]);

  // Enter checks a typed command / continues; Esc quits.
  const keys = useRef({ next, locked, typed, step, answer, onQuit });
  keys.current = { next, locked, typed, step, answer, onQuit };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = keys.current;
      if (e.key === 'Escape') {
        if (window.confirm('Quit this tour?')) k.onQuit();
        return;
      }
      if (e.key !== 'Enter' || (e.target as HTMLElement).tagName === 'BUTTON') return;
      e.preventDefault();
      if (k.locked) k.next();
      else if ('command' in k.step && k.typed.trim()) k.answer(checkType(k.typed, k.step.command, 'docker'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const click = (e: MouseEvent) => {
    const hit = (e.target as HTMLElement).closest<HTMLElement>('[data-target]');
    if (!hit || isCommand || locked) return;
    e.preventDefault();
    answer(hit.dataset.target === step.target);
  };

  const terminal =
    tour.screen === 'terminal' || tour.steps.some((s) => 'command' in s) ? (
      <MockTerminal
        key={index}
        log={log}
        prompt={prompt}
        value={typed}
        onChange={setTyped}
        locked={!isCommand || locked}
        output={isCommand ? step.output : undefined}
        label="Command"
        autoFocus={isCommand}
      />
    ) : undefined;

  return (
    <div className="desk-session">
      <header className="desk-top">
        <button className="icon-btn" onClick={() => window.confirm('Quit this tour?') && onQuit()} aria-label="Quit" title="Quit (Esc)">
          ✕
        </button>
        <h1 className="desk-title">
          {MOCK_NAMES[tour.screen]} tour · {tour.title}
        </h1>
        <div className="bar" role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={tour.steps.length} aria-valuenow={index + (locked ? 1 : 0)}>
          <i style={{ width: `${((index + (locked ? 1 : 0)) / tour.steps.length) * 100}%` }} />
        </div>
        <span className="muted small">
          {index + 1}/{tour.steps.length}
        </span>
      </header>
      <main className="desk-panes tour" style={{ gridTemplateColumns: '340px 1fr' }}>
        <section className="pane learn" aria-label="Instructions">
          <div className="kind-label">🧭 Tool tour · {isCommand ? 'Type the command' : 'Click the right spot'}</div>
          <h2 className="prompt">{step.prompt}</h2>
          {status === 'hint' && (
            <div className="fb-card hint pop" role="status">
              <div className="verdict">Not there. Hint:</div>
              <div className="fb-text">{step.hint}</div>
            </div>
          )}
          {status === 'solved' && (
            <div className="fb-card good pop" role="status">
              <div className="verdict">Found it!</div>
              <div className="fb-text">{step.explain}</div>
            </div>
          )}
          {status === 'revealed' && (
            <div className="fb-card bad pop" role="status">
              <div className="verdict">{isCommand ? 'The command was:' : 'It’s the highlighted spot.'}</div>
              {isCommand && <code className="fb-code code">{step.command[0]}</code>}
              <div className="fb-text">{step.explain}</div>
            </div>
          )}
          <div className="spacer" />
          {locked ? (
            <button ref={continueBtn} className={`btn ${status === 'revealed' ? 'danger' : ''}`} onClick={next}>
              Continue
            </button>
          ) : (
            isCommand && (
              <button className="btn" disabled={!typed.trim()} onClick={() => answer(checkType(typed, step.command, 'docker'))}>
                Run
              </button>
            )
          )}
        </section>
        <section className="pane mock-pane" aria-label={`${MOCK_NAMES[tour.screen]} (practice screen)`}>
          <div ref={screen} className={`mock-wrap ${shaking ? 'shake' : ''} ${isCommand ? 'typing' : ''}`} onClick={click} onAnimationEnd={() => setShaking(false)}>
            <Mock variant={tour.variant} terminal={terminal} />
          </div>
        </section>
      </main>
    </div>
  );
}

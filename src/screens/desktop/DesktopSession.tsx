import { useEffect, useRef, useState } from 'react';
import { answerCode, checkWrite } from '../../engine/check';
import type { SaveState } from '../../engine/progress';
import type { Exercise, Lesson } from '../../engine/types';
import { CodeView } from '../../components/CodeView';
import { BrowserFrame, CodeSnapshot, ConsoleWindow } from '../../components/desktop/OutputPane';
import { OLLAMA_PROMPT, PS_PROMPT, type TermEntry } from '../../components/desktop/MockTerminal';
import { fileFor, ToolFrame, toolFor } from '../../components/desktop/ToolFrame';
import { usePaneSizes } from '../../components/desktop/panes';
import { DBuild } from '../../components/exercises/desktop/DBuild';
import { DFill } from '../../components/exercises/desktop/DFill';
import { DFix } from '../../components/exercises/desktop/DFix';
import { DOrder } from '../../components/exercises/desktop/DOrder';
import { DType } from '../../components/exercises/desktop/DType';
import { DWrite } from '../../components/exercises/desktop/DWrite';
import { isTerminalExercise, type DesktopWidgetProps } from '../../components/exercises/desktop/common';
import { KIND_LABEL, MODE_LABEL, useSessionRunner, type SessionItem, type SessionMode, type SessionResultItem } from '../sessionRunner';

const HOW: Record<Exercise['kind'], string> = {
  fill: 'Type the missing code into each blank.',
  build: 'Type the whole line of code.',
  order: 'Move the lines into the right order.',
  fix: 'Click the part that is wrong, then type the fix.',
  type: 'Type the line of code.',
  write: 'Write the code in the editor. The task list shows what it needs.',
};

/** Prompts and hints are written for the phone ("Tap the bug."). */
const forDesktop = (text: string) => text.replace(/\bTap\b/g, 'Click').replace(/\btap\b/g, 'click');

/** The original code of an exercise, for picking the file name. */
const sourceOf = (ex: Exercise) =>
  ex.kind === 'fill' || ex.kind === 'fix' ? ex.code : ex.kind === 'order' ? ex.lines.join('\n') : ex.kind === 'type' ? ex.template ?? ex.accept[0] : ex.kind === 'write' ? ex.solution : ex.answer.join(' ');

/** Desktop lesson screen: Instructions | Code | Output, Codecademy style. Every
 * answer is typed; Ctrl+Enter checks and continues. */
export function DesktopSession({
  title,
  items,
  mode,
  concept,
  settings,
  onDone,
  onQuit,
}: {
  title: string;
  items: SessionItem[];
  mode: SessionMode;
  concept?: Lesson['concept'];
  settings: SaveState['settings'];
  onDone: (results: SessionResultItem[]) => void;
  onQuit: () => void;
}) {
  const run = useSessionRunner({ items, mode, settings, onDone });
  const { item, index, status, misses, locked, widget, setWidget, shaking, stopShaking, check, tap } = run;
  const ex = item.exercise;
  const track = item.track;
  const [termLog, setTermLog] = useState<TermEntry[]>([]);
  const { columns, splitter } = usePaneSizes();

  const terminal = isTerminalExercise(ex, track);
  const tool = terminal ? 'terminal' : toolFor(track);
  const file = fileFor(track, sourceOf(ex));
  const shownCode = status === 'revealed' ? answerCode(ex, track) : widget.code;

  const next = () => {
    if (terminal) {
      const cmd = status === 'revealed' ? answerCode(ex, track) : widget.code;
      setTermLog((l) => [...l, { prompt: cmd.startsWith('/') ? OLLAMA_PROMPT : PS_PROMPT, cmd, out: ex.output }]);
    }
    run.next();
  };
  const quit = () => {
    if (window.confirm('Quit this session? Progress in it will be lost.')) onQuit();
  };

  // Keyboard: Ctrl+Enter (or Enter outside a button) checks, then continues.
  const keys = useRef({ check, next, quit, locked, ready: widget.ready });
  keys.current = { check, next, quit, locked, ready: widget.ready };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = keys.current;
      const el = e.target as HTMLElement;
      if (e.key === 'Escape') {
        e.preventDefault();
        k.quit();
        return;
      }
      if (e.key !== 'Enter' || e.shiftKey || e.altKey) return;
      if (!e.ctrlKey && (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || el.tagName === 'TEXTAREA')) return;
      e.preventDefault();
      if (k.locked) k.next();
      else if (k.ready) k.check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Move focus to Continue once answered so Enter carries on.
  const continueBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (locked) continueBtn.current?.focus();
  }, [locked]);

  const props: DesktopWidgetProps<never> = {
    ex: undefined as never,
    track,
    seed: item.id,
    locked,
    onChange: setWidget,
    onTap: tap,
    misses,
    termLog,
    output: ex.output,
  };
  const progress = (index + (locked ? 1 : 0)) / items.length;

  return (
    <div className="desk-session">
      <header className="desk-top">
        <button className="icon-btn" onClick={quit} aria-label="Quit" title="Quit (Esc)">
          ✕
        </button>
        <h1 className="desk-title">{title}</h1>
        <div className="bar" role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={index + (locked ? 1 : 0)}>
          <i style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="muted small">
          {index + 1}/{items.length}
        </span>
      </header>

      <main className="desk-panes" style={{ gridTemplateColumns: columns }}>
        <section className="pane learn" aria-label="Instructions">
          {concept && (
            <details className="learn-concept" open={index === 0}>
              <summary>
                <span className="kind-label">Learn</span> {title}
              </summary>
              <p>{concept.body}</p>
              <CodeView code={concept.code} track={track} />
            </details>
          )}
          <div className="kind-label">
            {MODE_LABEL[mode]}
            {KIND_LABEL[ex.kind]}
          </div>
          <h2 className="prompt">{forDesktop(ex.prompt)}</h2>
          <p className="muted">{HOW[ex.kind]}</p>
          {ex.kind === 'write' && <TaskList ex={ex} results={checkWrite(widget.code, ex, track)} marked={misses > 0 || locked} />}

          {status === 'hint' && (
            <div className="fb-card hint pop" role="status">
              <div className="verdict">Not quite. Here&apos;s a hint:</div>
              <div className="fb-text">{forDesktop(ex.hint)}</div>
            </div>
          )}
          {status === 'solved' && (
            <div className="fb-card good pop" role="status">
              <div className="verdict">{misses === 0 ? ['Nice!', 'Correct!', 'Nailed it!', 'Great!'][index % 4] : 'Got it!'}</div>
              <div className="fb-text">{ex.explain}</div>
            </div>
          )}
          {status === 'revealed' && (
            <div className="fb-card bad pop" role="status">
              <div className="verdict">Correct answer:</div>
              <CodeView className="fb-code" code={answerCode(ex, track)} track={track} />
              <div className="fb-text">{ex.explain}</div>
            </div>
          )}
          <div className="spacer" />
          <div className="kbd-help muted small">
            <kbd>Ctrl</kbd>+<kbd>Enter</kbd> check / continue · <kbd>Esc</kbd> quit
          </div>
        </section>

        <div {...splitter(0)} />

        <section className="pane pane-code" aria-label="Code">
          <div className={`pane-fill ${shaking ? 'shake' : ''}`} onAnimationEnd={stopShaking}>
            <ToolFrame tool={tool} track={track} file={file} onRun={check} canRun={!locked && widget.ready}>
              {/* key = id so each exercise gets fresh widget state */}
              <div key={item.id} data-ex={item.id} className="widget">
                {ex.kind === 'fill' && <DFill {...props} ex={ex} />}
                {ex.kind === 'build' && <DBuild {...props} ex={ex} />}
                {ex.kind === 'order' && <DOrder {...props} ex={ex} />}
                {ex.kind === 'fix' && <DFix {...props} ex={ex} />}
                {ex.kind === 'type' && <DType {...props} ex={ex} />}
                {ex.kind === 'write' && <DWrite {...props} ex={ex} />}
              </div>
            </ToolFrame>
          </div>
          <div className={`desk-actionbar ${status}`}>
            <span className="muted small">
              {status === 'answering' && (widget.ready ? 'Ready to check' : 'Type your answer')}
              {status === 'hint' && 'Try again: one more go before the answer is shown'}
              {status === 'solved' && '✓ Correct'}
              {status === 'revealed' && 'Answer shown. It goes into your review queue.'}
            </span>
            <span className="spacer" />
            {locked ? (
              <button ref={continueBtn} className={`btn ${status === 'revealed' ? 'danger' : ''}`} onClick={next}>
                Continue
              </button>
            ) : (
              <button className="btn" disabled={!widget.ready} onClick={check}>
                Check
              </button>
            )}
          </div>
        </section>

        <div {...splitter(1)} />

        <section className="pane out" aria-label="Output">
          {ex.preview ? (
            <BrowserFrame track={track} code={shownCode} spec={ex.preview} file={file} />
          ) : ex.output ? (
            <ConsoleWindow
              title={tool === 'vs' ? 'Debug Console' : 'Output'}
              command={tool === 'vs' ? `> dotnet run` : terminal ? '' : '> run'}
              text={locked ? ex.output : undefined}
              waiting={terminal ? 'Run the command to see what it prints.' : 'Run your code (Ctrl+Enter) to see what it prints.'}
            />
          ) : (
            <CodeSnapshot code={shownCode} track={track} label={status === 'revealed' ? 'Answer' : 'Your code'} />
          )}
        </section>
      </main>
    </div>
  );
}

/** A write exercise's checks as a task list. Ticks and crosses appear once the
 * code has been checked, then update as the learner types. */
function TaskList({ ex, results, marked }: { ex: Extract<Exercise, { kind: 'write' }>; results: boolean[]; marked: boolean }) {
  return (
    <ol className="task-list" aria-label="Tasks">
      {ex.checks.map((c, i) => (
        <li key={i} className={marked ? (results[i] ? 'ok' : 'no') : ''}>
          <span className="task-mark" aria-label={marked ? (results[i] ? 'done' : 'not yet') : undefined}>
            {marked ? (results[i] ? '✓' : '✗') : i + 1}
          </span>
          {c.label}
        </li>
      ))}
    </ol>
  );
}

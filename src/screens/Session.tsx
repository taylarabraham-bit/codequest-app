import { useState } from 'react';
import { answerCode } from '../engine/check';
import type { SaveState } from '../engine/progress';
import type { Lesson } from '../engine/types';
import { CodeView } from '../components/CodeView';
import { ConsoleOut, Preview } from '../components/Preview';
import { FillBlank } from '../components/exercises/FillBlank';
import { FixBug } from '../components/exercises/FixBug';
import { OrderLines } from '../components/exercises/OrderLines';
import { TokenBuilder } from '../components/exercises/TokenBuilder';
import { TypeLine } from '../components/exercises/TypeLine';
import type { WidgetProps } from '../components/exercises/common';
import {
  KIND_LABEL,
  MODE_LABEL,
  useSessionRunner,
  type SessionItem,
  type SessionMode,
  type SessionResultItem,
} from './sessionRunner';

export type { SessionItem, SessionMode, SessionResultItem } from './sessionRunner';

export function Session({
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
  const [showConcept, setShowConcept] = useState(!!concept);
  const { item, index, status, misses, locked, widget, setWidget, shaking, stopShaking, check, next, tap } = useSessionRunner({
    items,
    mode,
    settings,
    onDone,
  });
  const ex = item.exercise;

  const quit = () => {
    if (window.confirm('Quit this session? Progress in it will be lost.')) onQuit();
  };

  if (showConcept && concept) {
    return (
      <div className="screen">
        <div className="topbar">
          <button className="icon-btn" onClick={onQuit} aria-label="Close">
            ✕
          </button>
          <div className="spacer" />
        </div>
        <div className="scroll">
          <div className="kind-label">New concept</div>
          <h1 style={{ fontSize: 26, margin: '6px 0 14px' }}>{title}</h1>
          <p style={{ fontSize: 17 }}>{concept.body}</p>
          <CodeView code={concept.code} track={item.track} />
        </div>
        <div className="actionbar">
          <button className="btn" onClick={() => setShowConcept(false)}>
            Let&apos;s go
          </button>
        </div>
      </div>
    );
  }

  const props: Omit<WidgetProps<never>, 'ex'> = {
    track: item.track,
    seed: item.id,
    locked,
    onChange: setWidget,
    onTap: tap,
  };
  const shownCode = status === 'revealed' ? answerCode(ex, item.track) : widget.code;
  const progress = (index + (locked ? 1 : 0)) / items.length;

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={quit} aria-label="Quit">
          ✕
        </button>
        <div className="bar">
          <i style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="muted small">
          {index + 1}/{items.length}
        </span>
      </div>
      <div className="scroll">
        <div className="kind-label">
          {MODE_LABEL[mode]}
          {KIND_LABEL[ex.kind]}
        </div>
        <h1 className="prompt">{ex.prompt}</h1>
        <div className={shaking ? 'shake' : ''} onAnimationEnd={stopShaking}>
          {/* key = id so each exercise gets fresh widget state */}
          <div key={item.id} data-ex={item.id}>
            {ex.kind === 'fill' && <FillBlank ex={ex} {...props} />}
            {ex.kind === 'build' && <TokenBuilder ex={ex} {...props} />}
            {ex.kind === 'order' && <OrderLines ex={ex} {...props} />}
            {ex.kind === 'fix' && <FixBug ex={ex} {...props} />}
            {ex.kind === 'type' && <TypeLine ex={ex} {...props} />}
          </div>
        </div>
        {ex.preview && (
          <Preview track={item.track} code={shownCode} spec={ex.preview} label={locked ? 'Result' : 'Live preview'} />
        )}
        {ex.output && locked && <ConsoleOut text={ex.output} />}
      </div>

      <div className={`actionbar ${status === 'solved' ? 'good' : status === 'revealed' ? 'bad' : status === 'hint' ? 'hint' : ''}`}>
        {status === 'hint' && (
          <div className="pop">
            <div className="verdict">Not quite — hint:</div>
            <div className="fb-text">{ex.hint}</div>
          </div>
        )}
        {status === 'solved' && (
          <div className="pop">
            <div className="verdict">{misses === 0 ? ['Nice!', 'Correct!', 'Nailed it!', 'Great!'][index % 4] : 'Got it!'}</div>
            <div className="fb-text">{ex.explain}</div>
          </div>
        )}
        {status === 'revealed' && (
          <div className="pop">
            <div className="verdict">Correct answer:</div>
            <CodeView className="fb-code" code={answerCode(ex, item.track)} track={item.track} />
            <div className="fb-text">{ex.explain}</div>
          </div>
        )}
        {locked ? (
          <button className={`btn ${status === 'revealed' ? 'danger' : ''}`} onClick={next}>
            Continue
          </button>
        ) : (
          <button className="btn" disabled={!widget.ready} onClick={check}>
            Check
          </button>
        )}
      </div>
    </div>
  );
}

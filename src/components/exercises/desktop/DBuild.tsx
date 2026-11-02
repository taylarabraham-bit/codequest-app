import { useMemo, useState } from 'react';
import { checkBuildTyped } from '../../../engine/check';
import { shuffled } from '../../../engine/shuffle';
import type { BuildExercise } from '../../../engine/types';
import { codeInputProps, EditorView } from '../../desktop/EditorView';
import { MockTerminal, OLLAMA_PROMPT, PS_PROMPT } from '../../desktop/MockTerminal';
import { isTerminalExercise, type DesktopWidgetProps } from './common';

/** Build the code by typing the whole line. After a miss, the pieces (plus the
 * phone edition's distractors) are shown as a word bank. */
export function DBuild({ ex, track, seed, locked, onChange, misses, termLog, output }: DesktopWidgetProps<BuildExercise>) {
  const [text, setText] = useState('');
  const bank = useMemo(() => shuffled([...ex.answer, ...ex.distractors], seed), [ex, seed]);

  const update = (v: string) => {
    setText(v);
    onChange({ ready: v.trim() !== '', correct: checkBuildTyped(v, ex, track), code: v });
  };

  const field = isTerminalExercise(ex, track) ? (
    <MockTerminal
      log={termLog}
      prompt={ex.answer[0].startsWith('/') ? OLLAMA_PROMPT : PS_PROMPT}
      value={text}
      onChange={update}
      locked={locked}
      output={output}
    />
  ) : (
    <EditorView
      track={track}
      pieces={[
        {
          node: (
            <input
              className="ed-blank ed-line-input"
              value={text}
              disabled={locked}
              autoFocus
              aria-label="Your line"
              placeholder="Type the code…"
              style={{ width: `${Math.max(30, text.length + 2)}ch` }}
              {...codeInputProps}
              onChange={(e) => update(e.target.value)}
            />
          ),
        },
      ]}
    />
  );

  return (
    <>
      {field}
      {misses > 0 && !locked && (
        <div className="word-bank pop">
          <div className="kind-label">Word bank: the pieces, plus a few that don&apos;t belong</div>
          <div className="chips">
            {bank.map((t, i) => (
              <span key={i} className="chip">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

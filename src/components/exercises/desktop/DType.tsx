import { useState } from 'react';
import { checkType } from '../../../engine/check';
import type { TypeExercise } from '../../../engine/types';
import { codeInputProps, EditorView } from '../../desktop/EditorView';
import { MockTerminal, OLLAMA_PROMPT, PS_PROMPT } from '../../desktop/MockTerminal';
import { isTerminalExercise, type DesktopWidgetProps } from './common';

/** Write the line: in the file where it belongs (template), at a terminal
 * prompt (commands), or on an empty editor line. */
export function DType({ ex, track, locked, onChange, termLog, output }: DesktopWidgetProps<TypeExercise>) {
  const [text, setText] = useState('');

  const update = (v: string) => {
    setText(v);
    const code = ex.template ? ex.template.replace('___', v) : v;
    onChange({ ready: v.trim() !== '', correct: checkType(v, ex.accept, track), code });
  };

  if (isTerminalExercise(ex, track)) {
    return (
      <MockTerminal
        log={termLog}
        prompt={ex.accept[0].startsWith('/') ? OLLAMA_PROMPT : PS_PROMPT}
        value={text}
        onChange={update}
        locked={locked}
        output={output}
      />
    );
  }

  const input = (
    <input
      className="ed-blank ed-line-input"
      value={text}
      disabled={locked}
      autoFocus
      aria-label="Your line"
      placeholder="Type your line…"
      style={{ width: `${Math.max(24, text.length + 2)}ch` }}
      {...codeInputProps}
      onChange={(e) => update(e.target.value)}
    />
  );
  const [before, after] = (ex.template ?? '___').split('___');
  return <EditorView pieces={[before, { node: input }, after]} track={track} />;
}

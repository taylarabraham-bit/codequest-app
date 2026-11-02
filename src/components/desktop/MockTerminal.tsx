import { useEffect, useRef, useState } from 'react';
import { codeInputProps } from './EditorView';

export interface TermEntry {
  prompt: string;
  cmd: string;
  out?: string;
}

export const PS_PROMPT = 'PS C:\\dev\\app> ';
export const OLLAMA_PROMPT = '>>> ';

/** A PowerShell-style terminal: earlier commands with their output, then a live
 * prompt. Up/Down recall earlier commands like a real shell. */
export function MockTerminal({
  log,
  prompt,
  value,
  onChange,
  locked,
  output,
  label = 'Terminal',
  autoFocus = true,
}: {
  log: TermEntry[];
  prompt: string;
  value: string;
  onChange: (v: string) => void;
  locked: boolean;
  /** Printed under the command once it has run. */
  output?: string;
  label?: string;
  autoFocus?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const [recall, setRecall] = useState(-1);
  const past = log.map((e) => e.cmd).reverse();

  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);
  // Braces matter: newer Chromium's scrollIntoView returns a Promise, which
  // React would take for a cleanup function.
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [log.length, locked]);

  return (
    <div className="term" onClick={() => input.current?.focus()}>
      {log.map((e, i) => (
        <div key={i}>
          <div>
            <span className="term-prompt">{e.prompt}</span>
            {e.cmd}
          </div>
          {e.out && <div className="term-out">{e.out}</div>}
        </div>
      ))}
      <div className="term-live">
        <span className="term-prompt">{prompt}</span>
        <input
          ref={input}
          className="term-input"
          aria-label={label}
          value={value}
          disabled={locked}
          {...codeInputProps}
          onChange={(e) => {
            setRecall(-1);
            onChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
            if (!past.length) return;
            e.preventDefault();
            const r = e.key === 'ArrowUp' ? Math.min(recall + 1, past.length - 1) : Math.max(recall - 1, -1);
            setRecall(r);
            onChange(r < 0 ? '' : past[r]);
          }}
        />
      </div>
      {locked && output && <div className="term-out pop">{output}</div>}
      <div ref={end} />
    </div>
  );
}

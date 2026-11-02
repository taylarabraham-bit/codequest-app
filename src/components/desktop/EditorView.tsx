import { Fragment, type ReactNode } from 'react';
import type { TrackId } from '../../engine/types';
import { Highlighted } from '../CodeView';

/** A piece of an editor line: code text (highlighted) or an inline element such
 * as a typed blank. Text may contain newlines; it is split into lines here. */
export type Piece = string | { node: ReactNode };

function toLines(pieces: Piece[], track: TrackId): ReactNode[][] {
  const lines: ReactNode[][] = [[]];
  pieces.forEach((p, i) => {
    if (typeof p !== 'string') {
      lines[lines.length - 1].push(<Fragment key={`n${i}`}>{p.node}</Fragment>);
      return;
    }
    p.split('\n').forEach((text, j) => {
      if (j > 0) lines.push([]);
      if (text) lines[lines.length - 1].push(<Highlighted key={`t${i}.${j}`} code={text} track={track} />);
    });
  });
  return lines;
}

/** Code laid out like an editor file: line numbers in a gutter, text kept on
 * its own lines, inline inputs where the learner types. */
export function EditorView({ pieces, track, label }: { pieces: Piece[]; track: TrackId; label?: string }) {
  const lines = toLines(pieces, track);
  return (
    <div className="ed" role="group" aria-label={label ?? 'Code editor'}>
      {lines.map((l, i) => (
        <div className="ed-line" key={i}>
          <span className="ed-num" aria-hidden="true">
            {i + 1}
          </span>
          <span className="ed-code">{l.length ? l : '\u200b'}</span>
        </div>
      ))}
    </div>
  );
}

/** Props for typed inputs: no autocorrect or capitalisation, it is code. */
export const codeInputProps = {
  autoCapitalize: 'off',
  autoCorrect: 'off',
  autoComplete: 'off',
  spellCheck: false,
} as const;

import { tokenize } from '../engine/check';
import type { TrackId } from '../engine/types';

const CS_KEYWORDS = new Set(
  'abstract as async await base bool break case catch char class const continue decimal default delegate do double else enum event false finally float for foreach if in int interface internal is long namespace new null object out override params private protected public readonly record ref return sealed static string struct switch this throw true try typeof using var virtual void while when with get set init yield'.split(
    ' ',
  ),
);

/** CSS-ish class name for one token. Deliberately simple: good enough to make
 * code scannable on a small screen. */
export function tokenClass(tok: string, track: TrackId, prev: string): string {
  if (/^\s+$/.test(tok)) return '';
  if (tok.startsWith('//') || tok.startsWith('/*')) return 't-com';
  if (/^["']/.test(tok)) return 't-str';
  if (/^\d/.test(tok)) return 't-num';
  if (track === 'html') {
    if (/^<\/?[A-Za-z]/.test(tok) || /^\/?>$/.test(tok) || tok === '<!DOCTYPE') return 't-tag';
    if (/^[A-Za-z-]+$/.test(tok) && prev.trim() === '' ) return 't-attr';
    return 't-punct';
  }
  if (track === 'css') {
    if (/^[.#]/.test(tok)) return 't-tag';
    if (/:$/.test(tok) || /^[a-z-]+$/.test(tok)) return 't-prop';
    return 't-punct';
  }
  if (CS_KEYWORDS.has(tok)) return 't-kw';
  if (/^[A-Z]/.test(tok)) return 't-attr';
  if (/^[\w$]/.test(tok)) return '';
  return 't-punct';
}

export function Highlighted({ code, track }: { code: string; track: TrackId }) {
  const toks = tokenize(code, track);
  return (
    <>
      {toks.map((t, i) => (
        <span key={i} className={tokenClass(t, track, toks[i - 1] ?? '')}>
          {t}
        </span>
      ))}
    </>
  );
}

export function CodeView({ code, track, className = '' }: { code: string; track: TrackId; className?: string }) {
  return (
    <div className={`code ${className}`}>
      <Highlighted code={code} track={track} />
    </div>
  );
}

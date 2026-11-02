import type { BuildExercise, Exercise, FixExercise, TrackId, WriteExercise } from './types';

const BLANK = '___';

/** Every track except HTML and CSS is code you read and run: case-sensitive,
 * C#-style tokens, console output instead of a preview. */
export const isCode = (track: TrackId) => track !== 'html' && track !== 'css';

/** Collapse whitespace that doesn't change meaning: runs of spaces become one,
 * and spaces next to punctuation disappear. HTML/CSS are also compared
 * case-insensitively with single quotes treated as double quotes. */
export function normalize(code: string, track: TrackId): string {
  // String literals are kept verbatim; only the code around them is squeezed.
  // CSS/HTML words may contain hyphens (font-size), C# words never do.
  // In CSS a space before . or # is meaningful (`.menu .item` is a descendant).
  const punct =
    isCode(track) ? / ?([^\w\s"']) ?/g : track === 'css' ? /(?: ([^\w\s"'.#-])|([^\w\s"'-])) ?/g : / ?([^\w\s"'-]) ?/g;
  return code
    .trim()
    .split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/)
    .map((part, i) => {
      if (i % 2 === 1) return isCode(track) ? part : part.toLowerCase().replace(/^'|'$/g, '"');
      const s = part.replace(/\s+/g, ' ').replace(punct, (_m, a?: string, b?: string) => a ?? b ?? '');
      return isCode(track) ? s : s.toLowerCase();
    })
    .join('');
}

export function sameCode(a: string, b: string, track: TrackId): boolean {
  return normalize(a, track) === normalize(b, track);
}

export function checkFill(answers: readonly string[], ex: { blanks: { answer: string[] }[] }, track: TrackId): boolean {
  return ex.blanks.every((b, i) => b.answer.some((a) => sameCode(answers[i] ?? '', a, track)));
}

export function checkBuild(placed: readonly string[], ex: BuildExercise): boolean {
  const eq = (target: string[]) => target.length === placed.length && target.every((t, i) => t === placed[i]);
  return eq(ex.answer) || (ex.alt ?? []).some(eq);
}

/** `picked` holds indexes into the original (correct) line order. Lines that
 * are textually identical are interchangeable. */
export function checkOrder(picked: readonly number[], lines: readonly string[]): boolean {
  return picked.length === lines.length && picked.every((p, i) => lines[p] === lines[i]);
}

export function checkFix(tappedIndex: number, chosen: string, ex: FixExercise, track: TrackId): boolean {
  return tappedIndex === parseFixCode(ex.code, track).bugIndex && chosen === ex.fix;
}

export function checkType(typed: string, accept: readonly string[], track: TrackId): boolean {
  return accept.some((a) => sameCode(typed, a, track));
}

// ---- Typed answers (desktop edition) -----------------------------------
// The desktop edition asks for every answer to be typed, so build and fix
// exercises are checked against text instead of tapped tokens.

/** A build exercise typed out as one line: any accepted token order counts. */
export function checkBuildTyped(typed: string, ex: BuildExercise, track: TrackId): boolean {
  return [ex.answer, ...(ex.alt ?? [])].some(
    (toks) => sameCode(typed, joinTokens(toks, track), track) || sameCode(typed, toks.join(' '), track),
  );
}

/** A fix exercise where the learner picks the wrong token, then types its fix.
 * When the bug only differs from the fix in case or quotes (`"recipe"` →
 * `"Recipe"`), the fix must be typed exactly. */
export function checkFixTyped(tappedIndex: number, typed: string, ex: FixExercise, track: TrackId): boolean {
  const { bugIndex, bug } = parseFixCode(ex.code, track);
  if (tappedIndex !== bugIndex) return false;
  return typed.trim() === ex.fix || (sameCode(typed, ex.fix, track) && !sameCode(bug, ex.fix, track));
}

/** Results of each of a write exercise's checks against the learner's code. */
export function checkWrite(code: string, ex: Pick<WriteExercise, 'checks'>, track: TrackId): boolean[] {
  const squeezed = normalize(code, track);
  // HTML/CSS: single-quoted attribute values count the same as double-quoted
  // ones, so regex checks written with " accept name='x' too.
  const dq = isCode(track) ? code : code.replace(/=(\s*)'([^'"\n]*)'/g, '=$1"$2"');
  return ex.checks.map((c) => {
    if (c.re !== undefined) {
      const re = new RegExp(c.re, c.flags);
      return re.test(code) || (dq !== code && re.test(dq));
    }
    if (c.has !== undefined) return squeezed.includes(normalize(c.has, track));
    if (c.not !== undefined) return !squeezed.includes(normalize(c.not, track));
    return false;
  });
}

/** First words of command-line tools: a typed line starting with one of these
 * is entered at a terminal prompt rather than in a code file. */
const COMMANDS = new Set([
  'docker',
  'ollama',
  'kubectl',
  'kind',
  'dotnet',
  'curl',
  'curl.exe',
  'git',
  'npm',
  'npx',
  'winget',
  'helm',
  'setx',
  'irm',
  'Invoke-RestMethod',
  'Get-Content',
  'Set-Content',
]);

/** Whether an answer is a terminal command (or, for Ollama, a `/command` typed
 * at the `>>>` chat prompt). */
export function isCommand(answer: string, track: TrackId): boolean {
  const first = answer.trim().split(/\s+/)[0];
  // $env:NAME = "value" sets an environment variable in PowerShell.
  return COMMANDS.has(first) || /^\$env:/i.test(first) || (track === 'ollama' && /^\/[a-z]/.test(first));
}

// ---- Tokenising ---------------------------------------------------------

const MARKUP_RE = /<\/?[A-Za-z!][\w-]*|\/?>|"[^"]*"|'[^']*'|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|[A-Za-z_$#.@:-][\w$-]*|\d+(?:\.\d+)?[a-z%]*|\s+|./g;
const CSHARP_RE = /\/\/.*|\$?"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[A-Za-z_][\w]*(?:\.[A-Za-z_]\w*)*|\d+(?:\.\d+)?[mMdDfFL]?|\+\+|--|[=!<>+\-*/%&|]=|&&|\|\||=>|\?\?|\s+|./g;

/** Split code into tappable tokens (whitespace kept as its own tokens so the
 * code can be redrawn exactly). */
// ponytail: Docker, Ollama and Blazor reuse CSHARP_RE, so `-p` and `@onclick`
// tokenize as two pieces. Give them their own regex if exercises ever need those
// tappable as one token outside a [[fix]] marker (markers are always one token).
export function tokenize(code: string, track: TrackId): string[] {
  return code.match(isCode(track) ? CSHARP_RE : MARKUP_RE) ?? [];
}

/** Split a fix exercise's code around its `[[bug]]` marker. `bugIndex` counts
 * every token including whitespace, so it indexes `tokens` directly. */
export function parseFixCode(code: string, track: TrackId): { tokens: string[]; bugIndex: number; bug: string } {
  const m = /\[\[(.+?)\]\]/.exec(code);
  if (!m) return { tokens: tokenize(code, track), bugIndex: -1, bug: '' };
  const before = tokenize(code.slice(0, m.index), track);
  const after = tokenize(code.slice(m.index + m[0].length), track);
  return { tokens: [...before, m[1], ...after], bugIndex: before.length, bug: m[1] };
}

/** Join built tokens into readable code. Cosmetic only: checking compares
 * token arrays, not this string. */
export function joinTokens(tokens: readonly string[], track: TrackId): string {
  let out = '';
  tokens.forEach((t, i) => {
    if (i === 0) {
      out = t;
      return;
    }
    const prev = tokens[i - 1];
    out += needsSpace(prev, t, track) ? ' ' + t : t;
  });
  return out;
}

function needsSpace(prev: string, next: string, track: TrackId): boolean {
  if (track === 'html') {
    if (prev.endsWith('>') || next.startsWith('<') || next === '>' || next === '/>') return false;
    if (prev.startsWith('<') && !prev.endsWith('>') && next === '=') return false;
    if (prev === '=' || next === '=') return false;
    return true;
  }
  if (track === 'css') return !/^[;,):]/.test(next) && !/\($/.test(prev);
  if (/^[;,).\]:]/.test(next)) return false;
  if (next === '(' && /[\w>\]]$/.test(prev)) return false;
  if (next === '[' && /[\w\]]$/.test(prev)) return false;
  if (/[(.[!]$/.test(prev) && prev !== '!=') return false;
  if (isCode(track) && (next === '++' || next === '--')) return false;
  return true;
}

// ---- Answers & live code -----------------------------------------------

export function fillCode(code: string, values: readonly string[]): string {
  let i = 0;
  return code.replace(/___/g, () => values[i++] ?? '');
}

/** The correct answer as code, for "show answer" and the solved preview. */
export function answerCode(ex: Exercise, track: TrackId): string {
  switch (ex.kind) {
    case 'fill':
      return fillCode(ex.code, ex.blanks.map((b) => b.answer[0]));
    case 'build':
      return joinTokens(ex.answer, track);
    case 'order':
      return ex.lines.join('\n');
    case 'fix':
      return ex.code.replace(/\[\[(.+?)\]\]/, ex.fix);
    case 'type':
      return ex.template ? ex.template.replace(BLANK, ex.accept[0]) : ex.accept[0];
    case 'write':
      return ex.solution;
  }
}

/** Builds the srcdoc for a live preview from the learner's current code. */
export function previewDoc(track: TrackId, current: string, spec: { html?: string; css?: string }): string {
  // A whole page (doctype/html) is shown as written rather than inside <body>.
  if (track === 'html' && /<!doctype|<html[\s>]/i.test(current)) {
    return current.replace(/<head>/i, `<head><style>${spec.css ?? ''}</style>`);
  }
  const html = track === 'css' ? spec.html ?? '' : current;
  const css = track === 'css' ? current : spec.css ?? '';
  const base =
    'body{margin:8px;font:15px/1.4 system-ui,sans-serif;color:#111;background:#fff}img{max-width:100%}';
  return `<!doctype html><html><head><meta charset="utf-8"><style>${base}</style><style>${css}</style></head><body>${html}</body></html>`;
}

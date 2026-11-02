import { describe, expect, it } from 'vitest';
import { applyDesktop, desktopUnits, writtenUnits } from '../src/content';
import { TRACKS } from '../src/content/roadmap';
import type { Exercise, TrackId } from '../src/engine/types';

// The desktop edition runs on Windows, so commands the learner types in
// PowerShell must be Windows commands: curl.exe, $env:, Get-Content, backtick
// line breaks, ${PWD}, JSON bodies in a file. Code that runs inside Linux (a
// Dockerfile, compose/k8s YAML, sh -c strings, a server over ssh) is exempt.
// Run one unit: npx vitest run tests/windows.test.ts -t "Ollama unit 4:"

const RULES: [RegExp, string][] = [
  [/(^|[\s;|&(])curl\s/, 'use curl.exe (curl is Invoke-WebRequest in Windows PowerShell)'],
  [/-d\s+'\s*[{[]/, "inline JSON breaks in Windows PowerShell: put it in a file and send -d '@file.json'"],
  [/^\s*export\s+\w+=/, 'use $env:NAME = "value"'],
  [/^\s*(PS>\s*)?[A-Z][A-Z0-9_]*=\S*\s+[a-z]/, 'VAR=value command is bash: set $env:VAR first'],
  [/\\\s*$/, 'PowerShell continues lines with a backtick `, not \\'],
  [/\$\(pwd\)/, 'use ${PWD} in PowerShell'],
  [/^\s*\$ /, 'show the PowerShell prompt as PS> , not $ '],
  [/(^|\s)cat\s+[^|\s]+\s*\|/, 'use Get-Content file -Raw | …'],
  [/\|\s*jq\b/, 'jq is not on Windows: use ConvertFrom-Json'],
];

/** Code that runs in Linux, not in the learner's PowerShell. */
const linuxText = (code: string) =>
  /^\s*FROM\s+\S/m.test(code) || /^\s*(services|apiVersion|kind|jobs|steps|on):/m.test(code) || /^\s*\[(Unit|Service)\]/m.test(code);
const linuxLine = (line: string) =>
  /^\s*(RUN|CMD|ENTRYPOINT|HEALTHCHECK|SHELL)\b/.test(line) ||
  /\b(sh|bash)\s+-c\b/.test(line) ||
  /\btest:/.test(line) ||
  /^\s*ssh\s/.test(line) ||
  /^\s*#/.test(line) ||
  /^\s*(docker|kubectl)\s+(exec|run)\b.*\s(sh|bash)\b/.test(line);

/** Every piece of code an exercise shows or accepts. */
function codeOf(ex: Exercise): string[] {
  switch (ex.kind) {
    case 'fill':
    case 'fix':
      return [ex.code];
    case 'build':
      return [ex.answer.join(' ')];
    case 'order':
      return [ex.lines.join('\n')];
    case 'type':
      return [ex.template ?? '', ...ex.accept];
    case 'write':
      return [ex.starter, ex.solution];
  }
}

function hits(code: string): string[] {
  if (linuxText(code)) return [];
  return code.split('\n').flatMap((line) => (linuxLine(line) ? [] : RULES.filter(([re]) => re.test(line)).map(([, why]) => `${line.trim()}  → ${why}`)));
}

describe('desktop edition uses Windows commands', () => {
  for (const track of TRACKS) {
    writtenUnits(track.id).forEach((unit, u) => {
      it(`${track.name} unit ${u + 1}: ${unit.title}`, () => {
        const du = desktopUnits(track.id as TrackId)[u];
        const shown = applyDesktop(unit, du);
        const bad: string[] = [];
        const scan = (id: string, codes: string[]) => {
          if (du?.linuxOk?.[id]) return;
          for (const c of codes) for (const h of hits(c)) bad.push(`${id}: ${h}`);
        };
        shown.lessons.forEach((l, li) => {
          scan(`L${li + 1}.concept`, [l.concept.code]);
          l.exercises.forEach((ex, i) => scan(`L${li + 1}.${i + 1}`, codeOf(ex)));
          du?.lessons[li]?.forEach((ex, i) => scan(`L${li + 1}.W${i + 1}`, codeOf(ex)));
        });
        shown.boss.forEach((ex, i) => scan(`boss.${i + 1}`, codeOf(ex)));
        expect(bad).toEqual([]);
      });
    });
  }
});

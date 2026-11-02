import { execFile } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { allExercises } from '../src/content';
import { answerCode } from '../src/engine/check';

// Opt-in (slow, needs the .NET 10 SDK): RUN_DOTNET=1 [UNIT=csharp-4] npx vitest run tests/csharp-run.test.ts
// Runs every C# exercise that shows console output and checks the output is exact.
// One-file apps default to PublishAot, which turns off reflection-based JSON, so
// the runner switches it back off the way a normal console project has it.
// Programs run inside the temp dir so file exercises don't litter the repo.
const run = promisify(execFile);
const dir = join(tmpdir(), 'codequest-cs');
const unit = process.env.UNIT;
const cases = allExercises().filter(
  (e) => e.track === 'csharp' && e.exercise.output && (!unit || e.id.startsWith(unit + '.')) && !/ReadLine/.test(answerCode(e.exercise, 'csharp')),
);

describe.runIf(process.env.RUN_DOTNET)('C# outputs match dotnet run', () => {
  mkdirSync(dir, { recursive: true });
  it.concurrent.each(cases.map((e) => [e.id, e] as const))('%s', async (id, e) => {
    const file = join(dir, `${id.replace(/\./g, '_')}.cs`);
    writeFileSync(file, '#:property PublishAot=false\n' + answerCode(e.exercise, 'csharp'));
    const env = { ...process.env, DOTNET_NOLOGO: '1', DOTNET_CLI_TELEMETRY_OPTOUT: '1' };
    const { stdout } = await run('dotnet', ['run', file], { env, cwd: dir, timeout: 180_000 });
    expect(stdout.replace(/\r\n/g, '\n').trimEnd()).toBe(e.exercise.output!.trimEnd());
  }, 200_000);
});

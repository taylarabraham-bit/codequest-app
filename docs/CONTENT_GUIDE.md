# Writing CodeQuest content

CodeQuest is a phone game for learning HTML, CSS, C#, ASP.NET, Blazor, Docker and Ollama. It works like Codecademy but faster: every lesson takes about 2 minutes. The player is one adult learner using a phone, so keep text short and keep typing to a minimum.

Content is plain TypeScript data. The types are in `src/engine/types.ts`; read them first. Answer checking and tokenising live in `src/engine/check.ts`.

## Files
- One file per unit: `src/content/<track>/unitNN.ts` (`unit01.ts`, `unit02.ts`, …), where `<track>` is `html`, `css`, `csharp`, `aspnet`, `blazor`, `docker` or `ollama`.
- Each file does `import type { Unit } from '../../engine/types';` and `export default unit;` (a `const unit: Unit = {...}`).
- `unit.title` must match the track's entry in `src/content/roadmap.ts` **exactly**, in the same position.
- Validate with `npx vitest run tests/content.test.ts`. The test must pass.
- C#: also run `RUN_DOTNET=1 npx vitest run tests/csharp-run.test.ts` (add `UNIT=csharp-4` for one unit). It runs every exercise that has `output` with `dotnet run` and checks the output is exact.

## Shape (enforced by the test)
- 5 lessons per unit, each with 7 exercises, plus a `boss` of 10 exercises.
- Each lesson has a `concept` card: `body` is 2–3 short sentences, `code` is a tiny example (1–6 lines).
- Difficulty ramps up through the unit, both in exercise kind and in content:
  - Lessons 1–2: mostly `fill` (with `options`) and `build`. Lesson 1 must NOT use `fix` or `type`.
  - Lessons 3–4: mostly `build` and `order`, plus a few `fill` blanks with no options (typed), and a `fix` is allowed.
  - Lesson 5: must include at least one `fix` and one `type`.
  - Code also gets longer and trickier from lesson to lesson.
  - Each lesson uses 2 or more kinds. The boss mixes 4 or more kinds, revisits the whole unit, and is the hardest set.
- Later units may assume earlier units, including units from other tracks.

## Exercise kinds
All kinds have `prompt` (one short instruction), `hint` (a nudge, not the answer), and `explain` (1–2 sentences on WHY, shown after solving).

- `fill`: `code` contains `___` gaps; `blanks[i]` matches the i-th gap. With `options`, the player taps an option: 2–4 options, no duplicates, and the options must include `answer[0]`. Without `options`, the player types the blank, so keep typed blanks to a single short word. `answer` lists the accepted strings, first one canonical.
- `build`: the player taps tokens in order. `answer` is the token list (2–8 tokens) and `distractors` holds 1–4 plausible wrong tokens. Tokens are code pieces such as `<a`, `href="/"`, `>`, `Home`, `</a>` or `Console.WriteLine`, `(`, `"Hi"`, `)`, `;`. Use `alt` for other valid orders when they exist.
- `order`: `lines` in the CORRECT order, 3–7 lines; the game shuffles them. Make sure only one order is correct, or that lines which could swap are identical. Indentation in lines is fine.
- `fix`: `code` with exactly one `[[wrong]]` marker around the buggy token; the player taps it, then picks the fix from `options` (2–4 options, which must include `fix`; don't include the bug itself). The bug must be a single token-like piece such as a tag name, a property name, a value, `;`, `==` or a keyword. Use real, common mistakes.
- `type`: the player types ONE short line, at most about 40 characters. `accept` lists the accepted answers (canonical first). Matching ignores spaces around punctuation, and for HTML/CSS also ignores case and quote style, so list real variants (for example `int x = 5;` and `var x = 5;` if both should pass). `template` is optional: surrounding code with exactly one `___` where the typed line goes.

## Track-specific
- HTML/CSS: add a `preview` wherever the result is visible (most exercises). For the HTML track, the player's code is the body HTML and `preview.css` is optional styling; set `preview: {}` to preview the HTML alone. For the CSS track, the player's code is the CSS and `preview.html` is the markup it styles, e.g. `preview: { html: '<p class="note">Hi</p>' }`. Never set `output` on HTML/CSS.
- C#: never set `preview`. Set `output` (the exact console text) whenever the code prints. Use modern C# with top-level statements unless the topic needs a class or `Main`. Write real, compilable C#. Outputs must be deterministic: no `Random`, clocks or user input.
- ASP.NET, Blazor, Docker, Ollama: code tracks that follow the C# rules (no `preview`, case-sensitive answers). Set `output` to what the learner would see: the HTTP response body, the rendered text, the terminal output. Ollama replies vary, so keep an Ollama `output` short and clearly a sample. Use current versions: .NET 10, today's Docker CLI and Compose spec, today's Ollama CLI and REST API.

## Style
- Friendly, terse and concrete. No "In this lesson we will…". Use the second person.
- Prompts are at most about 12 words: "Close the paragraph tag." or "Print the total."
- Vary the examples (a recipe page, a game score, a profile card…) so it isn't all "Hello".
- Teach the concept card's idea right away, then stretch it in each exercise.

## Example lesson (HTML)
```ts
{
  title: 'Your first tag',
  concept: {
    body: 'HTML is made of tags. An opening tag like <p> starts an element and a closing tag </p> ends it. Content goes between.',
    code: '<p>Hello, world!</p>',
  },
  exercises: [
    {
      kind: 'fill',
      prompt: 'Close the paragraph.',
      code: '<p>Welcome!___',
      blanks: [{ answer: ['</p>'], options: ['</p>', '<p>', '<p/>'] }],
      hint: 'Closing tags have a slash after the <.',
      explain: 'Every opening tag needs a matching closing tag with a /.',
      preview: {},
    },
    {
      kind: 'build',
      prompt: 'Build a level-1 heading that says Recipes.',
      answer: ['<h1>', 'Recipes', '</h1>'],
      distractors: ['<h7>', '</p>'],
      hint: 'Headings go from h1 (biggest) to h6.',
      explain: 'h1 is the page’s main heading.',
      preview: {},
    },
    // …5 more
  ],
}
```

## The desktop edition

The same content also runs in the Windows desktop edition, where **every answer is typed** in a three-pane layout. You don't write anything separate for it, but keep these in mind (`tests/content.test.ts` checks them):

- `fill` blanks with `options` are typed on desktop, so a wrong option must not normalize to a right answer (no `'Recipe'` vs `"Recipe"` option pairs in HTML/CSS, where case and quotes are ignored).
- `build` is typed as one line, checked against `answer` (and each `alt`) joined with `joinTokens`. Answer plus a distractor must not still pass.
- `fix`: the learner clicks the bug, then types the fix. If the bug and fix differ only in case or quotes, the fix must be typed exactly.
- `type` and `build` lines that start with a CLI command (`docker`, `ollama`, `kubectl`, `dotnet`, `curl`, `git`, `npm`…, or an Ollama `/command`) are typed at a mock PowerShell (or `>>>`) prompt and print `output` there, so write `output` the way the terminal shows it.

## Tool tours (desktop only)

Tours live in `src/content/tours/<track>.ts`: a default-exported `Tour[]`. Each tour runs on one mock screen from `src/components/desktop/mocks/` (`vscode`, `visualstudio`, `devtools`, `dockerdesktop`, `terminal`), optionally with a `variant` (for example `visualstudio` + `debug`, or `devtools` + `network`).

- Each step has `prompt`, `hint` and `explain` (same style as exercises) and either:
  - `target`: the `data-target` of the element to click on the mock, e.g. `start-debug` or `panel-console`; or
  - `command`: accepted commands to type at the screen's terminal or console (canonical first), with an optional `output`.
- 5–7 steps per tour, 2+ tours per track. Teach where things are in the real tool and the keyboard shortcut in `explain`.
- To add a clickable spot, wrap it in `<Hit t="my-target">` in the mock. `tests/tours.test.ts` renders each mock and fails if a step points at a target that isn't drawn.
- Check claims against the real tool (menus, shortcuts, default ports, CLI output format). Version numbers in sample output are samples; say "your version will differ" in `explain`.

## Write challenges (desktop only)

The desktop edition ends every lesson with **two write-the-code challenges** (kind `write`): the learner writes several lines in a real code editor, and a task checklist shows what the code must contain. They live in their own files so the phone content never changes:

- `src/content/<track>/desktop/unitNN.ts`, default-exporting a `DesktopUnit`: `{ lessons: [[w1, w2], …] }`, one pair per lesson of the matching `unitNN.ts`, in order (5 pairs). `src/content/html/desktop/unit01.ts` is the reference example; copy its shape.
- Validate one unit: `npx vitest run tests/challenges.test.ts -t "HTML unit 1:"` (keep the colon, or "unit 1" also matches units 10–19) (track name as in the roadmap: `HTML`, `CSS`, `C#`, `ASP.NET`, `Blazor`, `Docker`, `Ollama`).

Fields: `prompt`, `hint`, `explain` (as for other kinds), `starter` (code already in the editor: `''` for a blank file, or code to finish or fix), `solution` (a model answer, shown when revealed), `checks` (2–6), plus `preview` (HTML/CSS) or `output` (code tracks), following the track rules above.

**What to write.** Each challenge practises the lesson it follows (its concept card and exercises), and may use anything from earlier lessons and units. This is the computer version, so the learner writes real code from memory:
- Challenge 1: write it from scratch or nearly (`starter` empty or a 1–2 line stub). Typically 2–8 lines.
- Challenge 2: harder. Finish or extend starter code, fix a broken snippet, or combine this lesson with earlier ones. Typically 3–14 lines.
- Use a fresh, concrete scenario each time (a gym log, a ticket queue, a pet shop API…), not the lesson's own example.
- Prompts are one sentence, at most about 16 words. Put the details in the checklist.

**Checks** are the task list the learner sees, so each `label` is a short, specific instruction ("Print the total with Console.WriteLine", "A <label> linked to the email input"). Exactly one of:
- `has`: a code fragment that must appear. It is compared after normalizing: spacing around punctuation is ignored; HTML/CSS also ignore case and quote style. Good for exact pieces: `has: 'display: grid'`, `has: 'builder.Services.AddDbContext<'`.
- `re` (+ optional `flags`): a regex (as a string, so double the backslashes) on the raw code, for anything that can vary: names, values, order, structure. Good: `re: 'for\\s*\\(\\s*int\\s+\\w+\\s*=\\s*0'`. Use `flags: 'i'` for HTML/CSS tags; `[\\s\\S]` to span lines.
- `not`: a fragment that must NOT appear (e.g. the bug in a fix challenge). Use with at least one positive check.

Make the checks **accept every reasonable correct answer and reject wrong ones**. Don't insist on one variable name, one value, or one spelling of a string unless the prompt says so; use regexes like `\\w+` for names the learner picks. Never require the exact comment text, spacing or order where order doesn't matter. But do check the things the lesson teaches, so a near-empty answer or the starter cannot pass (the test fails if the starter passes every check, or if the solution fails one).

**Correctness.** Solutions must be real, working code for current versions (.NET 10 / C# 14, today's Docker CLI and Compose spec, today's Ollama CLI and REST API, current HTML/CSS). For C#, `output` must be exactly what `dotnet run` prints for the solution, with deterministic code (no Random, clocks or input). `RUN_DOTNET=1 npx vitest run tests/csharp-run.test.ts` runs them when the .NET SDK is installed. Use spaces, not tabs.

## Windows commands (desktop)

Learners run commands in **Windows PowerShell**, so everything the desktop edition shows or accepts as a command typed on the learner's PC must work there. The phone keeps the original Linux/Mac-style exercises; the laptop gets Windows versions through the unit's desktop file (`src/content/<track>/desktop/unitNN.ts`):

- `overrides: { 'L3.4': {...}, 'boss.2': {...} }` replaces a shared exercise on the laptop. The key is lesson.number or boss.number (1-based). Keep the same `kind` and the same teaching point; it must pass the normal content rules.
- `concepts: { 3: { body, code } }` replaces lesson 3's concept card.
- Write challenges (`lessons`) in the same file are edited in place.
- `linuxOk: { 'L2.3': 'runs on the Linux server over ssh' }` marks an item that stays Linux-style on purpose. Keys can also be `'L4.W2'` (a challenge) or `'L1.concept'`.
- A `$ ` prompt at the start of a line is turned into `PS> ` automatically; you don't need overrides for that.

Check a unit with `npx vitest run tests/windows.test.ts -t "Ollama unit 4:"`. It lists every Linux-style line still visible on the laptop.

Conversions:
- **curl**: always `curl.exe` (in Windows PowerShell 5.1 `curl` is Invoke-WebRequest). Explain this the first time it appears in a unit's concept card.
- **JSON bodies**: Windows PowerShell 5.1 strips the `"` marks from inline `-d '{...}'`, so the JSON goes in a file sent with `curl.exe http://localhost:11434/api/chat -d '@request.json'`.
  - When the exercise is about the JSON (fields, messages, options), its code is just the file contents. It starts with `{`, so the editor shows it as `request.json`; mention the file in the prompt or concept.
  - When the exercise is about the command (endpoint, method, flags), its code is the `curl.exe … -d '@request.json'` line.
  - Plain GETs stay one line: `curl.exe http://localhost:11434/api/tags`.
- **Environment variables**: `$env:OLLAMA_HOST = "0.0.0.0:11434"` sets one for this PowerShell window. To change the Ollama server's settings on Windows, set a user variable (`setx OLLAMA_HOST 0.0.0.0:11434`, or Settings → environment variables), then quit Ollama from the system tray and start it again. `VAR=value command` and `export` are bash only.
- **Other bash-isms**: `cat f |` becomes `Get-Content f -Raw |`; a trailing `\` line break becomes a backtick `` ` ``; `$(pwd)` becomes `${PWD}`; `| jq …` becomes `| ConvertFrom-Json` (e.g. `(curl.exe -s http://localhost:11434/api/tags | ConvertFrom-Json).models.name`); `cmd1 && cmd2` becomes `cmd1; cmd2`.
- **Stays Linux** (no change needed, and the test skips it): Dockerfiles, compose/Kubernetes/CI YAML, `sh -c` strings, commands run inside a container (`docker exec … sh`), and commands on a Linux server (systemd, ssh). If the test still flags one of these, add it to `linuxOk` with the reason.
- Keep prompts, hints and explanations true for Windows (paths like `C:\…`, `%USERPROFILE%\.ollama\models`).

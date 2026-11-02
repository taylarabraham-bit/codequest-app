# CodeQuest

A bite-size coding game that comes in two editions:

- **Desktop (Windows .exe):** the advanced, keyboard-first edition for laptops. Every answer is typed in a Codecademy-style three-pane screen, and tool tours let you practise in mock versions of the real apps.
- **Mobile (Android APK):** the original tap-to-answer phone game.

It works like Codecademy, only faster. There are seven tracks, each with 20 units that run from beginner to job-ready and end in a capstone project:

| Track | Units | Covers |
|---|---|---|
| HTML | 20 | Structure, forms, accessibility, SEO, SVG, shadow DOM, email HTML |
| CSS | 20 | Layout, responsive design, animation, cascade layers, color, anchor positioning |
| C# | 21 | The language from variables to generics, reflection, memory and parallelism |
| ASP.NET | 20 | Minimal APIs, EF Core, auth, SignalR, gRPC, observability, Aspire |
| Blazor | 20 | Components, forms, render modes, QuickGrid, PWAs, MAUI Hybrid |
| Docker | 20 | Images, Compose, security, CI/CD, dev containers, Kubernetes |
| Ollama | 20 | Local models, the REST API, RAG, tools and agents, production, security |


- **Short lessons:** each lesson is about 2 minutes. You read one concept card, then do 7 hands-on exercises.
- **Five exercise types:** fill in the blank, build the code from tokens, put lines in order, find and fix the bug, and type a short line. Each unit starts easy and gets harder toward the end.
- **Live preview** for HTML and CSS, and **console output** for C# and the other code tracks.
- **Mistakes:** a wrong answer gets you a hint. A second miss shows the answer with an explanation, and the exercise goes into your **review queue** (spaced over 1, 3 and 7 days).
- **Game layer:** XP and levels, a daily streak and daily goal, 29 badges, and a **boss** at the end of every unit.
- **Final exams and certificates:** clear every unit in a track to unlock a 20-question final exam. Get 17 right to earn that track's certificate.
- **Skip-ahead tests:** get 7 of 8 right to jump past units you already know.
- **Getting started:** a short intro on first launch, then a **Continue** button on the home screen that picks up where you left off.
- **Settings:** sound, vibration, daily goal, reduce motion and larger code text, all in Profile.
- **Saving:** progress is stored only on your device. There are no accounts and nothing is uploaded.

## Desktop edition

| | Mobile (Android) | Desktop (Windows) |
|---|---|---|
| Answering | Tap tokens, chips and lines | **Type everything**: blanks, whole lines, fixes; reorder lines with Alt+↑/↓ |
| Lessons | 7 exercises | The same 7, typed, plus **2 write-the-code challenges** per lesson: write several lines in a real editor against a task checklist (1,410 in total) |
| Lesson screen | One column | **Instructions \| Code \| Output** panes, resizable |
| Code pane | Plain code block | Styled like the real tool: **VS Code** (HTML, CSS, Docker, Ollama files), **Visual Studio** (C#, ASP.NET, Blazor), a **PowerShell terminal** for `docker`/`ollama`/`dotnet` commands |
| Output pane | Preview or console under the code | A **browser window** with the live page, or the **console** the program prints to |
| Extras | | **Tool tours**: click-through practice on mock VS Code, Visual Studio, browser DevTools, Docker Desktop and Windows Terminal, plus typed CLI walkthroughs (2 per track) |
| Keys | | Ctrl+Enter check / continue, Esc quit, Tab between blanks |

Content, XP, streaks, reviews, bosses, exams and certificates are the same in both. Progress is stored on each device separately (on Windows in `%APPDATA%\CodeQuest Desktop`).

## Install on Windows

Every push to `main` also builds a portable Windows app and attaches it to the same GitHub Release as the APK.

1. On the laptop, open **github.com/taylarabraham-bit/codequest-app/releases**.
2. Download the newest `CodeQuest-Desktop-N.exe`.
3. Double-click it. There's nothing to install and no admin rights are needed. The first time, SmartScreen may say *"Windows protected your PC"* because the app isn't code-signed: click **More info → Run anyway**.
4. To update, download the newer .exe. Your progress is kept.

## Install on your phone

Every push to `main` builds a new APK and publishes it as a GitHub Release.

1. On your Android phone, open **github.com/taylarabraham-bit/codequest-app/releases**.
2. Tap the newest release's `codequest-N.apk` to download it.
3. Open the download. The first time, Android asks you to allow installs from your browser: turn on **Allow from this source**.
4. Tap **Install**. A newer APK installs over the old one and your progress is kept.

## Develop

```bash
npm install
npm run dev          # http://127.0.0.1:5180 (use the browser's phone view)
npm run dev:desktop  # http://127.0.0.1:5181, the desktop edition in a browser
npm run app          # build the desktop edition and open it in Electron
npm run dist:win     # build the portable .exe into release/ (best run on Windows; CI does this)
npm test             # engine tests and validation of every exercise
npm run lint && npm run typecheck
RUN_DOTNET=1 npx vitest run tests/csharp-run.test.ts   # needs the .NET 10 SDK: runs every C# exercise
```

Browser smoke test (run it with the dev server up):

```bash
node scripts/smoke.mjs shots          # plays HTML lesson 1, checks progress is saved
ALL=1 node scripts/smoke.mjs shots    # plays EVERY lesson, boss and unlocked final exam through the UI
ALL=1 TRACKS=docker,ollama node scripts/smoke.mjs shots   # just some tracks
# set CHROMIUM=/path/to/chromium to use a preinstalled browser
# URL=... points it at another server. For long runs, test a frozen build so
# file edits don't reload the page mid-run:
#   NODE_ENV=development npx vite build --mode development --outDir dist-smoke
#   npx vite preview --outDir dist-smoke --port 5190 &
#   URL=http://127.0.0.1:5190/ ALL=1 node scripts/smoke.mjs shots
```

Desktop smoke test (run it with `npm run dev:desktop` up): types every answer at laptop size, plays a lesson and a tool tour in every track, and checks progress is saved.

```bash
node scripts/smoke-desktop.mjs shots-desktop
ALL=1 node scripts/smoke-desktop.mjs shots-desktop   # every lesson, boss, exam and tour, by typing
```

## Adding lessons

The map shows the full roadmap from `src/content/roadmap.ts`. Units that aren't written yet show as "coming soon". To add one, create `src/content/<track>/unitNN.ts` following [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md); the game picks it up automatically. `npm test` checks every exercise's shape, the difficulty ramp, and that each answer actually passes the checker (tapped on mobile and typed on desktop). Tool tours live in `src/content/tours/`; see the guide.

## How it fits together

| Path | What |
|---|---|
| `src/engine/types.ts` | Content data model (5 exercise kinds) |
| `src/engine/check.ts` | Answer checking, tokenizing, previews |
| `src/engine/progress.ts` | XP, levels, streaks, unlocks, badges, review queue (pure functions) |
| `src/screens/Session.tsx` | The lesson, boss, review and skip-test runner |
| `src/components/exercises/` | The five exercise widgets (tap versions); `desktop/` holds the typed versions |
| `src/screens/sessionRunner.ts` | The check/hint/reveal loop shared by both editions |
| `src/screens/desktop/` | Desktop shell (sidebar), the 3-pane lesson screen, the tool-tour screen |
| `src/components/desktop/` | Tool-styled editor frames, mock terminal, output windows, and the tour mock screens (`mocks/`) |
| `src/content/tours/` | Tool tours, per track |
| `src/edition.ts` | `DESKTOP` flag: set by `vite --mode desktop` (`.env.desktop`) |
| `electron/main.cjs` | Electron shell for the Windows app |
| `android/` | Capacitor Android wrapper |
| `.github/workflows/release.yml` | Builds the APK and the Windows .exe on every push to `main` and publishes both |

CI signs the APK with a key held in GitHub secrets, so every build can update the installed app. Without the key, `assembleRelease` produces an unsigned APK.

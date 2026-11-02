# Goal: CodeQuest 1.0

CodeQuest is complete when every item below is ticked. **All items were ticked on 2026-10-26: CodeQuest 1.0.** Work lands on `main` in small pushes; each push builds an APK.

## 1. Full curriculum: 20 units per track

Each track runs from beginner to job-ready and ends with a capstone unit that mixes everything.

| Track | Units |
|---|---|
| HTML | 20 |
| CSS | 20 |
| C# | 21 |
| ASP.NET | 20 |
| Blazor | 20 |
| Docker | 20 |
| Ollama | 20 |

- [x] HTML 20
- [x] CSS 20
- [x] C# 20+
- [x] ASP.NET 20
- [x] Blazor 20
- [x] Docker 20
- [x] Ollama 20

## 2. Accuracy

- [x] Every C# exercise with console output matches `dotnet run` (`RUN_DOTNET=1 npx vitest run tests/csharp-run.test.ts`).
- [x] Fact-check pass on ASP.NET, Blazor, Docker and Ollama: API names, flags, defaults and sample outputs checked against official docs or source, and fixed (43 fixes).
- [x] Fact-check pass on HTML and CSS: browser behaviour claims checked against MDN/specs and in Chromium (13 fixes).

## 3. Finishing a track

- [x] Final exam per track: unlocks when every unit is cleared, 20 questions drawn from the whole track, pass mark 17.
- [x] Certificate: passing the exam shows a certificate screen (track, date, score) and keeps it in Profile.
- [x] Badges for every track's first boss, for clearing a whole track, and for each certificate.

## 4. Polish

- [x] Onboarding on first launch: what CodeQuest is, how lessons work, pick a track.
- [x] Home shows "Continue" for the last lesson played.
- [x] Settings: daily goal, reduced motion, larger code text.
- [x] Accessibility: landmarks, heading order, labels, visible focus and contrast pass an axe-core scan.
- [x] Accessibility: works with a large system font size (checked at 150% text: no horizontal overflow on onboarding, home, map, concept or exercise screens).

## 5. Release

- [x] Version 1.0 in `package.json` and the Android build.
- [x] README describes all tracks and features.
- [x] Lint, typecheck, unit tests, the dotnet run test and the full browser playthrough (`ALL=1 node scripts/smoke.mjs`) all pass.

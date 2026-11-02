// Course content is plain data. Every exercise is one of five kinds; the UI
// and the checker switch on `kind`. Exercise ids are derived from position
// (see content/index.ts), so content files never carry ids.

export type TrackId = 'html' | 'css' | 'csharp' | 'aspnet' | 'blazor' | 'docker' | 'ollama';

/** Rendered beside HTML/CSS exercises. For the HTML track the learner's code is
 * the HTML and `css` styles it; for the CSS track the learner's code is the CSS
 * and `html` is the page it styles. */
export interface PreviewSpec {
  html?: string;
  css?: string;
}

interface ExerciseBase {
  /** One short instruction, e.g. "Close the heading tag." */
  prompt: string;
  /** Shown after the first miss. Nudge, don't give it away. */
  hint: string;
  /** Shown after solving or after the answer is revealed. 1–2 sentences. */
  explain: string;
  /** Live preview (HTML/CSS tracks only). */
  preview?: PreviewSpec;
  /** Simulated console output shown once solved (C# track). */
  output?: string;
}

/** Code with `___` gaps. Each blank is either tapped from `options` or, when
 * `options` is absent, typed by the learner. */
export interface FillExercise extends ExerciseBase {
  kind: 'fill';
  code: string;
  blanks: { answer: string[]; options?: string[] }[];
}

/** Tap tokens in order to build a line of code. `tokens` holds the pieces of
 * `answer` plus distractors; it is shuffled at runtime. */
export interface BuildExercise extends ExerciseBase {
  kind: 'build';
  answer: string[];
  distractors: string[];
  /** Other accepted token orders. */
  alt?: string[][];
}

/** Lines given in the CORRECT order; shuffled at runtime, learner taps them in
 * order. */
export interface OrderExercise extends ExerciseBase {
  kind: 'order';
  lines: string[];
}

/** Code with exactly one `[[wrong]]` marker. The learner taps the wrong token,
 * then picks its fix from `options` (which must include `fix`). */
export interface FixExercise extends ExerciseBase {
  kind: 'fix';
  code: string;
  fix: string;
  options: string[];
}

/** Type one short line. If `template` is given it contains one `___` where the
 * typed line goes (used for preview/context). Matching ignores insignificant
 * whitespace; HTML/CSS also ignore case and quote style. */
export interface TypeExercise extends ExerciseBase {
  kind: 'type';
  template?: string;
  accept: string[];
}

/** One item on a write exercise's task checklist. Exactly one of `has`, `re`
 * or `not` is set. */
export interface WriteCheck {
  /** Shown as a task, e.g. "Print the total with Console.WriteLine". */
  label: string;
  /** Code that must appear. Compared like typed answers: spacing around
   * punctuation is ignored, and for HTML/CSS case and quote style too. */
  has?: string;
  /** A regular expression (source) the code must match. */
  re?: string;
  /** Flags for `re`, e.g. "i" or "s". */
  flags?: string;
  /** Code that must NOT appear (compared like `has`). */
  not?: string;
}

/** Desktop edition only: write several lines in a code editor. The editor
 * starts with `starter`; the answer passes when every check passes.
 * `solution` is shown when the answer is revealed and must pass the checks. */
export interface WriteExercise extends ExerciseBase {
  kind: 'write';
  starter: string;
  solution: string;
  checks: WriteCheck[];
}

export type Exercise = FillExercise | BuildExercise | OrderExercise | FixExercise | TypeExercise | WriteExercise;
export type ExerciseKind = Exercise['kind'];

export interface Lesson {
  title: string;
  concept: { body: string; code: string };
  exercises: Exercise[];
}

export interface Unit {
  title: string;
  /** One-line summary shown on the map. */
  blurb: string;
  lessons: Lesson[];
  boss: Exercise[];
}

/** Desktop edition: the extra write-the-code challenges for one unit, two per
 * lesson (`lessons[i]` belongs to the unit's lesson i). */
export interface DesktopUnit {
  lessons: WriteExercise[][];
  /** Laptop versions of shared exercises, keyed by place in the unit:
   * `'L3.4'` (lesson 3, exercise 4) or `'boss.2'`. Used for Windows
   * commands (curl.exe, $env:, PowerShell syntax); the phone keeps the
   * originals. An override keeps the original's `kind`. */
  overrides?: Record<string, Exercise>;
  /** Laptop versions of concept cards, keyed by lesson number (1-based). */
  concepts?: Record<number, Lesson['concept']>;
  /** Items that keep Linux-style commands on purpose because they run on a
   * Linux server or in a container, keyed like `overrides` (`'L2.3'`,
   * `'boss.1'`, `'L4.W2'`, `'L1.concept'`), with the reason. */
  linuxOk?: Record<string, string>;
}

/** Content as authored: the written units of a track. */
export interface TrackContent {
  id: TrackId;
  units: Unit[];
}

/** An exercise plus where it lives, built by the content index. */
export interface IndexedExercise {
  id: string;
  track: TrackId;
  unitIndex: number;
  exercise: Exercise;
}

// ---- Tool tours (desktop edition) --------------------------------------
// A tour walks through a mock of a real tool (VS Code, Visual Studio, browser
// DevTools, Docker Desktop, a terminal). Each step is passed by clicking the
// right part of the screen, or by typing a command at its terminal.

export type MockScreenId = 'vscode' | 'visualstudio' | 'devtools' | 'dockerdesktop' | 'terminal';

interface TourStepBase {
  prompt: string;
  hint: string;
  explain: string;
}

/** Click the element carrying `data-target={target}` on the mock screen. */
export interface ClickStep extends TourStepBase {
  target: string;
}

/** Type a command at the screen's terminal or console. Matching works like a
 * type exercise on a code track (case-sensitive, spacing-tolerant). */
export interface CommandStep extends TourStepBase {
  command: string[];
  /** What the command prints. */
  output?: string;
}

export type TourStep = ClickStep | CommandStep;

export interface Tour {
  title: string;
  blurb: string;
  screen: MockScreenId;
  /** Which version of the screen to draw, e.g. Visual Studio while debugging. */
  variant?: string;
  steps: TourStep[];
}

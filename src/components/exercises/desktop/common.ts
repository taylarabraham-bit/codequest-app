import { isCommand, joinTokens } from '../../../engine/check';
import type { Exercise, TrackId } from '../../../engine/types';
import type { TermEntry } from '../../desktop/MockTerminal';
import type { WidgetProps } from '../common';

export interface DesktopWidgetProps<E> extends WidgetProps<E> {
  /** Wrong checks so far on this exercise (the word bank shows after one). */
  misses: number;
  /** Commands already run in this session, for terminal exercises. */
  termLog: TermEntry[];
  /** Console output to print once a terminal command has run. */
  output?: string;
}

/** Exercises answered at a terminal prompt instead of in a file: one typed or
 * built line that is a shell (or Ollama chat) command. */
export function isTerminalExercise(ex: Exercise, track: TrackId): boolean {
  if (ex.kind === 'type') return !ex.template && isCommand(ex.accept[0], track);
  if (ex.kind === 'build') return isCommand(joinTokens(ex.answer, track), track);
  return false;
}

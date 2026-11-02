import type { TrackId } from '../../engine/types';

export interface WidgetState {
  ready: boolean;
  correct: boolean;
  /** The learner's code as it stands, for the live preview. */
  code: string;
}

export interface WidgetProps<E> {
  ex: E;
  track: TrackId;
  /** Stable per exercise; seeds shuffles. */
  seed: string;
  locked: boolean;
  onChange: (s: WidgetState) => void;
  onTap: () => void;
}

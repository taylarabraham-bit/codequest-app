import { useDeferredValue } from 'react';
import { previewDoc } from '../engine/check';
import type { PreviewSpec, TrackId } from '../engine/types';

/** Renders the learner's current code in a sandboxed frame (no scripts). */
export function Preview({ track, code, spec, label = 'Live preview' }: { track: TrackId; code: string; spec: PreviewSpec; label?: string }) {
  const doc = useDeferredValue(previewDoc(track, code, spec));
  return (
    <div className="preview-wrap">
      <div className="preview-label">{label}</div>
      <iframe className="preview" title="Preview" sandbox="" srcDoc={doc} />
    </div>
  );
}

export function ConsoleOut({ text }: { text: string }) {
  return <div className="console pop">{text}</div>;
}

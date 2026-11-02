import { useEffect, useState } from 'react';
import { checkWrite } from '../../../engine/check';
import type { WriteExercise } from '../../../engine/types';
import { CodeEditor } from '../../desktop/CodeEditor';
import type { DesktopWidgetProps } from './common';

/** Write several lines in the editor, starting from the exercise's starter
 * code. Correct when every check on the task list passes. */
export function DWrite({ ex, track, locked, onChange }: DesktopWidgetProps<WriteExercise>) {
  const [code, setCode] = useState(ex.starter);

  const update = (v: string) => {
    setCode(v);
    onChange({ ready: v.trim() !== '' && v !== ex.starter, correct: checkWrite(v, ex, track).every(Boolean), code: v });
  };

  // The starter code is the live preview until the learner types.
  useEffect(() => {
    onChange({ ready: false, correct: false, code: ex.starter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <CodeEditor value={code} onChange={update} track={track} readOnly={locked} />;
}

import type { ReactNode } from 'react';

export interface MockProps {
  variant?: string;
  /** A live terminal or console, drawn where the tool has one. */
  terminal?: ReactNode;
}

/** A clickable part of a mock screen. Tours check clicks by `target`. */
export function Hit({
  t,
  children,
  className = '',
  title,
  as = 'button',
}: {
  t: string;
  children?: ReactNode;
  className?: string;
  title?: string;
  as?: 'button' | 'div' | 'span' | 'li';
}) {
  const Tag = as;
  return (
    <Tag data-target={t} className={`mk-hit ${className}`} title={title} aria-label={title} type={as === 'button' ? 'button' : undefined}>
      {children}
    </Tag>
  );
}

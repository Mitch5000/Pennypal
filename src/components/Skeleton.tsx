import React, { useEffect, useState } from 'react';

/**
 * True for `delay` ms after a view mounts. Because each view is mounted fresh
 * on a tab switch, this gives a short, natural skeleton "beat" on navigation -
 * and it combines with the real data `loading` flag for the initial fetch.
 */
export function useMountSkeleton(delay = 380): boolean {
  const [mounting, setMounting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setMounting(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return mounting;
}

/** A single shimmering placeholder block. Always pass a rounded-* class. */
export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;

/** Card shell matching the app's surfaces. */
export const SkeletonCard: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className = '',
  children,
}) => <div className={`bg-card border border-line rounded-2xl ${className}`}>{children}</div>;

/** Mirrors a Dashboard / Reports stat card. */
export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <SkeletonCard className={`p-6 ${className}`}>
    <div className="flex items-start justify-between">
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-7 w-32 rounded-md" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className="w-11 h-11 rounded-xl" />
    </div>
  </SkeletonCard>
);

/** Mirrors a chart panel. */
export const ChartSkeleton: React.FC<{ className?: string; height?: number }> = ({
  className = '',
  height = 220,
}) => (
  <SkeletonCard className={`p-6 ${className}`}>
    <Skeleton className="h-4 w-32 rounded mb-2" />
    <Skeleton className="h-3 w-44 rounded mb-6" />
    <Skeleton className="rounded-xl w-full" style={{ height }} />
  </SkeletonCard>
);

/** A list of placeholder rows - recent transactions, table bodies, etc. */
export const RowsSkeleton: React.FC<{ n?: number; divider?: boolean }> = ({ n = 5, divider = false }) => (
  <div className={divider ? 'divide-y divide-line' : 'space-y-3'}>
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-3">
        <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 rounded" style={{ width: `${45 + ((i * 13) % 35)}%` }} />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <Skeleton className="h-4 w-16 rounded flex-shrink-0" />
      </div>
    ))}
  </div>
);

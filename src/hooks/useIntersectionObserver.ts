'use client';
import { useEffect, useState, RefObject } from 'react';

// The function signature now correctly accepts a RefObject
// where the .current property can be an Element OR null.
function useIntersectionObserver(
  elementRef: RefObject<Element | null>,
  { threshold = 0.1, root = null, rootMargin = '0%' }: IntersectionObserverInit
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !node) return;

    const observer = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin,
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin]);

  return entry;
}

export default useIntersectionObserver;
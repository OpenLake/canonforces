'use client';
import React, { useRef, ReactNode } from 'react';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';

interface LazyLoadProps {
  children: ReactNode;
}

const LazyLoad: React.FC<LazyLoadProps> = ({ children }) => {
  // Use the more specific HTMLDivElement type
  const ref = useRef<HTMLDivElement>(null); 
  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;

  return (
    // The ref type now correctly matches the div element
    <div ref={ref}>
      {isVisible && children}
    </div>
  );
};

export default LazyLoad;
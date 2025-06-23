import React, { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

interface PerformanceMonitorProps {
  componentName: string;
  children: React.ReactNode;
  threshold?: number; // Log warning if render time exceeds this (ms)
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  componentName, 
  children, 
  threshold = 100 
}) => {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTime.current;
      
      console.log(`${componentName} total lifetime: ${totalLifetime.toFixed(2)}ms`);
    };
  }, [componentName]);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    const metrics: PerformanceMetrics = {
      componentName,
      renderTime,
      timestamp: Date.now()
    };

    // Log performance metrics
    if (renderTime > threshold) {
      console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    } else {
      console.log(`✅ ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }

    // Store metrics for analysis
    if (typeof window !== 'undefined') {
      const existingMetrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      existingMetrics.push(metrics);
      
      // Keep only last 100 metrics to avoid storage bloat
      if (existingMetrics.length > 100) {
        existingMetrics.splice(0, existingMetrics.length - 100);
      }
      
      localStorage.setItem('performance_metrics', JSON.stringify(existingMetrics));
    }

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name: `${componentName}_render`,
        value: Math.round(renderTime)
      });
    }
  });

  return <>{children}</>;
};

export default PerformanceMonitor;

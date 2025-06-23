import React, { useEffect, useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
  timestamp: number;
}

interface PerformanceOptimizerProps {
  componentName: string;
  children: React.ReactNode;
  threshold?: number;
  enableMemoryTracking?: boolean;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  componentName,
  children,
  threshold = 100,
  enableMemoryTracking = false
}) => {
  const renderStartTime = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    let memoryUsage: number | undefined;
    if (enableMemoryTracking && 'memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize;
    }

    const newMetric: PerformanceMetrics = {
      renderTime,
      memoryUsage,
      componentName,
      timestamp: Date.now()
    };

    setMetrics(prev => [...prev.slice(-9), newMetric]);

    // Log performance warnings
    if (renderTime > threshold) {
      console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      
      if (renderTime > threshold * 2) {
        toast({
          title: 'Performance Warning',
          description: `${componentName} is rendering slowly (${renderTime.toFixed(0)}ms)`,
          variant: 'destructive',
          duration: 3000,
        });
      }
    }

    // Store metrics for analysis
    if (typeof window !== 'undefined') {
      const existingMetrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      existingMetrics.push(newMetric);
      
      // Keep only last 100 metrics
      if (existingMetrics.length > 100) {
        existingMetrics.splice(0, existingMetrics.length - 100);
      }
      
      localStorage.setItem('performance_metrics', JSON.stringify(existingMetrics));
    }
  });

  return <>{children}</>;
};

export default PerformanceOptimizer;

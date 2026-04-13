import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number;
  overscan?: number;
}

interface VirtualItem {
  index: number;
  start: number;
  size: number;
  key: string | number;
}

export function useVirtualScroll<T extends { id: string | number }>(
  items: T[],
  { itemHeight, overscan = 3 }: UseVirtualScrollOptions
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  // 监听容器尺寸变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // 计算可见范围
  const virtualItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const result: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        index: i,
        start: i * itemHeight,
        size: itemHeight,
        key: items[i].id,
      });
    }

    return result;
  }, [items, scrollTop, containerHeight, itemHeight, overscan]);

  // 计算总高度
  const totalHeight = items.length * itemHeight;

  // 处理滚动
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // 滚动到指定索引
  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);

  return {
    containerRef,
    virtualItems,
    totalHeight,
    scrollTop,
    handleScroll,
    scrollToIndex,
    containerHeight,
  };
}
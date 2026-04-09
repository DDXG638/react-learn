import { useState, useRef, useEffect } from 'react';

interface ProductSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function ProductSearch({ onSearch, placeholder = '搜索商品...' }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number | undefined>(undefined);

  // 使用 useRef 存储上次的值，用于对比
  const prevQueryRef = useRef<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // 防抖处理：使用 useRef 存储定时器 ID
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      // 只有值真正变化时才触发搜索
      if (value !== prevQueryRef.current) {
        prevQueryRef.current = value;
        onSearch(value);
      }
    }, 300);
  };

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 使用 ref 实现 focus/blur 功能
  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  // 暴露 focus 方法给父组件（通过 ref）
  useEffect(() => {
    // 模拟外部调用 focus
    console.log('[ProductSearch] 组件挂载，input 准备就绪');
  }, []);

  return (
    <div className="product-search">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="search-input"
      />
      {query && (
        <button onClick={handleClear} className="btn-clear-search">
          ✕
        </button>
      )}
    </div>
  );
}

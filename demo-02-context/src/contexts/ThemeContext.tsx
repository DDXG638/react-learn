import { createContext, useState, useCallback, useMemo, useContext } from 'react';
import type { Theme, ThemeContextType } from '../types';

// 创建 Context（指定类型，默认值为 undefined）
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider 组件
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // 切换主题
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // 使用 useMemo 缓存 value，避免不必要的重渲染
  // 这是 Context 性能优化的关键点
  const value = useMemo(() => ({
    theme,
    toggleTheme,
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 自定义 Hook：方便消费 Context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

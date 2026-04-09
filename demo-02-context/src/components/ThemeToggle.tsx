import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="btn-theme">
      {theme === 'light' ? '🌙' : '☀️'} 切换主题
    </button>
  );
}

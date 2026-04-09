// 用户类型
export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'editor' | 'viewer';
}

// 菜单项类型
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  permission?: 'admin' | 'editor' | 'viewer' | 'all';
}

// 主题类型
export type Theme = 'light' | 'dark';

// Auth Context 类型
export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: MenuItem['permission']) => boolean;
}

// Theme Context 类型
export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

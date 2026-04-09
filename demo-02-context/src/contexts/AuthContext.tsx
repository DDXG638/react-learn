import { createContext, useState, useCallback, useContext } from 'react';
import type { User, AuthContextType, MenuItem } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 模拟用户数据
const mockUsers: Record<string, User> = {
  admin: {
    id: '1',
    name: '管理员',
    avatar: '👨‍💼',
    role: 'admin',
  },
  editor: {
    id: '2',
    name: '编辑',
    avatar: '👩‍💻',
    role: 'editor',
  },
  viewer: {
    id: '3',
    name: '游客',
    avatar: '👤',
    role: 'viewer',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((user: User) => {
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // 权限检查函数
  const hasPermission = useCallback((permission: MenuItem['permission']): boolean => {
    if (!user) return false;
    if (permission === 'all') return true;
    if (permission === 'admin') return user.role === 'admin';
    if (permission === 'editor') return user.role === 'admin' || user.role === 'editor';
    if (permission === 'viewer') return true; // 所有登录用户都有 viewer 权限
    return false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 导出模拟用户，方便演示
export { mockUsers };

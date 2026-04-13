import { create } from 'zustand';
import type { User } from '../types';

interface UserState {
  users: User[];
  selectedUser: User | null;
  setUsers: (users: User[]) => void;
  selectUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

// 模拟数据
const mockUsers: User[] = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', role: 'admin', avatar: '👨‍💻', status: 'active', createdAt: '2024-01-15' },
  { id: '2', name: '李四', email: 'lisi@example.com', role: 'editor', avatar: '👩‍💼', status: 'active', createdAt: '2024-02-20' },
  { id: '3', name: '王五', email: 'wangwu@example.com', role: 'viewer', avatar: '👨‍🎨', status: 'inactive', createdAt: '2024-03-10' },
  { id: '4', name: '赵六', email: 'zhaoliu@example.com', role: 'editor', avatar: '👩‍💻', status: 'active', createdAt: '2024-04-05' },
];

export const useUserStore = create<UserState>((set) => ({
  users: mockUsers,
  selectedUser: null,
  setUsers: (users) => set({ users }),
  selectUser: (user) => set({ selectedUser: user }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter((u) => u.id !== id),
  })),
}));
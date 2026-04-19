'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useContextSelector, shallow } from '../hooks/useContextSelector';

/**
 * 模拟一个大型 Store（类似 Zustand）
 */
interface StoreState {
  user: { name: string; age: number };
  theme: 'light' | 'dark';
  notifications: string[];
  lastUpdated: number;
}

interface StoreActions {
  setTheme: (theme: 'light' | 'dark') => void;
  setUserName: (name: string) => void;
  addNotification: (msg: string) => void;
}

type Store = StoreState & StoreActions;

const StoreContext = createContext<Store | null>(null);

function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>({
    user: { name: 'Tom', age: 18 },
    theme: 'light',
    notifications: ['欢迎回来'],
    lastUpdated: Date.now(),
  });

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState((prev) => ({ ...prev, theme, lastUpdated: Date.now() }));
  }, []);

  const setUserName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, name },
      lastUpdated: Date.now(),
    }));
  }, []);

  const addNotification = useCallback((msg: string) => {
    setState((prev) => ({
      ...prev,
      notifications: [...prev.notifications, msg],
      lastUpdated: Date.now(),
    }));
  }, []);

  return (
    <StoreContext.Provider
      value={{ ...state, setTheme, setUserName, addNotification }}
    >
      {children}
    </StoreContext.Provider>
  );
}

/**
 * 只订阅 theme 的组件
 */
function ThemeDisplay() {
  const theme = useContextSelector(
    StoreContext,
    (ctx) => ctx!.theme
  );

  console.log('[ThemeDisplay] 渲染了');

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', margin: '10px 0' }}>
      <h3>ThemeDisplay（只订阅 theme）</h3>
      <p>当前主题：{theme}</p>
    </div>
  );
}

/**
 * 只订阅 user.name 的组件
 */
function UserNameDisplay() {
  const userName = useContextSelector(
    StoreContext,
    (ctx) => ctx!.user.name
  );

  console.log('[UserNameDisplay] 渲染了');

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', margin: '10px 0' }}>
      <h3>UserNameDisplay（只订阅 user.name）</h3>
      <p>用户名：{userName}</p>
    </div>
  );
}

/**
 * 只订阅 notifications 的组件
 */
function NotificationsDisplay() {
  const notifications = useContextSelector(
    StoreContext,
    (ctx) => ctx!.notifications,
    shallow
  );

  console.log('[NotificationsDisplay] 渲染了');

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', margin: '10px 0' }}>
      <h3>NotificationsDisplay（只订阅 notifications）</h3>
      <ul>
        {notifications.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 使用原始 useContext 的组件（对比）
 */
function RawContextUser() {
  const ctx = useContext(StoreContext);

  console.log('[RawContextUser] 渲染了');

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', margin: '10px 0' }}>
      <h3>RawContextUser（原始 useContext）</h3>
      <p>用户名：{ctx?.user.name}，主题：{ctx?.theme}</p>
    </div>
  );
}

/**
 * 演示页面
 */
export default function SelectorDemo() {
  return (
    <StoreProvider>
      <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>选择器模式演示</h2>
        <p>打开控制台，点击下方按钮观察哪些组件重渲染</p>

        <Controls />
        <ThemeDisplay />
        <UserNameDisplay />
        <NotificationsDisplay />
        <RawContextUser />
      </div>
    </StoreProvider>
  );
}

/**
 * 操作按钮区域
 */
function Controls() {
  const ctx = useContext(StoreContext)!;

  return (
    <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <button onClick={() => ctx.setTheme('light')}>Light</button>
      <button onClick={() => ctx.setTheme('dark')}>Dark</button>
      <button onClick={() => ctx.setUserName('Tom')}>Tom</button>
      <button onClick={() => ctx.setUserName('Jerry')}>Jerry</button>
      <button onClick={() => ctx.addNotification('新消息 ' + Date.now())}>添加通知</button>
    </div>
  );
}

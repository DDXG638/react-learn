import { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ContextMenu } from './components/Menu/ContextMenu';
import { Layout } from './components/Layout/Layout';
import { UserInfo } from './components/UserInfo';
import { Login } from './components/Login';
import { ThemeToggle } from './components/ThemeToggle';
import type { MenuItem } from './types';
import './App.css';

// 模拟菜单数据
const menuItems: MenuItem[] = [
  {
    id: '1',
    label: '首页',
    icon: '🏠',
    path: '/',
    permission: 'all',
  },
  {
    id: '2',
    label: '用户管理',
    icon: '👥',
    permission: 'admin',
    children: [
      { id: '2-1', label: '用户列表', icon: '📋', path: '/users' },
      { id: '2-2', label: '添加用户', icon: '➕', path: '/users/add' },
    ],
  },
  {
    id: '3',
    label: '内容管理',
    icon: '📝',
    permission: 'editor',
    children: [
      { id: '3-1', label: '文章列表', icon: '📄', path: '/articles' },
      { id: '3-2', label: '发布文章', icon: '🚀', path: '/articles/add' },
    ],
  },
  {
    id: '4',
    label: '设置',
    icon: '⚙️',
    children: [
      { id: '4-1', label: '个人设置', icon: '👤', path: '/settings' },
      { id: '4-2', label: '系统设置', icon: '🔧', path: '/settings/system', permission: 'admin' },
    ],
  },
  {
    id: '5',
    label: '退出登录',
    icon: '🚪',
    permission: 'all',
  },
];

// App 内容组件（需要在 AuthProvider 和 ThemeProvider 内部）
function AppContent() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const [currentPath, setCurrentPath] = useState('/');

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    console.log('导航到:', path);
  };

  return (
    <div className={`app ${theme}`}>
      {/* 登录面板 */}
      <Login />

      {user && (
        <>
          {/* 顶部工具栏 */}
          <div className="toolbar">
            <ThemeToggle />
            <div className="toolbar-info">
              <UserInfo />
              <span className="current-path">当前路径: {currentPath}</span>
            </div>
          </div>

          {/* 布局 */}
          <Layout
            menuItems={menuItems}
            userRole={user.role}
            onNavigate={handleNavigate}
            onLogout={logout}
          >
            <div className="content">
              <h2>欢迎回来，{user.name}！</h2>
              <p>当前角色：<strong>{user.role}</strong></p>
              <p>权限说明：</p>
              <ul>
                <li>👨‍💼 <strong>管理员</strong>：可以访问所有功能</li>
                <li>👩‍💻 <strong>编辑</strong>：可以访问内容管理和个人设置</li>
                <li>👤 <strong>游客</strong>：只能访问首页和个人设置</li>
              </ul>

              <div className="demo-info">
                <h3>📚 Demo 说明</h3>
                <div className="demo-section">
                  <h4>左侧菜单：Props Drilling 示例</h4>
                  <p>观察控制台，点击菜单项可以看到 props 如何层层传递。</p>
                  <p>即使中间组件（Layout、Menu）不需要这些数据，也要传递下去。</p>
                </div>
                <div className="demo-section">
                  <h4>右侧菜单：Context 解决方案</h4>
                  <p>使用 useContext 直接获取用户信息，无需层层传递 props。</p>
                  <p>切换用户角色，观察两个菜单的权限过滤效果。</p>
                </div>
              </div>
            </div>
          </Layout>

          {/* 右侧 Context 菜单对比 */}
          <ContextMenu items={menuItems} />
        </>
      )}
    </div>
  );
}

// 根组件：包装 Context Providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

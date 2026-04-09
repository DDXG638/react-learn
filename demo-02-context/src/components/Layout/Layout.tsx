import type { MenuItem } from '../../types';
import { Menu } from '../Menu/Menu';
import { UserInfo } from '../UserInfo';

interface LayoutProps {
  // Layout 本身不需要这些数据，只是透传给子组件
  // 这就是 Props drilling 的典型场景
  menuItems: MenuItem[];
  userRole?: 'admin' | 'editor' | 'viewer';
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
  children?: React.ReactNode;
}

export function Layout({
  menuItems,
  userRole,
  onNavigate,
  onLogout,
  children,
}: LayoutProps) {
  return (
    <div className="layout">
      <header className="layout-header">
        {/* Header 也不需要 userRole，但需要传递给 UserInfo */}
        <UserInfo />
        <div className="header-actions">
          <button onClick={onLogout} className="btn-logout">
            退出登录
          </button>
        </div>
      </header>
      <div className="layout-body">
        {/* Menu 组件需要接收所有 props，即使它不需要，也要继续传递 */}
        <Menu
          menuItems={menuItems}
          userRole={userRole}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  );
}

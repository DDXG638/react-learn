import { SubMenu } from './SubMenu';
import type { MenuItem } from '../../types';

interface MenuProps {
  // Props drilling：顶层组件需要传递这些数据
  // 即使 Layout、Header 等组件不需要，也要层层传递
  menuItems: MenuItem[];
  userRole?: 'admin' | 'editor' | 'viewer';
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
}

export function Menu({ menuItems, userRole, onNavigate, onLogout }: MenuProps) {
  return (
    <nav className="menu">
      <div className="menu-title">📋 导航菜单</div>
      <div className="menu-list">
        {menuItems.map(item => (
          // Props drilling 开始：每个菜单项都要传递这些 props
          <SubMenu
            key={item.id}
            item={item}
            level={0}
            onNavigate={onNavigate}
            userRole={userRole}
            onLogout={onLogout}
          />
        ))}
      </div>
      <div className="menu-tip">
        💡 使用 Context 可以避免 Props Drilling
      </div>
    </nav>
  );
}

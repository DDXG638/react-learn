import { MenuItem } from './MenuItem';
import type { MenuItem as MenuItemType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// 使用 Context 的菜单组件
// 避免 Props drilling，直接从 Context 获取数据
export function ContextMenu({ items }: { items: MenuItemType[] }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const renderMenuItems = (menuItems: MenuItemType[], level: number = 0) => {
    return menuItems.map(item => {
      // 权限过滤
      if (item.permission && item.permission !== 'all' && user) {
        const permissionHierarchy: Record<string, number> = { admin: 3, editor: 2, viewer: 1 };
        const userLevel = permissionHierarchy[user.role] || 0;
        const requiredLevel = permissionHierarchy[item.permission] || 0;
        if (userLevel < requiredLevel) return null;
      }

      return (
        <div key={item.id}>
          <MenuItem
            item={item}
            level={level}
            onLogout={item.label === '退出登录' ? handleLogout : undefined}
          />
          {item.children && item.children.length > 0 && (
            <div style={{ marginLeft: 8 }}>
              {renderMenuItems(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <nav className="menu context-menu">
      <div className="menu-title">✨ Context 菜单（无 Props Drilling）</div>
      <div className="menu-list">
        {renderMenuItems(items)}
      </div>
      <div className="menu-tip">
        ✅ 直接从 Context 获取用户信息，无需层层传递
      </div>
    </nav>
  );
}

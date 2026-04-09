import type { MenuItem as MenuItemType } from '../../types';
import { MenuItem } from './MenuItem';

interface SubMenuProps {
  item: MenuItemType;
  level: number;
  // Props drilling：即使 SubMenu 本身不需要这些数据，
  // 也要传递给子组件 MenuItem
  onNavigate?: (path: string) => void;
  userRole?: 'admin' | 'editor' | 'viewer';
  onLogout?: () => void;
}

export function SubMenu({ item, level, onNavigate, userRole, onLogout }: SubMenuProps) {
  // 过滤需要权限的菜单项
  if (item.permission && item.permission !== 'all') {
    const permissionMap = {
      admin: ['admin'],
      editor: ['admin', 'editor'],
      viewer: ['admin', 'editor', 'viewer'],
    };
    const userRole2 = userRole || 'viewer';
    if (!permissionMap[userRole2]?.includes(item.permission)) {
      return null; // 没有权限，不渲染
    }
  }

  return (
    <div className="submenu">
      <MenuItem
        item={item}
        level={level}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      {item.children && item.children.length > 0 && (
        <div className="submenu-children">
          {item.children.map(child => (
            // 递归渲染子菜单，继续传递 props（Props drilling 的核心问题）
            <SubMenu
              key={child.id}
              item={child}
              level={level + 1}
              onNavigate={onNavigate}
              userRole={userRole}
              onLogout={onLogout}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import type { MenuItem as MenuItemType } from '../../types';

interface MenuItemProps {
  item: MenuItemType;
  level: number;
  // Props drilling：每个层级的组件都需要传递这些 props
  // 即使它们本身不需要这些数据，也要传给子组件
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
}

export function MenuItem({ item, level, onNavigate, onLogout }: MenuItemProps) {
  const paddingLeft = level * 16 + 12;

  const handleClick = () => {
    if (item.path && onNavigate) {
      onNavigate(item.path);
    }
    if (item.label === '退出登录' && onLogout) {
      onLogout();
    }
  };

  return (
    <div
      className="menu-item"
      style={{ paddingLeft }}
      onClick={handleClick}
    >
      <span className="menu-icon">{item.icon}</span>
      <span className="menu-label">{item.label}</span>
      {item.children && item.children.length > 0 && (
        <span className="menu-arrow">▶</span>
      )}
    </div>
  );
}

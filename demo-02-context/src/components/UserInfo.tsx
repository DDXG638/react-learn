import { useAuth } from '../contexts/AuthContext';

export function UserInfo() {
  // 使用 useContext 消费 AuthContext，避免层层传递 props
  const { user } = useAuth();

  if (!user) {
    return <div className="user-info user-info--guest">👤 未登录</div>;
  }

  return (
    <div className="user-info">
      <span className="user-avatar">{user.avatar}</span>
      <span className="user-name">{user.name}</span>
      <span className="user-role">（{user.role}）</span>
    </div>
  );
}

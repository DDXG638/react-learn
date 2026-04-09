import { useAuth, mockUsers } from '../contexts/AuthContext';

export function Login() {
  const { login, user } = useAuth();

  const handleLogin = (role: keyof typeof mockUsers) => {
    login(mockUsers[role]);
  };

  if (user) {
    return null;
  }

  return (
    <div className="login-panel">
      <div className="login-title">请选择登录角色</div>
      <div className="login-buttons">
        {(Object.keys(mockUsers) as Array<keyof typeof mockUsers>).map(key => (
          <button
            key={key}
            onClick={() => handleLogin(key)}
            className="btn-login"
          >
            <span className="btn-icon">{mockUsers[key].avatar}</span>
            <span>{mockUsers[key].name}</span>
            <span className="btn-role">（{mockUsers[key].role}）</span>
          </button>
        ))}
      </div>
    </div>
  );
}

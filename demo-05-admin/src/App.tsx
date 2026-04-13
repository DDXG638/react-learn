import { useState, useMemo, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTheme } from './hooks/useTheme';
import { useUserStore } from './stores/userStore';
import { useCartStore, mockProducts } from './stores/cartStore';
import { useRequest } from './hooks/useRequest';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDebounce } from './hooks/useDebounce';

type Tab = 'users' | 'cart' | 'hooks' | 'theme' | 'imperative';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const { theme, setTheme } = useTheme();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'users', label: '用户管理' },
    { id: 'cart', label: '购物车' },
    { id: 'hooks', label: '自定义 Hooks' },
    { id: 'theme', label: '主题切换' },
    { id: 'imperative', label: '命令式暴露' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold p-4">电商后台管理系统</h1>
        <nav className="flex gap-1 px-4 pb-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'cart' && <CartPage />}
        {activeTab === 'hooks' && <HooksDemo />}
        {activeTab === 'theme' && <ThemeDemo theme={theme} setTheme={setTheme} />}
        {activeTab === 'imperative' && <ImperativeDemo />}
      </main>
    </div>
  );
}

// ============ 用户管理页 ============
function UserManagement() {
  const { users, deleteUser } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.includes(debouncedSearch) || user.email.includes(debouncedSearch)
    );
  }, [users, debouncedSearch]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="搜索用户名称或邮箱..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="text-left p-4">用户</th>
              <th className="text-left p-4">邮箱</th>
              <th className="text-left p-4">角色</th>
              <th className="text-left p-4">状态</th>
              <th className="text-left p-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{user.avatar}</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    user.status === 'active' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.status === 'active' ? '活跃' : '未激活'}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-800 mr-4"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          共 {filteredUsers.length} 条，第 {currentPage} / {totalPages} 页
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            上一页
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ 购物车页 ============
function CartPage() {
  const { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((p) => p.name.includes(debouncedSearch));
  }, [debouncedSearch]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 商品列表 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">商品列表</h2>
        <input
          type="text"
          placeholder="搜索商品..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-800"
        />
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{product.image}</span>
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-purple-600 dark:text-purple-400">¥{product.price}</div>
                </div>
              </div>
              <button
                onClick={() => addItem(product)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                加入购物车
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 购物车 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">购物车</h2>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              清空购物车
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            购物车是空的
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.product.image}</span>
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-purple-600 dark:text-purple-400">
                      ¥{item.product.price} × {item.quantity}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 汇总 */}
        {items.length > 0 && (
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>商品数量</span>
              <span>{totalItems()} 件</span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span>总计</span>
              <span className="text-purple-600 dark:text-purple-400">¥{totalPrice().toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ 自定义 Hooks 演示 ============
function HooksDemo() {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');

  // useRequest 示例
  const fetchData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { message: '数据获取成功', timestamp: Date.now() };
  };

  const { data, loading, error, execute } = useRequest(fetchData);

  // useLocalStorage 示例
  const [storedValue, setStoredValue] = useLocalStorage('demo-05-value', 'Hello');

  const debouncedValue = useDebounce(inputValue, 300);

  return (
    <div className="space-y-8">
      {/* useRequest */}
      <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">useRequest - 数据请求封装</h3>
        <div className="flex gap-4 items-center">
          <button
            onClick={execute}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? '加载中...' : '发起请求'}
          </button>
          {data && (
            <span className="text-green-600 dark:text-green-400">
              {data.message} - {new Date(data.timestamp).toLocaleTimeString()}
            </span>
          )}
          {error && (
            <span className="text-red-600">错误: {error.message}</span>
          )}
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
          特性: 自动loading状态管理、错误处理、生命周期钩子、组件卸载后不更新状态
        </p>
      </section>

      {/* useLocalStorage */}
      <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">useLocalStorage - 持久化存储</h3>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={storedValue}
            onChange={(e) => setStoredValue(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
          <button
            onClick={() => setStoredValue('Hello')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg"
          >
            重置
          </button>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
          当前值: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{storedValue}</code>
          - 刷新页面后数据依然保留
        </p>
      </section>

      {/* useDebounce */}
      <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">useDebounce - 防抖</h3>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入内容，300ms 后才会更新..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        />
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
          实时值: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{inputValue}</code>
          <br />
          <span className="text-green-600 dark:text-green-400">
            防抖值: <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">{debouncedValue}</code>
          </span>
        </p>
      </section>

      {/* useThrottle */}
      <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">useThrottle - 节流</h3>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg"
        >
          点击 ({count})
        </button>
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
          节流值: <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">{count}</code>
          - 连续点击不会立即更新
        </p>
      </section>
    </div>
  );
}

// ============ 主题切换演示 ============
function ThemeDemo({ theme, setTheme }: { theme: string; setTheme: (t: 'light' | 'dark' | 'auto') => void }) {
  return (
    <div className="space-y-6">
      <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">主题切换</h3>
        <div className="flex gap-4">
          {(['light', 'dark', 'auto'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                theme === t
                  ? 'bg-purple-600 text-white scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {t === 'light' ? '浅色' : t === 'dark' ? '深色' : '跟随系统'}
            </button>
          ))}
        </div>
      </section>

      <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">主题预览</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-500 text-white rounded-lg text-center">蓝色</div>
          <div className="p-4 bg-green-500 text-white rounded-lg text-center">绿色</div>
          <div className="p-4 bg-purple-500 text-white rounded-lg text-center">紫色</div>
          <div className="p-4 bg-orange-500 text-white rounded-lg text-center">橙色</div>
        </div>
      </section>

      <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">当前主题</h3>
        <p className="text-gray-600 dark:text-gray-400">
          当前: <span className="font-bold">{theme}</span>
          <br />
          <span className="text-sm">Zustand 持久化存储，刷新后依然保持选择</span>
        </p>
      </section>
    </div>
  );
}

// ============ 命令式暴露演示 ============
interface ModalRef {
  open: (title: string, message: string) => void;
  close: () => void;
}

const Modal = forwardRef<ModalRef>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState({ title: '', message: '' });

  useImperativeHandle(ref, () => ({
    open: (title: string, message: string) => {
      setContent({ title, message });
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">{content.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{content.message}</p>
        <button
          onClick={() => setIsOpen(false)}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          关闭
        </button>
      </div>
    </div>
  );
});

function ImperativeDemo() {
  const modalRef = useRef<ModalRef>(null);

  const showAlert = useCallback((type: 'info' | 'warning' | 'success') => {
    const configs = {
      info: { title: '提示', message: '这是一条提示信息' },
      warning: { title: '警告', message: '操作需要谨慎' },
      success: { title: '成功', message: '操作已完成' },
    };
    modalRef.current?.open(configs[type].title, configs[type].message);
  }, []);

  return (
    <div className="space-y-6">
      <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">useImperativeHandle + forwardRef</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          通过 ref 命令式调用子组件的方法，无需 props 传递回调
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => showAlert('info')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            显示提示
          </button>
          <button
            onClick={() => showAlert('warning')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
          >
            显示警告
          </button>
          <button
            onClick={() => showAlert('success')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            显示成功
          </button>
        </div>
      </section>

      <section className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">使用场景</h3>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
          <li>模态框 / 弹窗控制</li>
          <li>富文本编辑器命令</li>
          <li>视频播放器控制</li>
          <li>第三方组件封装</li>
        </ul>
      </section>

      <Modal ref={modalRef} />
    </div>
  );
}
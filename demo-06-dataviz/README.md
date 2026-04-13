# 第六章：React 性能优化

## 学习内容

### 1. 重复渲染优化

#### React.memo

`React.memo` 包装组件，仅在 props 变化时重新渲染：

```tsx
const Child = memo(function Child({ name }: { name: string }) {
  return <div>{name}</div>;
});

// 使用
<Child name={name} />
```

**对比：**
| 方式 | 重新渲染条件 |
|------|-------------|
| 无包装 | 父组件渲染就触发 |
| React.memo | props 引用变化 |
| React.memo + 自定义比较 | 自定义规则决定 |

#### useMemo / useCallback

- `useMemo`：缓存计算结果
- `useCallback`：缓存函数引用

```tsx
// useMemo 缓存 expensive 计算
const expensiveValue = useMemo(() => computeExpensive(a, b), [a, b]);

// useCallback 缓存回调，避免子组件不必要的渲染
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

<Child onClick={handleClick} />
```

### 2. 长列表优化

#### 虚拟滚动原理

只渲染可视区域内的元素：

```
[可见区域]
┌─────────────────────┐
│  Item 15            │ ← 实际 DOM
│  Item 16            │ ← 实际 DOM
│  Item 17            │ ← 实际 DOM
│  Item 18            │ ← 实际 DOM
│  Item 19            │ ← 实际 DOM
└─────────────────────┘
totalHeight = 100000 items × 56px = 5.6Mpx (虚拟高度)
```

**核心实现：**
1. 计算可见范围：`startIndex`, `endIndex`
2. 绝对定位渲染：`position: absolute; top: index * itemHeight`
3. 滚动时更新可见范围

### 3. 组件懒加载

```tsx
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./components/HeavyChart'));

function App() {
  const [show, setShow] = useState(false);

  return (
    <Suspense fallback={<div>加载中...</div>}>
      {show && <HeavyChart />}
    </Suspense>
  );
}
```

**效果：** 代码分割，按需加载，不影响首屏性能。

### 3.1 Suspense 实现原理

**核心概念：Suspense 本质上是一个特殊的 Error Boundary**

#### Suspense 不"感知"子组件，而是"捕获"挂起

```
React 渲染流程：
组件 render →
  如果需要等待 → 抛出 Promise（不是返回！）→
  React 捕获这个 Promise →
  显示 fallback
```

#### lazy() 的实现原理

```tsx
// React.lazy 的简化实现
function lazy(fn) {
  let error, result;
  let promise = fn().then(
    (m) => { result = m.default; error = null; },
    (e) => { error = e; }
  );

  return function LazyComponent() {
    if (error) throw error;      // 加载失败，抛出错误
    if (result) return result;   // 加载成功，返回组件
    throw promise;               // 加载中，抛出 Promise！
  };
}
```

#### Suspense 捕获机制

```tsx
// Suspense 内部简化逻辑
function Suspense({ children, fallback }) {
  try {
    return children;  // 尝试渲染子组件
  } catch (promise) {
    // 如果子组件 throw 了 promise（不是 Error）
    // React 识别出这是"挂起"而不是"错误"
    if (isThenable(promise)) {
      return fallback;  // 显示 fallback，等待 promise 解决
    }
    throw promise;  // 真正的 Error，继续抛出
  }
}
```

#### React.use() 的作用

```tsx
// React.use() 可以读取"挂起"的值
function Child() {
  const data = React.use(fetchDataPromise);  // 内部可能 throw promise

  return <div>{data}</div>;
}

// 当 fetchDataPromise 未解决时：
// - React.use() 抛出 promise
// - Suspense 捕获，显示 fallback
```

#### 完整流程图

```
<App>
  <Suspense fallback={<Loading />}>
    <LazyComponent />  ← 初始 throw promise
  </Suspense>
</App>

第一次渲染：
1. LazyComponent render()
2. 发现需要加载模块，throw promise
3. Suspense 捕获 promise，显示 fallback
4. Promise 解决，重新触发渲染
5. LazyComponent 再次 render，这次返回组件

第二次渲染（Promise 已解决）：
1. LazyComponent render()
2. 返回 JSX，Suspense 正常显示
```

#### 关键点

| 问题 | 答案 |
|------|------|
| Suspense 如何感知？ | 不感知，只是 try/catch 捕获 throw |
| 如何判断是挂起还是错误？ | Promise → fallback，Error → 抛出 |
| React.use() 做了什么？ | 读取可能挂起的值，如果未解决则 throw |
| 为什么能显示 fallback？ | Suspense 捕获了 throw 的 promise，显示 fallback 替代 |

### 4. Context 优化

#### 问题

Context value 变化会导致所有消费组件重新渲染：

```tsx
// 每次 theme 变化，value 是新对象 → 所有 Consumer 重新渲染
<ThemeContext.Provider value={{ theme, primary }}>
  <Consumer />
</ThemeContext.Provider>
```

#### 解决方案：useMemo

```tsx
const value = useMemo(() => ({
  theme,
  primary: theme === 'dark' ? '#a78bfa' : '#7c3aed',
}), [theme]);

// 只有 theme 变化时 value 才会重建
<ThemeContext.Provider value={value}>
  <Consumer />
</ThemeContext.Provider>
```

#### 进一步优化：拆分 Context

```tsx
// 按更新频率拆分
const ThemeContext = createContext({ color: 'blue' });    // 很少变
const UserContext = createContext({ name: 'xxx' });        // 经常变

// 高频更新的 Context 小范围包裹
<UserContext.Provider value={user}>
  <Avatar />  // 只用 UserContext
</UserContext.Provider>
```

---

## Demo 工程：数据可视化大屏

### 功能

1. **虚拟滚动长列表**：10万+数据渲染，仅渲染可见区域 ~17 个 DOM 节点
2. **React.memo 优化**：父组件状态变化，子组件不重渲染
3. **组件懒加载**：重量级组件按需加载，Suspense 降级
4. **Context 优化**：useMemo 避免无谓重渲染

### 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS 4.x
- @tanstack/react-virtual（虚拟滚动库）
- Zustand（状态管理）

### 项目结构

```
demo-06-dataviz/
├── src/
│   ├── components/        # UI 组件
│   ├── hooks/
│   │   └── useVirtualScroll.ts  # 手写虚拟滚动 Hook
│   ├── stores/           # Zustand Store
│   ├── types/
│   │   └── data.ts       # 数据类型和模拟数据生成
│   ├── App.tsx           # 主组件（4个 Tab）
│   └── main.tsx
└── package.json
```

---

## 面试题

### Q1: 多表单联动状态如何设计？避免全量重渲染？

**问题背景：** 表单联动复杂时，状态集中管理会导致无关字段变化也触发全部组件重渲染。

**解决方案：**

1. **状态拆分**：按表单/模块拆分状态
2. **useMemo 优化计算**：派生数据用 useMemo 缓存
3. **useCallback 优化回调**：避免子组件无谓渲染

```tsx
// 不好：所有字段在一个 state
const [form, setForm] = useState({ name: '', email: '', phone: '' });

// 好：按字段拆分，或使用 useReducer
const [name, setName] = useState('');
const [email, setEmail] = useState('');
// 联动计算用 useMemo
const isValid = useMemo(() => name && email.includes('@'), [name, email]);
```

### Q2: 长列表 10 万条数据如何优化？虚拟滚动原理？

**核心原理：**

1. **只渲染可见区域**：计算 `startIndex` 和 `endIndex`
2. **绝对定位**：每个 item 使用 `position: absolute; top: index * itemHeight`
3. **滚动时更新**：监听 scroll 事件，计算可见范围

```tsx
// 可见范围计算
const startIndex = Math.floor(scrollTop / itemHeight) - overscan;
const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan;

// 渲染
virtualItems.map(item => (
  <div style={{ position: 'absolute', top: item.start }}>
    {item.content}
  </div>
))
```

**库选择：**
- `@tanstack/react-virtual`：轻量、功能完善
- `react-window`：经典库

### Q3: 如何排查内存泄漏？常见场景？

**常见场景：**

1. **定时器未清理**
```tsx
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer); // 必须清理
}, []);
```

2. **事件监听未清理**
```tsx
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

3. **闭包引用**
```tsx
// 问题：timer 持有旧的 count 引用
useEffect(() => {
  setInterval(() => {
    setCount(count + 1); // count 永远是 0
  }, 1000);
}, []);

// 解决：使用函数式更新
setCount(c => c + 1);
```

4. **取消请求**
```tsx
useEffect(() => {
  let cancelled = false;
  fetchData().then(data => {
    if (!cancelled) setData(data);
  });
  return () => { cancelled = true; };
}, []);
```

**排查工具：**
- React DevTools Profiler
- Chrome DevTools Memory Snapshot
- `console.log` 辅助定位

---

## 运行项目

```bash
cd demo-06-dataviz
pnpm install
pnpm dev
```
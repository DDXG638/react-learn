# Demo 03: Hooks 进阶（useMemo / useCallback / useRef / useReducer）

> React 18 + TypeScript 学习第三章：Hooks 进阶

## 学习目标

本 Demo 聚焦以下核心知识点：

### 1. useMemo - 记忆化计算值
- 缓存昂贵计算的结果
- 避免不必要的计算
- 依赖数组的作用

### 2. useCallback - 记忆化回调函数
- 避免子组件不必要的渲染
- 配合 React.memo 使用
- 依赖数组的重要性

### 3. useRef - 持久化和 DOM 引用
- DOM 引用
- 持久化可变值（不同于 useState）
- 理解 useEffect 闭包捕获问题

### 4. useReducer - 复杂状态逻辑
- 替代多个 useState
- Action 模式统一管理状态
- 配合 Context 实现全局状态

## 面试题解析

### Q1: React.memo、useMemo、useCallback 三者的对比？

```tsx
// React.memo - 缓存组件
const Button = memo(({ onClick, children }) => {
  console.log('Button 渲染');
  return <button onClick={onClick}>{children}</button>;
});

// useMemo - 缓存计算值
const expensiveValue = useMemo(() => {
  console.log('计算中...');
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);

// useCallback - 缓存函数引用
const handleClick = useCallback(() => {
  console.log('点击');
}, []);

// 三者区别
memo    → 缓存组件渲染结果（props 没变就不重渲染）
useMemo → 缓存计算结果（依赖变化才重新计算）
useCallback → 缓存函数引用（等价于 useMemo(() => fn, deps)）
```

### Q1.1: useCallback 的真正作用是什么？

#### 每次渲染都会创建新的回调函数吗？

**是的。** 看这个组件：

```tsx
function ProductList({ products, onAddToCart }: Props) {
  // 每次渲染都会创建新的函数实例
  const handleAdd = (product: Product) => {
    onAddToCart(product);
  };

  return products.map(p => <Item key={p.id} onAdd={handleAdd} />);
}
```

每次 `ProductList` 重渲染，`handleAdd` 都是一个**全新的函数对象**。

#### 会有内存泄露吗？

**不会内存泄露。** JavaScript 有垃圾回收机制，当函数不再被引用时会被回收。

#### 真正的问题是什么？

**问题是"引用变化"导致的子组件重渲染，而不是内存泄露：**

```tsx
// 父组件
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 每次渲染都创建新函数
  const handleClick = () => {
    console.log('clicked');
  };

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>加一: {count}</button>
      {/* memo 化的子组件 */}
      <MemoizedChild onClick={handleClick} />
    </div>
  );
}
```

| 操作 | 不使用 useCallback | 使用 useCallback |
|------|-------------------|-----------------|
| 点击按钮 | Parent 重渲染 | Parent 重渲染 |
| handleClick | **新的函数引用** | 缓存的同一引用 |
| MemoizedChild | **也会重渲染**（因为 props 引用变了） | **不会重渲染**（props 相同） |

#### useCallback 解决的是什么？

```tsx
// ✅ 使用 useCallback 后，handleClick 引用稳定
const handleClick = useCallback(() => {
  console.log('clicked');
}, []); // 依赖数组为空，函数引用永远不变

// ✅ 或者有依赖的情况
const handleAdd = useCallback((product) => {
  onAddToCart(product);
}, [onAddToCart]); // 只有 onAddToCart 变化时才创建新函数
```

#### 总结

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 内存泄露 | ❌ 不会有，JS 有 GC | - |
| 子组件不必要的重渲染 | props 引用每次都变 | useCallback + React.memo |
| 闭包捕获过时值（useEffect） | 闭包捕获创建时的值，定时器等场景会卡住 | 函数式更新 / useRef |

**什么时候不用 useCallback：**
- 函数不会作为 props 传递
- 子组件没有用 React.memo 优化
- 没有在 useEffect 中使用闭包

**什么时候用 useCallback：**
- 函数作为 props 传递给 memo 化的子组件
- 函数被 useEffect 依赖（避免 Effect 频繁触发）

### Q2: useRef 与 useState 区别？

```tsx
// useState - 会触发组件重新渲染
const [count, setCount] = useState(0);
count + 1; // 下次渲染时 count 才会变化

// useRef - 不会触发重新渲染
const countRef = useRef(0);
countRef.current += 1; // 立即变化，但不触发重渲染

// useRef 的典型用途
const timerRef = useRef<number>();      // 存储定时器 ID
const inputRef = useRef<HTMLInputElement>(); // DOM 引用
const cacheRef = useRef<Map<string, any>>(); // 缓存（跨渲染持久）
```

### Q2.1: useRef 持久化原理？

#### useRef 的本质

```tsx
// useRef 内部简化实现
function useRef<T>(initialValue: T): { current: T } {
  // 实际上是这样一个结构
  return { current: initialValue };
}
```

**useRef 返回一个普通的 JavaScript 对象 `{ current: initialValue }`，React 保证这个对象在组件整个生命周期内保持同一个引用。**

#### 工作原理图解

```
组件首次渲染：
┌─────────────────────────────────────┐
│ useRef(0)                           │
│   ↓                                 │
│ { current: 0 }  ← 创建新对象        │
│   ↓                                 │
│ 存入 Fiber 的 memoizedState         │
└─────────────────────────────────────┘

组件再次渲染：
┌─────────────────────────────────────┐
│ useRef(0)                           │
│   ↓                                 │
│ { current: 0 }  ← 从 memoizedState  │
│   ↓          获取同一个对象！        │
│ React 检测到 ref 已存在              │
│ 直接返回现有 ref，忽略 initialValue  │
└─────────────────────────────────────┘
```

#### 为什么修改 current 不触发重渲染？

```tsx
function Counter() {
  const countRef = useRef(0);

  const handleClick = () => {
    countRef.current += 1;  // 修改 current
    // 注意：这里没有调用 setState，不会触发重渲染
    console.log(countRef.current); // 可以读取最新值
  };

  return <button onClick={handleClick}>点击</button>;
}
```

| 操作 | 触发重渲染？ | 原因 |
|------|-------------|------|
| `countRef.current = 5` | ❌ | 没有调用 setState，React 不知道状态变了 |
| `setCount(5)` | ✅ | 触发 React 状态更新流程 |

#### 关键点总结

```
┌─────────────────────────────────────────────────────┐
│  useRef 返回的对象在整个生命周期内引用不变            │
│                                                     │
│  fiber.memoizedState ──────────────────────────┐   │
│      ↓                                         │   │
│  { current: initialValue }  ← 同一个对象        │   │
│      ↓                                         │   │
│  修改 .current 不触发重渲染                     │   │
│  因为 React 的渲染依赖 setState 触发             │   │
└─────────────────────────────────────────────────────┘
```

### Q2.2: React.memo 如何判断 Props 变化？

#### React.memo 的基本原理

```tsx
// React.memo 是一个高阶组件
const MemoizedComponent = memo(function MyComponent(props) {
  // ...
});

// 内部大概是：
function memo(WrappedComponent) {
  return function MemoizedComponent(props) {
    // 存储上一次的 props
    let prevProps = props;

    return (
      <WrappedComponent
        {...props}
        ref={ref}
      />
    );
  };
}
```

但实际上 React.memo 的比较发生在 **Fiber 协调阶段**，不是上面这种简单的闭包比较。

#### Fiber 在 React.memo 中的作用

```
更新触发 → Fiber 协调 → diff 新旧 props → 决定是否重渲染
```

#### Fiber 节点存储的信息

```tsx
// 每个组件对应的 Fiber 节点大概包含
{
  // ...其他字段
  memoizedProps: null,    // 上一次渲染的 props
  pendingProps: null,     // 新的即将应用的 props
  // ...
}
```

#### 比较过程

```tsx
// 在 Fiber 协调过程中（beginWork 或 updateMemoComponent）
function updateMemoComponent(fiber) {
  const resolvedProps = fiber.pendingProps;

  // 比较新旧 props
  if (compare(fiber.memoizedProps, resolvedProps)) {
    // props 没变，跳过渲染
    return skipUpdateAndReuseFiber(fiber);
  }

  // props 变了，执行渲染
  return renderWithNewProps(fiber);
}
```

#### 比较策略：浅比较

```tsx
// React 内部的比较函数大概是这样
function shallowEqual(objA, objB) {
  // 特殊处理
  if (objA === objB) return true;

  // 数组或对象
  if (objA && objB && typeof objA === 'object' && typeof objB === 'object') {
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    // 浅比较每个属性
    for (let key of keysA) {
      if (objA[key] !== objB[key]) return false;
    }

    return true;
  }

  return false;
}
```

#### 自定义比较函数

```tsx
// 第二个参数是自定义比较函数
const MemoizedButton = memo(Button, (prevProps, nextProps) => {
  // 返回 true 表示 props 相等，跳过渲染
  // 返回 false 表示 props 不等，执行渲染
  return prevProps.onClick === nextProps.onClick;
});
```

#### 图解整个流程

```
用户点击 → 触发状态更新
    ↓
React 创建新的 Fiber 树
    ↓
beginWork 遍历 Fiber
    ↓
遇到 memo 化组件：
┌─────────────────────────────────────┐
│ fiber.memoizedProps = {count: 1}   │  ← 上次 props
│ fiber.pendingProps = {count: 2}    │  ← 新的 props
│                                     │
│ shallowEqual(prev, next)           │
│   count: 1 !== 2 → return false    │
│                                     │
│ compare 返回 false                  │
│   → 需要重渲染                       │
└─────────────────────────────────────┘
```

#### 面试要点总结

| 问题 | 答案 |
|------|------|
| 比较时机 | Fiber 协调阶段（beginWork） |
| 比较什么 | `fiber.memoizedProps` vs `fiber.pendingProps` |
| 比较策略 | 默认浅比较，可以自定义比较函数 |
| 跳过后怎样 | 复用现有 Fiber，跳过 render 阶段 |

#### 为什么是浅比较？

```tsx
// 这就是为什么对象 props 需要小心
const Parent = () => {
  const [count, setCount] = useState(0);

  // ❌ 每次渲染都是新对象！
  return <Child style={{ color: 'red' }} />;
};

// ✅ 使用 useMemo 保持对象引用
const style = useMemo(() => ({ color: 'red' }), []);
return <Child style={style} />;
```

**核心点：React.memo 只做浅比较，所以对象/数组/函数类型的 props 如果引用变了，即使值一样也会触发重渲染！**

### Q2.3: 闭包陷阱（useEffect 中的问题）

#### 什么是闭包？

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  // 这个函数形成了闭包
  // 它"记住"了创建时的 count 值（0）
  const handleClick = () => {
    console.log(count); // 这里的 count 永远是创建时的值
  };

  return <button onClick={handleClick}>点击</button>;
}
```

#### 普通函数 vs useEffect

**普通函数：每次调用都创建新回调，读取最新值**

```tsx
function createCounter() {
  let count = 0;

  setInterval(() => {
    console.log(count); // ✅ 每次都读取最新的 count
    count++;
  }, 1000);
}

createCounter(); // 正常工作：0, 1, 2, 3...
```

**React useEffect：回调只创建一次，闭包捕获的值永远不变**

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 这个回调只创建一次！
    // 它捕获的 count 值永远是初始的 0
    const timer = setInterval(() => {
      console.log(count); // ❌ 永远打印 0
      setCount(count + 1); // ❌ 永远 setCount(1)
    }, 1000);

    return () => clearInterval(timer);
  }, []); // 只执行一次

  return <div>{count}</div>;
}
```

#### 对比图解

```
普通函数：
┌─────────────────────────────────────┐
│ 每次 setInterval 触发               │
│ → 执行回调函数                     │
│ → 读取外部变量 count（当前值）      │
│ → count++                          │
└─────────────────────────────────────┘

React useEffect：
┌─────────────────────────────────────┐
│ useEffect 执行（只执行一次）         │
│ → 创建 setInterval 回调              │
│ → 回调闭包捕获当时的 count=0         │
│ → 回调永远记住 count=0               │
│ （后续 count 变化，但回调不知道）     │
└─────────────────────────────────────┘
```

#### 解决方案

**方案1：函数式更新（推荐）**

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    // ✅ 不依赖外部 count 值
    setCount(prev => prev + 1);
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

**方案2：useRef 同步最新值**

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  // 同步 ref，保持最新值
  countRef.current = count;

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(countRef.current); // ✅ 永远是最新的值
      setCount(countRef.current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div>{count}</div>;
}
```

#### 面试要点

| 问题 | 答案 |
|------|------|
| 闭包陷阱是 React 特有的吗？ | ❌ 不是，是 JavaScript 闭包特性 |
| 为什么普通函数没问题？ | 因为每次调用创建新回调，读取最新值 |
| useEffect 为什么会卡住？ | useEffect 回调只创建一次，闭包捕获的值永远不变 |
| 如何解决？ | 函数式更新 / useRef 同步最新值 |

**核心点：闭包陷阱不是 React 的 bug，而是 useEffect 的设计特点。理解它才能避免在定时器、异步操作中捕获过时的状态值。**

### Q3: useReducer 何时比 useState 更合适？

```tsx
// 场景1：相关状态一起管理
// ❌ useState 方式 - 状态分散
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [address, setAddress] = useState('');

// ✅ useReducer 方式 - 相关状态统一管理
const [form, dispatch] = useReducer(formReducer, initialForm);

// 场景2：状态转换复杂
// ❌ useState 方式
const [step, setStep] = useState(1);
const next = () => {
  if (step === 1) setStep(2);
  else if (step === 2) setStep(3);
  else setStep(1);
};

// ✅ useReducer 方式
const [step, dispatch] = useReducer((s, a) => (s % 3) + 1, 1);
const next = () => dispatch('NEXT');
```

## 项目结构

```
src/
├── components/
│   ├── ProductList.tsx      # 商品列表（useCallback 演示）
│   ├── CartItem.tsx         # 购物车项（React.memo 演示）
│   ├── CartSummary.tsx      # 购物车摘要（useMemo 演示）
│   └── ProductSearch.tsx    # 商品搜索（useRef 演示）
├── hooks/
│   ├── useCartReducer.ts    # useReducer 购物车逻辑
│   └── useProducts.ts       # 商品数据 Hook
├── types/
│   └── index.ts             # 类型定义
├── App.tsx                  # 主应用
└── main.tsx                 # 入口文件
```

## 功能演示

1. **商品列表**：展示商品，点击添加到购物车
2. **购物车管理**：增减数量、删除商品
3. **总价计算**：使用 useMemo 缓存计算结果
4. **搜索功能**：使用 useRef 操作 DOM

## 运行项目

```bash
cd demo-03-cart
pnpm install
pnpm dev
```

## 扩展练习

1. 实现全选/取消全选功能
2. 实现优惠券折扣计算
3. 添加商品收藏功能
4. 实现历史记录（undo/redo）

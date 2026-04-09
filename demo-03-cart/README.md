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
- 避免闭包陷阱

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

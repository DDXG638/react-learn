# 第五章：自定义 Hooks + 状态管理

## 学习内容

### 1. 自定义 Hooks

自定义 Hook 是 React 中用于封装和复用有状态逻辑的函数，名称以 `use` 开头。

**封装逻辑的原则：**
- 每个 Hook 专注单一职责
- 通过参数接收配置，通过返回值返回数据和操作
- 内部使用 React 内置 Hooks

**常见自定义 Hook：**

```typescript
// useRequest - 数据请求封装
const { data, loading, error, execute } = useRequest(() => fetch('/api/user'));

// useLocalStorage - 持久化存储
const [value, setValue] = useLocalStorage('key', 'default');

// useDebounce - 防抖
const debouncedValue = useDebounce(inputValue, 300);

// useThrottle - 节流
const throttledValue = useThrottle(count, 1000);
```

### 2. 状态管理

#### Zustand（轻量）

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Store {
  count: number;
  inc: () => void;
}

const useStore = create<Store>()(
  persist(
    (set) => ({
      count: 0,
      inc: () => set((s) => ({ count: s.count + 1 })),
    }),
    { name: 'storage-key' }
  )
);

// 使用
function Counter() {
  const { count, inc } = useStore();
  return <button onClick={inc}>{count}</button>;
}
```

**特点：**
- 极简 API，学习成本低
- 无 Provider 嵌套，直接使用
- 内置 persist 中间件支持持久化
- 支持 TypeScript

#### Redux Toolkit（规范）

```typescript
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
  },
});

export const { increment } = counterSlice.actions;
export const store = configureStore({ reducer: { counter: counterSlice.reducer } });
```

**特点：**
- 标准化 actions 和 reducers
- 内置 Immer 支持不可变更新
- DevTools 调试友好
- 中间件生态丰富

#### Jotai/Recoil（原子化）

```typescript
// Jotai 示例
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**特点：**
- 原子化状态，细粒度更新
- 天然支持派生状态
- 适合复杂状态关系

### 3. useImperativeHandle + forwardRef

用于命令式暴露组件方法：

```typescript
import { forwardRef, useImperativeHandle, useRef } from 'react';

interface ModalRef {
  open: (title: string) => void;
  close: () => void;
}

const Modal = forwardRef<ModalRef>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open: (title) => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  return isOpen ? <div>Modal</div> : null;
});

// 使用
function App() {
  const modalRef = useRef<ModalRef>(null);
  return (
    <>
      <button onClick={() => modalRef.current?.open('Hello')}>Open</button>
      <Modal ref={modalRef} />
    </>
  );
}
```

**使用场景：**
- 模态框 / 弹窗控制
- 富文本编辑器命令
- 视频播放器控制
- 第三方组件封装

---

## Demo 工程：电商后台管理系统

### 功能

1. **用户管理**：列表展示、搜索、分页、删除
2. **购物车**：商品列表、购物车增删改、数量调整、总价计算
3. **主题切换**：浅色 / 深色 / 跟随系统，Zustand 持久化
4. **自定义 Hooks 演示**：useRequest、useLocalStorage、useDebounce、useThrottle
5. **useImperativeHandle**：模态框命令式控制

### 技术栈

- React 18 + TypeScript + Vite
- Zustand 状态管理（含 persist 持久化）
- Tailwind CSS 样式

### 项目结构

```
demo-05-admin/
├── src/
│   ├── stores/           # Zustand Store
│   │   ├── themeStore.ts  # 主题状态
│   │   ├── userStore.ts  # 用户状态
│   │   └── cartStore.ts  # 购物车状态
│   ├── hooks/            # 自定义 Hooks
│   │   ├── useRequest.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   ├── useThrottle.ts
│   │   └── useTheme.ts
│   ├── types/            # TypeScript 类型
│   │   └── index.ts
│   ├── App.tsx           # 主组件（5个 Tab）
│   └── main.tsx
└── package.json
```

---

## 面试题

### Q1: 自定义 Hook 的适用场景与封装原则？

**适用场景：**
- 多个组件需要复用相同的有状态逻辑
- 复杂组件中的逻辑需要分离
- 需要将业务逻辑与 UI 表现分离

**封装原则：**
1. **单一职责**：每个 Hook 只做一件事
2. **配置化**：通过参数接收配置，通过返回值返回数据和操作
3. **关注点分离**：内部使用多个更小的 Hook
4. **命名规范**：必须以 `use` 开头

**示例：**
```typescript
// 好：单一职责
function useUser(userId) { /* 获取用户数据 */ }
function useUserActions(userId) { /* 用户操作 */ }

// 不好：职责过多
function useUserDataAndActionsAndUI(userId) { /* ... */ }
```

### Q2: useImperativeHandle + forwardRef 的使用场景？

**使用场景：**
1. **父组件需要直接操作子组件**：如控制视频播放器的播放/暂停
2. **类组件兼容**：函数组件无法直接使用 ref，需要 forwardRef
3. **命令式 API**：组件需要提供命令式方法而非声明式 props

**注意：**
- 过度使用会破坏组件的声明式特性
- 优先考虑 props 传递回调函数的方式
- 仅在必要时使用（如弹窗控制、视频控制等）

**与 ref 的区别：**
- 普通 ref 直接访问 DOM 元素
- useImperativeHandle 自定义暴露的内容，隐藏内部实现

---

## 运行项目

```bash
cd demo-05-admin
pnpm install
pnpm dev
```
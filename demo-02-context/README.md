# Demo 02: 组件通信（Props + Context）

> React 18 + TypeScript 学习第二章：组件通信

## 学习目标

本 Demo 聚焦以下核心知识点：

### 1. Props 父子组件通信
- **父到子**：通过 Props 传递数据（数组、对象、函数）
- **子到父**：通过回调函数传递数据
- **Props drilling**：多层嵌套传递的问题

### 2. Context 跨级组件通信
- **createContext**：创建 Context 对象
- **useContext**：在组件中消费 Context
- **Provider**：提供数据给子组件
- **多层嵌套问题**：当组件层级很深时，Props 需要层层传递

### 3. Context 性能问题与优化
- **Context value 变化导致所有消费者重渲染**
- **拆分 Context**：按变更频率拆分
- **useMemo 缓存 value**：避免不必要的重渲染

## 面试题解析

### Q1: Context 性能问题及解决方案？

```tsx
// 问题：Context value 变化时，所有消费者组件都会重渲染
const ThemeContext = createContext({ theme: 'light', toggle: () => {} });

// 解决方案1：拆分 Context（按变更频率）
const ThemeContext = createContext({ theme: 'light' });
const ToggleContext = createContext({ toggle: () => {} });

// 解决方案2：使用 useMemo 缓存 value
const themeValue = useMemo(() => ({
  theme,
  toggle
}), [theme, toggle]);

// 解决方案3：拆分 Provider
<ThemeContext.Provider value={theme}>
  <ToggleContext.Provider value={toggle}>
    <App />
  </ToggleContext.Provider>
</ThemeContext.Provider>

// 解决方案4：使用选择器模式（zustand 的方式）
```

### Q2: Props drilling 是什么？如何解决？

Props drilling（属性穿透）是指数据从顶层组件传递到深层嵌套组件时，需要经过多个中间组件，但这些中间组件本身并不需要这些数据。

```tsx
// Props drilling 示例（问题）
<App>
  <Layout user={user}>           {/* user 只需要传下去 */}
    <Sidebar user={user}>        {/* user 只需要传下去 */}
      <Nav user={user}>          {/* user 只需要传下去 */}
        <UserAvatar user={user} /> {/* user 最终在这里使用 */}
      </Nav>
    </Sidebar>
  </Layout>
</App>

// 解决方案：使用 Context
const UserContext = createContext(user);
<App>
  <UserContext.Provider value={user}>
    <Layout />
  </UserContext.Provider>
</App>
```

## 项目结构

```
src/
├── contexts/
│   ├── ThemeContext.tsx     # 主题 Context（演示 Context 基本用法）
│   └── AuthContext.tsx      # 权限 Context（演示权限管理）
├── components/
│   ├── Menu/
│   │   ├── MenuItem.tsx     # 菜单项组件（Props 传递）
│   │   ├── SubMenu.tsx      # 子菜单组件（Props drilling）
│   │   └── Menu.tsx          # 菜单容器
│   ├── Layout/
│   │   └── Layout.tsx        # 布局组件
│   └── UserInfo.tsx         # 用户信息组件（Context 消费者）
├── App.tsx                   # 主应用
└── main.tsx                  # 入口文件
```

## 功能演示

### 场景1：Props drilling 问题
展示多级菜单组件如何通过 Props 层层传递数据，以及当层级变深时的繁琐。

### 场景2：Context 解决方案
使用 Context 重构，实现主题切换和用户权限管理。

### 场景3：Context 性能优化
展示当 Context value 变化时，如何避免不必要的重渲染。

## 运行项目

```bash
cd demo-02-context
pnpm install
pnpm dev
```

## 扩展练习

1. 实现一个 `useUser` Hook 来消费 AuthContext
2. 将 Menu 改造成使用 Context 避免 Props drilling
3. 实现一个 `useContextSelector` 实现选择器模式

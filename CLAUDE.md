# React 学习计划

> 作者：Dori
> 背景：Vue 开发者，目标是掌握 React 18 + Next.js，用于工作和面试准备
> 学习方式：理论 + 实践，每个章节配套完整 Demo 工程

---

## 学习路径总览

```
第1章: JSX 基础 + 函数组件 + Hooks 入门 (useState / useEffect)
第2章: 组件通信（Props + Context）
第3章: Hooks 进阶（useMemo / useCallback / useRef / useReducer）
第4章: React 核心原理（虚拟DOM / Diff / Fiber / 状态更新 / 合成事件）
第5章: 自定义 Hooks + 状态管理（Zustand / Redux Toolkit）
第6章: React 性能优化（memo 家族 / 长列表 / 懒加载 / 代码分割）
第7章: Next.js 核心（渲染模式 + App Router）
第8章: 综合实战 - 电商项目（融合所有知识点）
```

---

## 章节详情

---

### 第1章: JSX 基础 + 函数组件 + Hooks 入门

**学习内容**
- JSX 语法：条件渲染、列表渲染、事件处理、样式绑定
- 函数组件的定义与使用
- useState：状态声明、异步更新、函数式更新
- useEffect：依赖数组的三种模式（空数组/不传/传值）、清理函数执行时机

**Demo 工程：任务管理应用**
- 功能：任务列表的增删改、任务状态切换（待办/完成）
- 涉及知识点：JSX 列表渲染 + 条件渲染、useState 计数器、useEffect 模拟数据请求

**面试题覆盖**
- useEffect 依赖数组传空/不传/传值的区别？清理函数何时执行？
- useState 异步更新如何立即获取最新值？

---

### 第2章: 组件通信（Props + Context）

**学习内容**
- 父子组件通信：Props 传递、回调函数
- 跨级组件通信：Context API（createContext / useContext / Provider）
- Context 性能问题与优化思路

**Demo 工程：电商后台权限管理**
- 功能：多级菜单组件、用户权限状态透传
- 涉及知识点：Props drilling 场景、Context 实现主题切换/权限管理

**面试题覆盖**
- Context 性能问题及解决方案？

---

### 第3章: Hooks 进阶

**学习内容**
- useMemo：记忆化计算值，避免不必要的计算
- useCallback：记忆化回调函数，避免子组件不必要的渲染
- useRef：DOM 引用、持久化可变值（区别于 useState）
- useReducer：复杂状态逻辑，替代多个 useState

**Demo 工程：电商购物车**
- 功能：商品列表、购物车增删改、数量调整、总价计算
- 涉及知识点：useMemo 优化计算、useCallback 优化回调传递、useReducer 统一管理购物车状态

**面试题覆盖**
- useRef 与 useState 区别？
- React.memo、useMemo、useCallback 三者的对比？

---

### 第4章: React 核心原理

**学习内容**
- 虚拟 DOM：什么是虚拟 DOM、为什么需要虚拟 DOM
- Diff 算法：React 的 Diff 策略（tree diff / component diff / element diff）、与 Vue 的区别
- Fiber 架构：解决什么问题、Fiber 节点结构、中断与恢复机制
- 状态更新机制：setState 的异步/同步、批量更新（Auto Batchting）
- 合成事件：SyntheticEvent 的封装、事件池机制、与原生事件的区别、事件委托原理

**Demo 工程：虚拟 DOM 可视化 + Diff 对比工具**
- 功能：手写简化版虚拟 DOM、对比 React/Vue 更新策略差异
- 涉及知识点：Fiber 链表结构模拟、事件委托演示

**面试题覆盖**
- Fiber 节点包含哪些核心字段？如何实现中断与恢复？
- React 18 自动批处理原理？如何强制同步更新？
- key 为什么不能用索引？底层 Diff 如何工作？
- 合成事件与原生事件绑定顺序？为什么 React 事件委托到 document（17+ 改为 root）？

---

### 第5章: 自定义 Hooks + 状态管理

**学习内容**
- 自定义 Hooks：封装逻辑的原则、常见自定义 Hook（useRequest / useLocalStorage / useDebounce / useThrottle）
- 状态管理：Zustand（轻量、Redux Toolkit（规范）、Jotai/Recoil（原子化）
- useImperativeHandle + forwardRef：命令式暴露组件方法

**Demo 工程：电商后台管理系统**
- 功能：用户管理（列表/搜索/分页）、主题切换、购物车状态持久化
- 涉及知识点：useRequest 封装数据请求、Zustand 管理全局状态、useLocalStorage 持久化

**面试题覆盖**
- 自定义 Hook 的适用场景与封装原则？
- useImperativeHandle + forwardRef 的使用场景？

---

### 第6章: React 性能优化

**学习内容**
- 重复渲染优化：React.memo / useMemo / useCallback 的正确使用场景与区别
- 长列表优化：虚拟滚动原理、react-window / @tanstack/react-virtual 使用
- 组件懒加载：React.lazy + Suspense、路由懒加载
- 代码分割：动态 import、next/dynamic（Next.js 中替代 React.lazy）
- Context 优化：拆分 Context、按需订阅，避免 Context 包裹高频更新值

**Demo 工程：数据可视化大屏**
- 功能：10万+ 数据点渲染、实时数据更新、图表组件懒加载
- 涉及知识点：虚拟滚动长列表、useMemo 缓存大量计算、React.memo 优化图表组件、Suspense 懒加载

**面试题覆盖**
- 多表单联动状态如何设计？避免全量重渲染？
- 长列表 10 万条数据如何优化？虚拟滚动原理？
- 如何排查内存泄漏？常见场景（定时器/事件监听/闭包引用）？

---

### 第7章: Next.js 核心

**学习内容**
- 渲染模式原理与使用：CSR / SSR / SSG / ISR
- App Router：服务端组件 (RSC) vs 客户端组件 (RCC)
- 路由：目录结构、动态路由、路由组、拦截路由
- 数据获取：async/await 服务端组件、Server Actions
- 缓存策略：force-cache / no-store / revalidate、ISR 实现原理

**Demo 工程：电商前台（Next.js 版）**
- 功能：商品列表（SSG）、商品详情（SSR）、用户评论（CSR/RCC）
- 涉及知识点：服务端组件获取数据、客户端组件处理交互、路由懒加载、缓存策略

**面试题覆盖**
- RSC 与 CSR/SSR 的区别？什么场景必须用 Client Component？
- Next.js 数据缓存策略（force-cache/no-store/revalidate）与 ISR 实现？
- 服务端组件中如何传递用户状态（Session/Cookie）？

---

### 第8章：综合实战 - 电商全栈项目

**项目功能**
- 用户端：商品浏览、购物车、订单管理、个人中心
- 管理端：商品管理、订单管理、用户管理、数据统计

**技术栈**
- 前端：React 18 + TypeScript + Zustand + React Router v6 + React Query
- 后端：Next.js API Routes + Prisma + SQLite（简化）
- 样式：CSS Modules + Tailwind CSS

**Demo 结构**
```
demo-08-ecommerce/
├── apps/
│   ├── web/          # C端应用
│   └── admin/        # 管理后台
├── packages/
│   └── ui/           # 共享组件库
├── prisma/           # 数据模型
└── README.md
```

---

## Demo 工程列表

| 序号 | Demo 名称 | 核心知识点 | 复杂度 |
|------|-----------|-----------|--------|
| demo-01 | 任务管理应用 | JSX + useState + useEffect | ⭐ |
| demo-02 | 权限管理系统 | Props + Context | ⭐ |
| demo-03 | 电商购物车 | useMemo + useCallback + useReducer | ⭐⭐ |
| demo-04 | 虚拟DOM可视化 | 虚拟DOM + Diff + Fiber 原理 | ⭐⭐ |
| demo-05 | 后台管理模板 | 自定义Hooks + **Zustand** | ⭐⭐⭐ |
| demo-06 | 数据大屏 | 虚拟滚动 + 性能优化 | ⭐⭐⭐ |
| demo-07 | Next.js电商 | SSR/SSG/RSC + App Router | ⭐⭐⭐⭐ |
| demo-08 | 全栈电商 | Zustand + React Query | ⭐⭐⭐⭐⭐ |

---

## 学习顺序建议

```
Week 1: 第1章 → 第2章（基础打牢）
Week 2: 第3章 → 第4章（原理深入）
Week 3: 第5章 → 第6章（实践优化）
Week 4: 第7章 → 第8章（Next.js + 综合实战）
```

---

## 面试题速查索引

| 题号 | 面试题 | 所属章节 |
|------|--------|---------|
| 1 | useEffect 依赖数组三种模式 | 第1章 |
| 2 | useState 异步更新立即获取值 | 第1章 |
| 3 | 自定义 Hook 封装原则 | 第5章 |
| 4 | useImperativeHandle + forwardRef | 第5章 |
| 5 | Fiber 节点结构与中断恢复 | 第4章 |
| 6 | React 18 自动批处理原理 | 第4章 |
| 7 | key 与 Diff 算法 | 第4章 |
| 8 | 合成事件与事件委托 | 第4章 |
| 9 | Context 性能问题 | 第2章/第6章 |
| 10 | RSC vs CSR/SSR | 第7章 |
| 11 | Next.js 缓存策略 | 第7章 |
| 12 | 内存泄漏排查 | 第6章 |
| 13 | 防抖 Hook 实现 | 第5章 |
| 14 | 长列表虚拟滚动原理 | 第6章 |
| 15 | 多表单联动状态设计 | 第6章 |
| 16 | 服务端组件用户状态传递 | 第7章 |

---

## 项目初始化命令

每个 Demo 统一使用以下命令初始化：

```bash
# 初始化 React + TypeScript 项目
pnpm create vite demo-01-todo --template react-ts

# 安装通用依赖
pnpm add react react-dom react-router-dom zustand @tanstack/react-query

# 安装类型
pnpm add -D typescript @types/react @types/react-dom
```

---

## Demo 工程说明

- **复杂度设计**：从简单场景（计数器、待办）到电商级别渐进
- **样式方案**：Tailwind CSS（快速布局）+ CSS Modules（组件样式隔离）
- **后端 Mock**：json-server 模拟 REST API
- **状态管理**：Zustand 深入，Redux Toolkit 简单讲解

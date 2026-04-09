# Demo 01: 任务管理应用

> React 18 + TypeScript 学习第一章：JSX 基础 + useState + useEffect

## 学习目标

本 Demo 聚焦以下核心知识点：

### 1. JSX 语法
- **条件渲染**：使用三元运算符、`&&` 运算符
- **列表渲染**：使用 `map` 遍历数组渲染组件
- **事件处理**：onClick、onChange 等事件绑定
- **样式绑定**：className、style 对象

### 2. useState 状态管理
- 基础状态声明：`const [state, setState] = useState<T>(initialValue)`
- 异步更新：React 状态更新是异步的
- 函数式更新：当新状态依赖旧状态时使用 `setState(prev => newState)`
- 立即获取最新值：ref 或 setState 回调

### 3. useEffect 副作用
- **依赖数组不传**：每次渲染都执行
- **依赖数组传空数组 `[]`**：只在挂载时执行一次（类似 mounted）
- **依赖数组传值 `[dep]`**：当 dep 变化时执行
- **清理函数**：return () => {} 用于清理副作用

## 面试题解析

### Q1: useEffect 依赖数组传空/不传/传值的区别？清理函数何时执行？

```tsx
// 1. 不传依赖数组：每次渲染都执行
useEffect(() => {
  console.log('每次渲染都执行');
});

// 2. 传空数组：只在挂载时执行一次（类似 Vue mounted）
useEffect(() => {
  console.log('只执行一次');
  return () => {
    console.log('组件卸载时执行清理');
  };
}, []);

// 3. 传依赖数组：依赖变化时执行
useEffect(() => {
  console.log('count 变化时执行');
  return () => {
    console.log('下一次 effect 执行前清理');
  };
}, [count]);
```

### Q2: useState 异步更新如何立即获取最新值？

React 的 setState 是异步的，以下方式可以获取最新值：

```tsx
// 方式1: setState 回调函数
const [count, setCount] = useState(0);
setCount(prev => {
  // prev 是最新的值，可以在这里使用
  console.log(prev); // 最新值
  return prev + 1;
});

// 方式2: 使用 useRef
const [count, setCount] = useState(0);
const countRef = useRef(count);
countRef.current = count; // 在 render 后同步

// 方式3: 批量更新后读取（不推荐）
setCount(c => c + 1);
console.log(count); // 仍然是旧值！
```

## 项目结构

```
src/
├── components/
│   ├── TodoItem.tsx       # 单个任务组件
│   ├── TodoList.tsx       # 任务列表组件
│   ├── TodoForm.tsx       # 新增任务表单
│   └── Stats.tsx          # 统计信息组件
├── hooks/
│   └── useTodos.ts        # 任务状态管理 Hook
├── types/
│   └── todo.ts            # 类型定义
├── App.tsx                # 主应用组件
└── main.tsx               # 入口文件
```

## 功能演示

1. **添加任务**：输入任务标题，创建新待办事项
2. **切换状态**：点击复选框切换完成/未完成
3. **删除任务**：点击删除按钮移除任务
4. **筛选查看**：查看全部/待完成/已完成
5. **统计信息**：显示总数和已完成数量

## 运行项目

```bash
cd demo-01-todo
pnpm install
pnpm dev
```

## 扩展练习

1. 添加任务编辑功能
2. 添加任务分类/标签
3. 添加本地存储持久化
4. 实现任务拖拽排序

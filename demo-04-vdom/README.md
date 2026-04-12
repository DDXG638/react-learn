# Demo 04 - Virtual DOM & React 核心原理

> 第四章学习 Demo | 虚拟 DOM 可视化 | Diff 算法对比 | Fiber 架构 | 合成事件

---

## 学习内容索引

| 模块 | 内容 | 面试题 |
| --- | --- | --- |
| [Virtual DOM](#virtual-dom) | h() 函数、VNode 结构 | 虚拟 DOM 优缺点？ |
| [Diff 算法](#diff-算法) | Tree/Component/Element Diff | key 为什么不用索引？ |
| [Fiber 架构](#fiber-架构) | 链表结构、中断恢复 | Fiber 核心字段？ |
| [状态更新机制](#状态更新机制) | 异步、批量更新 | 如何强制同步？ |
| [合成事件](#合成事件) | 事件池、委托机制 | 17+ 为什么改到 root？ |

---

## Virtual DOM

### 什么是 Virtual DOM？

Virtual DOM（虚拟 DOM）是一个 JavaScript 对象，用于描述真实 DOM 的结构。

```jsx
// JSX 编译后实际调用的是 h() 函数
<h1 className="title">Hello</h1>

// 编译结果（简化版）
h('h1', { className: 'title' }, 'Hello')
```

### Virtual DOM 结构

```typescript
interface VNode {
  type: string | Function;  // 标签名或组件
  props: Props;             // 属性 + children
  key?: string | number;    // 列表项唯一标识
  ref?: unknown;            // DOM 引用
}
```

### 为什么需要 Virtual DOM？

| 操作 | 真实 DOM | Virtual DOM |
| --- | --- | --- |
| 更新方式 | 直接操作，昂贵 | Diff 后最小更新 |
| 跨平台 | 无法实现 | React Native、SSR |
| 开发体验 | 难调试 | 可预测的状态变化 |

### 核心原理

1. **状态变化** → 创建新的 VNode 树
2. **Diff 对比** → 对比新旧 VNode，找出最小变更
3. **批量更新** → 将多次 state 变化合并为一次 DOM 更新

---

## Diff 算法

### React 的三大 Diff 策略

#### 1. Tree Diff（逐层对比）

```
React 只会对比同层节点，不会跨层比较

层级 1:  div → div    ✓ 同层对比
层级 2:  ul → ul      ✓ 同层对比
层级 3:  li → li      ✓ 同层对比
```

**优化**：同层节点先比较，匹配则继续深度比较，不匹配则直接替换该子树。

#### 2. Component Diff（组件对比）

```
不同类型组件 → 卸载旧组件 + 挂载新组件
相同类型组件 → 继续对比 Virtual DOM

<Panel> → <Card>    ❌ 完全替换
<UserList> → <UserList>  ✓ 继续对比
```

#### 3. Element Diff（元素对比）

对于同层级节点，通过 `key` 识别：

```jsx
// 有 key：可以精确匹配，复用节点
<ul>
  <li key="a">A</li>  →  <li key="a">A</li>    ✓ 复用
  <li key="b">B</li>  →  <li key="d">D</li>    ❌ 替换
  <li key="c">C</li>  →  <li key="b">B</li>    ❌ 移动
</ul>

// 无 key/用 index：可能产生错误的复用
<ul>
  <li>A</li>  →  <li>A</li>    ✓ 但实际可能被错误复用
  <li>B</li>  →  <li>D</li>    ❌ 无法识别
  <li>C</li>  →  <li>B</li>    ❌ 无法识别
</ul>
```

### React vs Vue Diff 策略对比

| 特性 | React | Vue |
| --- | --- | --- |
| 核心算法 | 双端队列 + 移动/创建 | 双端队列 + key 映射 |
| 移动策略 | 头头/头尾/尾头 尝试匹配 | key 快速查找 |
| 复杂度 | O(n) | O(n) |

### 面试题：key 为什么不能用索引？

```jsx
// ❌ 错误示例：用索引做 key
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}

// ✓ 正确示例：用唯一 ID 做 key
{items.map((item) => (
  <li key={item.id}>{item.name}</li>
))}
```

**问题场景**：

```
原始列表: [A, B, C]  index: [0, 1, 2]
删除 B 后: [A, C]    index: [0, 1]

用索引 diff 时:
- A 位置相同 → 复用 ✓
- C 原来 index=2 现在 index=1 → 误判为移动

用 ID diff 时:
- A id=1 → 复用 ✓
- C id=3 → 创建新的 ✓
```

---

## Fiber 架构

### 解决什么问题？

**同步渲染的问题**：React 15 及之前，渲染是同步的，一旦开始不能中断。大组件树可能导致卡顿（超过 16ms）。

**Fiber 的解决方案**：

1. 将渲染工作拆分成小单元
2. 每个单元可中断、恢复
3. 优先级调度（用户交互 > 动画 > 后台）

### Fiber 节点结构

```typescript
interface Fiber {
  // 节点信息
  type: string | Function | null;
  key: string | number | null;

  // DOM 引用
  stateNode: unknown;  // 真实 DOM 节点或组件实例

  // 链表结构（核心！）
  child: Fiber | null;      // 第一个子节点
  sibling: Fiber | null;     // 下一个兄弟节点
  return: Fiber | null;     // 父节点

  // 双缓冲
  alternate: Fiber | null;   // workInProgress ↔ current

  // 副作用标记
  effectTag: 'UPDATE' | 'PLACEMENT' | 'DELETION' | null;

  // 状态
  pendingProps: Record<string, unknown>;
  memoizedProps: Record<string, unknown>;
  memoizedState: unknown;   // Hooks 状态
}
```

### 链表遍历顺序

```
        root (return: null)
           │
       ┌───┴───┐
      child   sibling
       │        │
    ┌──┴──┐   sibling
   child sibling
    │      │
   ...    ...

遍历顺序: root → child → grandchild → sibling → ...
```

### workInProgress 与双缓冲机制

**workInProgress** 是指针，指向当前正在处理的 Fiber 节点（即当前"工作"在哪）。

**alternate** 是连接新旧两个 Fiber 节点的"桥梁"，用于 Diff 对比。

```
时间线：

T1: 初次渲染
    current (旧树/空)          workInProgress (新树)
         │                           │
         │                    div (正在处理)
         │                      │
         │                      ├─ ul
         │                      └─ li
         │
         │     ┌─────────────────┘
         │     │ alternate
         ▼     ▼
    null    div

T2: 渲染中断 (只处理了 div 和 ul)
    current                      workInProgress
         │                           │
         │                    ul (正在处理)
         │                      │
         │                      └─ li
         │
         │     ┌─────────────────┘
         │     │ alternate 指向对方的 Fiber
         ▼     ▼
    div ◄────► div
    ul        ul

T3: 渲染完成，交换指针
    current                      workInProgress
         │                           │
    div  │                      div
    ul   │                      ul
    li   │                      li

    交换：current = workInProgress
```

**alternate 的具体作用**：

```typescript
// alternate 就像"平行世界的自己"
// 用于对比当前状态和历史状态

const fiber = workInProgress;

// 通过 alternate 可以快速找到"上一次"的自己
const previousVersion = fiber.alternate;

// 对比新旧差异
if (previousVersion) {
  const oldProps = previousVersion.memoizedProps;
  const newProps = fiber.memoizedProps;
  // 计算变更...
}
```

### 中断与恢复

```
渲染过程:
┌─────────────────────────────────────────────────────────┐
│                        React 渲染流程                      │
└─────────────────────────────────────────────────────────┘

  组件代码                      Fiber 架构                    DOM
     │                            │                          │
     ▼                            │                          │
┌─────────────┐                   │                          │
│ 执行 render │   JSX/h()         │                          │
│   函数      │ ─────────────────►│                          │
└─────────────┘                   ▼                          │
                         ┌─────────────────┐                  │
                         │  render 阶段    │                  │
                         │                 │                  │
                         │  1. beginWork  │  ← 创建/复用 Fiber │
                         │  2. completeWork│  ← 收集 DOM 变更  │
                         │                 │                  │
                         │  (可中断/恢复)   │                  │
                         └────────┬────────┘                  │
                                  │ Diff 在这里发生            │
                                  │ (新旧 Fiber 对比)          │
                                  ▼                          │
                         ┌─────────────────┐                  │
                         │  commit 阶段    │                  │
                         │                 │                  │
                         │  将变更同步     │ ───────────────►│
                         │  应用到真实 DOM │                  │
                         └─────────────────┘                  │
```

### render 阶段 vs commit 阶段

| 术语 | 含义 |
|------|------|
| 组件的 render 函数 | 执行 `function App() { return <div>...</div> }`，得到 JSX/VNode |
| render 阶段 (Fiber) | 遍历 Fiber 树，执行 beginWork/completeWork，**Diff 在这里发生** |
| commit 阶段 | **不是 Diff 之后**，Diff 已经在 render 阶段完成；将变更同步应用到真实 DOM |

### Fiber 的核心优化点

**React 15 的问题**：

```jsx
// React 15: 同步递归渲染，无法中断
render() {
  return (
    <ul>
      {items.map(item => <li>{item.name}</li>)}  {/* 10000个 */}
    </ul>
  );
}
```

- 渲染是**同步递归**的，必须等所有节点渲染完
- 10000 个节点可能需要 100ms+，超过浏览器帧预算（16ms）
- 用户点击按钮只能等到渲染结束才能响应 → **卡顿**

**Fiber 的解决方案**：不是让 Diff 变快，而是让渲染**可中断**

```
React 15 (同步):
┌──────────────────────────────┐
│ 渲染 10000 个节点 (阻塞 100ms) │
│ ❌ 中间无法响应用户操作         │
└──────────────────────────────┘

Fiber (可中断):
┌─────────────────┐ ┌──────────┐ ┌─────────────────┐
│ 渲染 50 个节点  │ │ 让浏览器 │ │ 继续渲染 50 个  │
│ (5ms)          │→│ 处理输入 │→│ (5ms)          │
│ 可中断点        │ │ (高优先级)│ │ 可中断点        │
└─────────────────┘ └──────────┘ └─────────────────┘
```

| | React 15 | Fiber |
|--|---------|-------|
| 渲染方式 | 同步递归，不能中断 | 可中断、可恢复 |
| 用户响应 | 必须等渲染完 | 高优先级任务可插队 |
| 优化目标 | 无 | 避免长时间阻塞主线程 |

**总结**：Fiber 的主要优化点是**避免 Diff/渲染 耗时过长导致卡顿**，本质上是让浏览器有机会在渲染过程中处理其他任务。

### 中断判断机制

React 的中断核心是**时间片轮询**：每处理完一个 Fiber 就检查是否超时。

**中断判断原理**：

```javascript
// 简化版伪代码
function workLoop() {
  while (nextUnitOfWork !== null) {
    // 执行一个 Fiber 的工作
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // 每处理完一个 Fiber 后，检查是否超时
    if (shouldYield()) {
      // 时间不够了，让出主线程
      requestIdleCallback(workLoop);
      return;
    }
  }
}

function shouldYield() {
  // 比较当前时间是否超过了截止时间
  return getCurrentTime() >= deadline;
}
```

**deadline 是如何计算的**：

```
浏览器每帧有 16.67ms (60fps)
- 假设浏览器需要 6ms 处理浏览器任务
- 剩下 10ms 给 JS 执行
- React 实际只抢 5ms，留 5ms 缓冲给浏览器

deadline = currentTime + 5ms
```

**时间片轮询示意**：

```
帧 1 (16.67ms):
┌────────────────────────────────────┐
│ 浏览器任务 (6ms)                    │
├────────────┬───────────────────────┤
│ React 5ms  │ 缓冲 5ms  │ 浏览器  │
│ (处理节点)  │ (可能被中断) │         │
└────────────┴───────────────────────┴

如果 React 处理完一个 Fiber 后，发现时间超过 5ms 截止线
就立即中断，调用 requestIdleCallback 等下一帧继续
```

**React 17+ 的实现**：

```javascript
// React 不再依赖 requestIdleCallback（兼容性差）
// 自己实现了 MessageChannel + setTimeout 轮询

const channel = new MessageChannel();

function scheduleCallback() {
  port2.onmessage = () => {
    const callback = getNextTask();
    if (callback) {
      const deadline = getCurrentTime() + 5;
      const result = callback(deadline);
      if (!result.done) {
        scheduleCallback(); // 继续调度
      }
    }
  };
  port1.postMessage(null);
}
```

### 面试题：Fiber 如何实现中断恢复？

1. **链表结构**：通过 `child`/`sibling`/`return` 指针保存遍历状态
2. **workInProgress**：双缓冲树，当前工作版本
3. **alternate**：新旧版本的连接桥梁，恢复时能找到断点
4. **优先级**：每个 Fiber 携带优先级，高优先级可打断低优先级
5. **时间片轮询**：每处理完一个 Fiber 检查 `currentTime >= deadline`，超时则中断

### Lanes 优先级模型

React 17+ 使用 **lanes**（位掩码）来表示优先级。

**优先级从高到低**：

| 优先级 | 值 | 触发场景 |
|--------|-----|---------|
| 同步 (Sync) | 最高 | 用户点击、输入、flushSync |
| 持续 (Continuous) | 高 | 鼠标 hover、drag |
| 离散 (Discrete) | 中 | click、keydown、focus |
| 默认 (Default) | 低 | setTimeout、fetch |
| 过渡 (Transition) | 很低 | useTransition |
| 空闲 (Idle) | 最低 | 过期缓存清理 |

**lanes 工作流程**：

```
状态更新触发
     │
     ▼
┌────────────────────────────────┐
│ 创建 Update 对象                │
│                                │
│ Update.lane = 触发方式决定      │
│   - 点击/输入 → SyncLane       │
│   - setTimeout → DefaultLane   │
│   - useTransition → TransitionLane│
└────────────────────────────────┘
     │
     ▼
Update 加入 Fiber.updateQueue
     │
     ▼
Fiber.lanes = 合并所有 Update.lane（位掩码合并）
     │
     ▼
Scheduler 按 lanes 排序，高优先级先执行
```

**Fiber 节点中的 lanes 字段**：

```typescript
interface Fiber {
  // ...其他字段

  // 优先级相关
  lanes: Lanes;              // 该 Fiber 上的更新优先级
  childLanes: Lanes;         // 子树的优先级
  updateQueue: {
    firstUpdate: Update;
    lastUpdate: Update;
  };
}
```

**Update 对象结构**：

```typescript
struct Update {
  lane: Lanes;           // 这个更新的优先级
  payload: any;         // setState 的参数
  callback: Function;    // setState 第二个参数（回调）
  next: Update;         // 链表指针
}
```

**同一 Fiber 可能包含多个 lane**：

```jsx
function App() {
  const [count, setCount] = useState(0);

  // 点击 1 → SyncLane
  const handleClick = () => {
    setCount(1);  // Update1.lane = SyncLane
  };

  // 300ms 后 → DefaultLane
  useEffect(() => {
    const t = setTimeout(() => {
      setCount(2);  // Update2.lane = DefaultLane
    }, 300);
    return () => clearTimeout(t);
  }, []);
}

// Fiber.lanes 最后是: SyncLane | DefaultLane
// 执行顺序：SyncLane 先执行，DefaultLane 后执行
```

**为什么用位掩码？**

- 高效表示多优先级
- 能快速合并（`|`）和比较（`&`）
- `Fiber.lanes = 所有 Update.lane 的合并`

---

## Hooks 与 Fiber 的关系

### React.memo 的 props 存储

```
<App>
  <Child data={obj} />   ← 被 React.memo 包装的组件
</App>
```

对应的 Fiber 结构：

```
Fiber 树：
┌─────────────────────────────────────────────────┐
│ App (函数组件)                                   │
│   child: Child (memoized)                       │
│                                                  │
│   ┌─ Child (React.memo 包装的组件)               │
│   │   memoizedProps: { data: {id:1, name:'a'} } ← 上次渲染的props
│   │   pendingProps:   { data: {id:1, name:'a'} } ← 新props（如果变了）
│   │                                                  │
│   │   // Diff: shallowEqual(memoizedProps, pendingProps)
│   │   // 如果相等，跳过渲染                           │
└─────────────────────────────────────────────────┘
```

- 新 props 存储在 `pendingProps`
- 上次渲染的 props 存储在 `memoizedProps`
- Diff 时对比两者，决定是否跳过渲染

### useRef / useMemo 的存储

```jsx
function Counter() {
  const countRef = useRef(0);    // → 存在 Counter Fiber 的 memoizedState
  const doubled = useMemo(() =>   // → 存在 Counter Fiber 的 memoizedState
    countRef.current * 2,
    [countRef.current]
  );
  return <div>{doubled}</div>;
}
```

对应的 Fiber 结构：

```
┌─────────────────────────────────────────────────┐
│ Counter (函数组件)                               │
│   memoizedState: [                              │
│     {                                      ← 第1个 Hook: useRef
│       baseState: null,                          │
│       memoized: { current: 0 }  ← ref 对象     │
│     },                                          │
│     {                                      ← 第2个 Hook: useMemo
│       baseState: null,                          │
│       memoized: 0  ← 计算结果                   │
│     }                                           │
│   ]                                             │
└─────────────────────────────────────────────────┘
```

### Hooks 为什么按调用顺序存储？

```jsx
function Counter() {
  const ref1 = useRef(0);      // 第1个 Hook → memoizedState[0]
  const ref2 = useRef(null);   // 第2个 Hook → memoizedState[1]
  const memo1 = useMemo(() => ref1.current * 2, [ref1.current]); // 第3个 → memoizedState[2]
  const memo2 = useMemo(() => ref2.current * 3, [ref2.current]); // 第4个 → memoizedState[3]
  // ...
}
```

**按顺序存储的原因**：

```typescript
// React 内部简化逻辑
let hookIndex = 0;

function useRef(initialValue) {
  const fiber = currentlyRenderingFiber;
  const hooks = fiber.memoizedState;

  // 按顺序找到对应位置的 hook
  const hook = hooks[hookIndex];

  // 如果是首次渲染，创建 hook
  if (!hook) {
    const newHook = {
      baseState: null,
      memoized: { current: initialValue },
      next: null
    };
    hooks[hookIndex] = newHook;
  }

  hookIndex++;  // 下一个 hook 的位置
  return hook.memoized;
}
```

### 为什么 Hooks 不能放在条件语句里？

```jsx
function Counter({ showExtra }) {
  const countRef = useRef(0);    // 始终执行 → 第1个

  if (showExtra) {
    const extraRef = useRef(100); // 可能不执行！
    // 如果 showExtra=false，这个 hook 不执行
  }

  const doubled = useMemo(() => { // 始终执行 → 第2个
    // 但如果上面那个 hook 没执行，这里会变成第2个而不是第3个！
    // 导致数据错乱
  }, [countRef.current]);

  return <div>{countRef.current}</div>;
}
```

**条件语句会导致 Hooks 顺序错乱 → 数据错乱**

| 问题 | 答案 |
| --- | --- |
| React.memo 的 props 存哪？ | `pendingProps`（新）/ `memoizedProps`（旧） |
| useRef/useMemo 存哪？ | 函数组件 Fiber 的 `memoizedState` |
| 多个 Hooks 怎么区分？ | 按**调用顺序**，第1次调用存在 `[0]`，第2次存在 `[1]` |
| 为什么不能放条件语句？ | 条件为 false 时跳过执行，会导致后续 Hooks 索引错乱 |

---

## 状态更新机制

### setState 的异步特性

```jsx
const [count, setCount] = useState(0);

function handleClick() {
  setCount(count + 1);  // 不会立即更新
  setCount(count + 1);  // count 仍是旧值
  console.log(count);    // 输出 0
}
// 最终 count = 1，而非 2
```

### 函数式更新（解决异步问题）

```jsx
function handleClick() {
  setCount(prev => prev + 1);  // 使用上一状态的函数
  setCount(prev => prev + 1);  // 正确累加
}
// 最终 count = 2
```

### 批量更新 (Auto Batching)

**React 17 及之前**：

```jsx
// 不会自动批量更新
fetch('/api').then(() => {
  setCount(1);  // 触发一次更新
  setFlag(true); // 再触发一次
});
```

**React 18+ 自动批处理**：

```jsx
// 所有状态更新自动合并为一次渲染
fetch('/api').then(() => {
  setCount(1);  // 合并
  setFlag(true); // 合并
  setLoading(false); // 合并
  // 只触发一次重新渲染
});
```

### 强制同步更新

```jsx
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1);  // 立即同步更新
  });
  flushSync(() => {
    setFlag(f => !f);  // 再立即同步更新
  });
  // 触发两次重新渲染
}
```

### 面试题：React 18 自动批处理原理？

1. **事件循环集成**：React 18 在 `unstable_runWithPriority` 中跟踪执行上下文
2. **批量更新标志**：`isBatching` 标志，在事件处理器中自动开启
3. **微任务合并**：使用 `unstable_ImmediatePriority` 调度，确保在当前事件循环结束前合并

---

## 合成事件

### 什么是 SyntheticEvent？

React 封装的事件系统，兼容所有浏览器：

```jsx
function Button({ onClick }) {
  return (
    <button
      onClick={(e) => {
        // e 是 SyntheticEvent，不是原生 Event
        console.log(e.nativeEvent);  // 原生事件
        console.log(e.target);       // 触发元素
        console.log(e.currentTarget); // 绑定元素
      }}
    >
      Click
    </button>
  );
}
```

### 事件池机制

React 17 之前，事件对象被复用（对象池）：

```jsx
function handleClick(e) {
  console.log(e.type);  // 'click'
  // 事件处理完后，对象被回收
  setTimeout(() => {
    console.log(e.type); // null！e 被重置
  }, 0);
}
```

**React 17+**：不再使用事件池，`e` 可异步访问。

### 事件委托

**React 16**：

```
事件 → document → React 事件代理 → 分发
```

**React 17+**：

```
事件 → root → React 事件代理 → 分发
```

### 为什么改到 root？

1. **微前端隔离**：多个 React 版本可共存
2. **减少冲突**：不覆盖 document 上的其他事件
3. **更安全**：避免被第三方代码干扰

### 事件执行顺序

```
捕获阶段: window → document → root → ... → target
         ↑
         onClickCapture

目标阶段: target (onClick)
         ↓
         onClickCapture

冒泡阶段: ... → root → document → window
         ↑
         onClick (onClickBubble)
```

### 面试题：合成事件与原生事件绑定顺序？

1. **React 的 onClick 在冒泡阶段执行**（除非用 onClickCapture）
2. **原生 addEventListener 默认在冒泡阶段**
3. **执行顺序**：捕获 → 目标（按绑定顺序）→ 冒泡

```jsx
<div onClick={() => console.log('div bubble')}>
  <button
    onClick={() => console.log('button bubble')}
    onClickCapture={() => console.log('button capture')}
    ref={el => el?.addEventListener('click', () => console.log('native bubble'), false)}
    ref={el => el?.addEventListener('click', () => console.log('native capture'), true)}
  >
    Click
  </button>
</div>

// 输出顺序:
// native capture
// button capture
// button bubble
// native bubble
// div bubble
```

---

## 核心实现 (core/)

```
src/core/
├── h.ts           # h() 函数，h('div', props, children)
├── diff.ts        # reactDiff / vueDiff 双端对比算法
├── Fiber.ts       # Fiber 链表结构、遍历、调度模拟
└── EventSystem.ts  # 合成事件封装、事件池、委托演示
```

### h.ts - 简化版 createElement

```typescript
h('div', { className: 'container', key: '1' },
  h('h1', {}, '标题'),
  h('ul', {},
    h('li', { key: 'a' }, 'A'),
    h('li', { key: 'b' }, 'B')
  )
)
```

### diff.ts - Diff 算法实现

- `reactDiff()`: 模拟 React 的双端对比
- `vueDiff()`: 模拟 Vue 的 key 映射 + 双端对比
- 操作类型: CREATE / DELETE / UPDATE / MOVE

### Fiber.ts - Fiber 架构模拟

- `createFiber()`: 创建 Fiber 节点
- `vnodeListToFiberTree()`: VNode 数组 → Fiber 链表
- `fiberTreeTraversal()`: 深度优先遍历生成器
- `simulateFiberSchedule()`: 调度过程模拟

### EventSystem.ts - 事件系统演示

- `SyntheticEventSystem`: 合成事件封装类
- `getFromPool()` / `releaseToPool()`: 对象池
- `demonstrateEventBindingOrder()`: 事件执行顺序演示

---

## 面试题速查

| 题号 | 问题 | 答案要点 |
| --- | --- | --- |
| 1 | Fiber 节点核心字段？ | child/sibling/return 链表、alternate 双缓冲、effectTag 副作用 |
| 2 | Fiber 如何中断恢复？ | 链表保存状态、alternate 桥梁、优先级调度 |
| 3 | React 18 自动批处理原理？ | isBatching 标志、微任务合并、unstable_runWithPriority |
| 4 | 如何强制同步更新？ | flushSync(() => setState()) |
| 5 | key 为什么不用索引？ | 删除/插入时索引变化，导致错误复用和状态错乱 |
| 6 | 合成事件与原生事件顺序？ | 捕获 → 原生目标 → React 目标 → 原生冒泡 → React 冒泡 |
| 7 | React 17+ 为什么改到 root 委托？ | 微前端隔离、减少冲突、更安全 |

---

## 启动方式

```bash
cd demo-04-vdom
pnpm install
pnpm dev
```

---

## 相关资源

- [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- [Inside Fiber](https://blog.ag-grid.com/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react/)
- [React 事件系统](https://react.dev/reference/react-dom/components#form-events)

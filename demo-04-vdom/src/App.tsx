import { useState, useCallback, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import './App.css';
import { h, type VNode, reactDiff, vueDiff, type DiffResult, type DiffOperation } from './core';
import {
  createFiber,
  vnodeListToFiberTree,
  fiberTreeTraversal,
  simulateFiberSchedule,
  type Fiber,
  type ScheduleStep,
} from './core/Fiber';

type TabType = 'vdom' | 'diff' | 'fiber' | 'state' | 'event';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('vdom');

  return (
    <div className="app blueprint-bg">
      <header className="header">
        <div className="header-content">
          <div className="chapter-badge">第四章 · React 核心原理</div>
          <h1>Virtual DOM & 核心原理可视化</h1>
          <p className="header-subtitle">
            虚拟 DOM 结构 · Diff 算法对比 · Fiber 链表 · 状态更新机制 · 合成事件
          </p>
        </div>
      </header>

      <nav className="tab-nav">
        <button className={`tab-btn ${activeTab === 'vdom' ? 'active' : ''}`} onClick={() => setActiveTab('vdom')}>
          <span className="icon">◈</span> Virtual DOM
        </button>
        <button className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`} onClick={() => setActiveTab('diff')}>
          <span className="icon">◐</span> Diff 对比
        </button>
        <button className={`tab-btn ${activeTab === 'fiber' ? 'active' : ''}`} onClick={() => setActiveTab('fiber')}>
          <span className="icon">◎</span> Fiber 架构
        </button>
        <button className={`tab-btn ${activeTab === 'state' ? 'active' : ''}`} onClick={() => setActiveTab('state')}>
          <span className="icon">⚡</span> 状态更新
        </button>
        <button className={`tab-btn ${activeTab === 'event' ? 'active' : ''}`} onClick={() => setActiveTab('event')}>
          <span className="icon">◉</span> 合成事件
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'vdom' && <VirtualDOMPanel />}
        {activeTab === 'diff' && <DiffPanel />}
        {activeTab === 'fiber' && <FiberPanel />}
        {activeTab === 'state' && <StateUpdatePanel />}
        {activeTab === 'event' && <EventPanel />}
      </main>
    </div>
  );
}

/* ============================================
   Virtual DOM Panel
   ============================================ */
function VirtualDOMPanel() {
  const [items, setItems] = useState([
    { id: 1, text: 'Item 1', key: 'a' },
    { id: 2, text: 'Item 2', key: 'b' },
    { id: 3, text: 'Item 3', key: 'c' },
  ]);

  const addItem = () => {
    const newId = items.length + 1;
    const letters = ['d', 'e', 'f', 'g'];
    setItems([
      ...items,
      { id: newId, text: `Item ${newId}`, key: letters[(newId - 4) % 4] || `item${newId}` },
    ]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const vnodeTree: VNode = h('div', { className: 'vtree' },
    h('ul', { className: 'item-list' },
      ...items.map((item) =>
        h('li', { key: item.key, className: 'vnode-item' },
          h('span', { className: 'item-text', onClick: () => removeItem(item.id) }, item.text),
          h('button', { className: 'delete-btn', onClick: () => removeItem(item.id) }, '×')
        )
      )
    )
  );

  return (
    <div className="panel animate-fade-in">
      <div className="panel-header">
        <div className="panel-title">
          <span>◈</span>
          <span>Virtual DOM 结构</span>
          <span className="tag">h() 函数</span>
        </div>
      </div>
      <div className="panel-body">
        <div className="info-grid mb-3">
          <div className="info-card">
            <h4>什么是 Virtual DOM？</h4>
            <ul>
              <li>Virtual DOM 是真实 DOM 的 JavaScript 对象表示</li>
              <li>React 使用 VNode 描述 UI 结构</li>
              <li>状态变化时对比新旧 VNode 树，只更新变化的真实 DOM</li>
            </ul>
          </div>
          <div className="info-card react">
            <h4>为什么需要 Virtual DOM？</h4>
            <ul>
              <li>直接操作真实 DOM 昂贵且慢</li>
              <li>跨平台能力（React Native、SSR）</li>
              <li>更好的开发体验和调试能力</li>
            </ul>
          </div>
        </div>

        <div className="list-controls">
          <button className="btn btn-primary" onClick={addItem}>+ 添加列表项</button>
          <span className="text-muted">点击列表项文字或 × 删除</span>
        </div>

        <div className="fiber-container">
          <div className="fiber-tree-display">
            <h4 className="mb-2 text-secondary">渲染结果</h4>
            <div className="vtree">
              <VNodeRenderer vnode={vnodeTree} />
            </div>
          </div>
          <div className="fiber-schedule">
            <h4 className="mb-2 text-secondary">VNode 代码结构</h4>
            <pre style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {`h('div', { className: 'vtree' },
  h('ul', { className: 'item-list' },
${items.map(item =>
      `    h('li', { key: '${item.key}' },
      h('span', {}, '${item.text}'),
      h('button', {}, '×')
    )`
    ).join(',\n')}
  )
)`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function VNodeRenderer({ vnode, depth = 0 }: { vnode: VNode; depth?: number }) {
  const isText = vnode.type === 'TEXT_ELEMENT';
  const isComponent = typeof vnode.type === 'function';
  const typeName = isText ? 'TEXT' : String(vnode.type);
  const className = isText ? 'vnode text' : isComponent ? 'vnode component' : 'vnode element';

  return (
    <div style={{ marginLeft: depth > 0 ? '1.5rem' : 0 }}>
      <div className={className}>
        <span className="vnode-type">{typeName}</span>
        {!isText && vnode.props && Object.keys(vnode.props).length > 0 && (
          <span className="vnode-props">
            {JSON.stringify(Object.fromEntries(
              Object.entries(vnode.props).filter(([k]) => k !== 'children')
            ))}
          </span>
        )}
      </div>
      {vnode.props?.children && (
        <div className="vnode-children">
          {Array.isArray(vnode.props.children)
            ? vnode.props.children.map((child, i) => (
                <VNodeRenderer key={i} vnode={child} depth={depth + 1} />
              ))
            : null}
        </div>
      )}
    </div>
  );
}

/* ============================================
   Diff Panel
   ============================================ */
function DiffPanel() {
  const [oldList] = useState([
    { id: 1, text: 'A', key: 'a' },
    { id: 2, text: 'B', key: 'b' },
    { id: 3, text: 'C', key: 'c' },
  ]);

  const [newList] = useState([
    { id: 1, text: 'A', key: 'a' },
    { id: 4, text: 'D', key: 'd' },
    { id: 2, text: 'B', key: 'b' },
  ]);

  const oldVNodes = oldList.map((item) =>
    h('div', { key: item.key, className: 'diff-item-vnode' }, item.text)
  );

  const newVNodes = newList.map((item) =>
    h('div', { key: item.key, className: 'diff-item-vnode' }, item.text)
  );

  const reactResult = reactDiff(oldVNodes, newVNodes);
  const vueResult = vueDiff(oldVNodes, newVNodes);

  return (
    <div className="panel animate-fade-in">
      <div className="panel-header">
        <div className="panel-title">
          <span>◐</span>
          <span>React vs Vue Diff 算法对比</span>
          <span className="tag">双端队列</span>
        </div>
      </div>
      <div className="panel-body">
        <div className="info-grid mb-3">
          <div className="info-card react">
            <h4>React Diff 策略</h4>
            <ul>
              <li>Tree Diff: 同层对比，逐层遍历</li>
              <li>Component Diff: 同类型组件继续对比</li>
              <li>Element Diff: 通过 key 识别节点，复用/移动/创建</li>
            </ul>
          </div>
          <div className="info-card vue">
            <h4>Vue Diff 策略</h4>
            <ul>
              <li>同样使用双端队列从两端向中间对比</li>
              <li>通过 key 快速查找可复用节点位置</li>
              <li>尽量减少 DOM 移动操作</li>
            </ul>
          </div>
        </div>

        <div className="list-controls">
          <span className="text-secondary">旧列表:</span>
          <span className="text-cyan">[{oldList.map((i) => i.text).join(', ')}]</span>
          <span className="text-secondary">→</span>
          <span className="text-secondary">新列表:</span>
          <span className="text-green">[{newList.map((i) => i.text).join(', ')}]</span>
        </div>

        <div className="diff-comparison">
          <div className="diff-panel">
            <h3><span className="framework react">React</span> Diff 结果</h3>
            <DiffOperationsView result={reactResult} />
          </div>
          <div className="diff-panel">
            <h3><span className="framework vue">Vue</span> Diff 结果</h3>
            <DiffOperationsView result={vueResult} />
          </div>
        </div>

        <div className="mt-3 info-card fiber">
          <h4>为什么 key 不用索引？</h4>
          <ul>
            <li><code>key</code> 告诉 Diff 算法节点的唯一身份，便于复用</li>
            <li>用索引做 key：删除/插入时索引变化，导致错误复用和状态错乱</li>
            <li>移动操作比创建/删除操作代价小，但不是所有场景都能复用</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function DiffOperationsView({ result }: { result: DiffResult }) {
  return (
    <>
      <div className="diff-list">
        {result.operations.map((op, i) => (
          <DiffOperationItem key={i} operation={op} />
        ))}
      </div>
      <div className="diff-summary">
        <span className="total">总操作数</span>
        <span className="count">{result.totalUpdates}</span>
      </div>
    </>
  );
}

function DiffOperationItem({ operation }: { operation: DiffOperation }) {
  const getOpClass = (type: string) => {
    switch (type) {
      case 'CREATE': return 'op create';
      case 'DELETE': return 'op delete';
      case 'UPDATE': return 'op update';
      case 'MOVE': return 'op move';
      case 'REPLACE': return 'op replace';
      default: return 'op';
    }
  };

  const getOpLabel = (op: DiffOperation) => {
    switch (op.type) {
      case 'CREATE': return '创建';
      case 'DELETE': return '删除';
      case 'UPDATE': return `更新 [${op.propDiffs.map((p) => p.prop).join(', ')}]`;
      case 'MOVE': return `移动 ${op.fromIndex} → ${op.toIndex}`;
      case 'REPLACE': return '替换';
    }
  };

  return (
    <div className="diff-item">
      <span className={getOpClass(operation.type)}>{operation.type}</span>
      <span>{getOpLabel(operation)}</span>
    </div>
  );
}

/* ============================================
   Fiber Panel
   ============================================ */
function FiberPanel() {
  const sampleVNodes: VNode[] = [
    h('div', { key: 'root' },
      h('header', { key: 'h1' }, '标题'),
      h('ul', { key: 'list' },
        h('li', { key: 'a' }, 'Item A'),
        h('li', { key: 'b' }, 'Item B'),
        h('li', { key: 'c' }, 'Item C')
      ),
      h('footer', { key: 'f1' }, '底部')
    )
  ];

  const rootFiber = createFiber(h('div', { className: 'app-root' }, ...sampleVNodes), 0);
  const fiberTree = vnodeListToFiberTree(sampleVNodes, rootFiber, 0);
  const fibers = fiberTree ? [...fiberTreeTraversal(fiberTree)] : [];
  const scheduleSteps = fiberTree ? simulateFiberSchedule(fiberTree) : [];

  return (
    <div className="panel animate-fade-in">
      <div className="panel-header">
        <div className="panel-title">
          <span>◎</span>
          <span>Fiber 链表结构</span>
          <span className="tag">Fiber Tree</span>
        </div>
      </div>
      <div className="panel-body">
        <div className="info-grid mb-3">
          <div className="info-card fiber">
            <h4>Fiber 解决的问题</h4>
            <ul>
              <li>同步渲染可能阻塞主线程，导致卡顿</li>
              <li>Fiber 将渲染工作拆分成小单元，可中断恢复</li>
              <li>通过链表结构实现深度优先遍历的暂停与继续</li>
            </ul>
          </div>
          <div className="info-card">
            <h4>Fiber 节点核心字段</h4>
            <ul>
              <li><code>child</code>: 第一个子节点</li>
              <li><code>sibling</code>: 下一个兄弟节点</li>
              <li><code>return</code>: 父节点指针</li>
              <li><code>alternate</code>: 双缓冲，连接新旧版本</li>
            </ul>
          </div>
        </div>

        <div className="fiber-container">
          <div className="fiber-tree-display">
            <h4 className="mb-2 text-secondary">Fiber 链表结构</h4>
            <div className="fiber-list">
              {fibers.map((fiber, i) => (
                <FiberNodeView key={i} fiber={fiber} index={i} />
              ))}
            </div>
          </div>
          <div className="fiber-schedule">
            <h4 className="mb-2 text-secondary">调度过程</h4>
            <div className="schedule-timeline">
              {scheduleSteps.slice(0, 20).map((step, i) => (
                <ScheduleStepView key={i} step={step} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FiberNodeView({ fiber, index }: { fiber: Fiber; index: number }) {
  const nodeClass = index === 0 ? 'fiber-node' :
    fiber.sibling ? 'fiber-node sibling' :
    fiber.child ? 'fiber-node child' : 'fiber-node';

  return (
    <div className={nodeClass}>
      <span className="fiber-depth">D{fiber.depth}</span>
      <span className="fiber-name">{fiber.name}</span>
      <span className="fiber-type">{'<' + String(fiber.type).toLowerCase() + '>'}</span>
      <div className="fiber-links">
        {fiber.child && <span className="child-link">child: {fiber.child.name}</span>}
        {fiber.sibling && <span className="sibling-link">sibling: {fiber.sibling.name}</span>}
        {fiber.return && <span className="return-link">return: {fiber.return.name}</span>}
      </div>
    </div>
  );
}

function ScheduleStepView({ step }: { step: ScheduleStep }) {
  return (
    <div className="schedule-step">
      <span className="schedule-time">t={step.timestamp}</span>
      <span className={`schedule-action ${step.action}`}>{step.action}</span>
      <span className="schedule-fiber">{step.fiber.name}</span>
    </div>
  );
}

/* ============================================
   State Update Panel (状态更新机制)
   ============================================ */
interface StateLogEntry {
  time: string;
  action: string;
  prevValue: number;
  newValue: number;
  batched: boolean;
}

function StateUpdatePanel() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  const [logs, setLogs] = useState<StateLogEntry[]>([]);
  const logsRef = useRef<HTMLDivElement>(null);

  const getTime = () => {
    const now = new Date();
    return `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  };

  const addLog = (action: string, prevVal: number, nextVal: number, batched: boolean) => {
    setLogs((logs) => [{ time: getTime(), action, prevValue: prevVal, newValue: nextVal, batched }, ...logs.slice(0, 19)]);
  };

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = 0;
  }, [logs]);

  // 演示 1: 普通 setState（异步，合并）
  const handleNormalUpdate = () => {
    const prev = count;
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    addLog('普通 setState ×3', prev, prev + 1, true);
  };

  // 演示 2: 函数式更新（解决闭包问题）
  const handleFunctionalUpdate = () => {
    const prev = count;
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    addLog('函数式更新 ×3', prev, prev + 3, true);
  };

  // 演示 3: flushSync 强制同步
  const handleFlushSync = () => {
    const prev = count;
    flushSync(() => setCount((c) => c + 1));
    flushSync(() => setFlag((f) => !f));
    addLog('flushSync ×2', prev, prev + 1, false);
  };

  // 演示 4: 模拟批量更新（Promise.then）
  const handlePromiseUpdate = () => {
    const prev = count;
    Promise.resolve().then(() => {
      setCount(count + 1);
      setFlag(!flag);
      addLog('Promise.then 内更新', prev, prev + 1, true);
    });
  };

  // 演示 5: setTimeout 内的更新
  const handleTimeoutUpdate = () => {
    const prev = count;
    setTimeout(() => {
      setCount(count + 1);
      setFlag(!flag);
      addLog('setTimeout 内更新', prev, prev + 1, true);
    }, 100);
  };

  return (
    <div className="panel animate-fade-in">
      <div className="panel-header">
        <div className="panel-title">
          <span>⚡</span>
          <span>状态更新机制</span>
          <span className="tag">setState / flushSync</span>
        </div>
      </div>
      <div className="panel-body">
        <div className="info-grid mb-3">
          <div className="info-card">
            <h4>setState 的异步特性</h4>
            <ul>
              <li>setState 后不会立即更新，而是合并多次更新</li>
              <li>React 18+ 所有更新自动批量处理（Auto Batching）</li>
              <li>函数式更新可以获取上一状态的最新值</li>
            </ul>
          </div>
          <div className="info-card react">
            <h4>flushSync 强制同步</h4>
            <ul>
              <li>使用 <code>flushSync()</code> 可以立即执行更新</li>
              <li>会打断批量更新，每次调用触发一次重新渲染</li>
              <li>适用于需要立即获取 DOM 状态的场景</li>
            </ul>
          </div>
        </div>

        <div className="fiber-container">
          <div style={{ flex: 1 }}>
            <h4 className="mb-2 text-secondary">当前状态</h4>
            <div className="info-card" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center justify-between mb-1">
                <span>count:</span>
                <span className="text-cyan" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>flag:</span>
                <span className={flag ? 'text-green' : 'text-red'} style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {flag ? 'true' : 'false'}
                </span>
              </div>
            </div>

            <h4 className="mb-2 text-secondary">操作演示</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="info-card">
                <h4 className="mb-1">普通 setState（合并）</h4>
                <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                  count 被加了 1 次（合并），因为三个 setState 基于同一个 count 值
                </p>
                <button className="btn btn-primary" onClick={handleNormalUpdate}>
                  setCount ×3（普通）
                </button>
              </div>

              <div className="info-card">
                <h4 className="mb-1">函数式更新（正确累加）</h4>
                <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                  使用 {'prev => prev + 1'}，能正确获取上一状态，count 被加了 3 次
                </p>
                <button className="btn btn-primary" onClick={handleFunctionalUpdate}>
                  setCount(prev =&gt; prev+1) ×3
                </button>
              </div>

              <div className="info-card">
                <h4 className="mb-1">flushSync（强制同步）</h4>
                <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                  每次 flushSync 立即触发更新，不合并，每次调用触发一次渲染
                </p>
                <button className="btn btn-primary" onClick={handleFlushSync}>
                  flushSync(() ={'>'} setState())
                </button>
              </div>

              <div className="info-card">
                <h4 className="mb-1">Promise / setTimeout 内更新</h4>
                <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                  React 18+ 自动批处理：这些回调内的多次 setState 会合并为一次渲染
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" onClick={handlePromiseUpdate}>Promise.then</button>
                  <button className="btn" onClick={handleTimeoutUpdate}>setTimeout</button>
                </div>
              </div>
            </div>
          </div>

          <div className="fiber-schedule" style={{ maxHeight: '500px' }}>
            <h4 className="mb-2 text-secondary">更新日志</h4>
            <div className="schedule-timeline" ref={logsRef}>
              {logs.length === 0 ? (
                <div className="text-muted" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>
                  点击上方按钮触发状态更新
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="schedule-step" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div className="flex items-center gap-1">
                      <span className="schedule-time">{log.time}</span>
                      <span className={`schedule-action ${log.batched ? 'begin' : 'complete'}`}>
                        {log.batched ? '批处理' : '同步'}
                      </span>
                    </div>
                    <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                      {log.action}: <span className="text-red">{log.prevValue}</span> → <span className="text-green">{log.newValue}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="info-card fiber mt-3">
          <h4>面试题：React 18 自动批处理原理？</h4>
          <ul>
            <li>React 18 引入 <code>isBatching</code> 标志，在事件处理器中自动开启批量更新</li>
            <li>Promise/setTimeout/原生事件回调内的更新也会自动合并</li>
            <li>使用 <code>flushSync()</code> 可以强制同步，退出批处理模式</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Event Panel (合成事件)
   ============================================ */
function EventPanel() {
  const [eventLog, setEventLog] = useState<Array<{
    time: string;
    phase: 'capture' | 'bubble';
    target: string;
  }>>([]);

  const eventLogRef = useRef<HTMLDivElement>(null);

  const handleEvent = useCallback((e: React.MouseEvent, phase: 'capture' | 'bubble') => {
    const target = e.currentTarget as HTMLElement;
    const now = new Date();
    const time = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

    setEventLog((prev) => [
      { time, phase, target: target.dataset.label || target.tagName },
      ...prev.slice(0, 19),
    ]);
  }, []);

  useEffect(() => {
    if (eventLogRef.current) eventLogRef.current.scrollTop = 0;
  }, [eventLog]);

  const clearLog = () => setEventLog([]);

  return (
    <div className="panel animate-fade-in">
      <div className="panel-header">
        <div className="panel-title">
          <span>◉</span>
          <span>合成事件与事件委托</span>
          <span className="tag">SyntheticEvent</span>
        </div>
      </div>
      <div className="panel-body">
        <div className="info-grid mb-3">
          <div className="info-card event">
            <h4>React 16 vs 17+ 事件委托</h4>
            <ul>
              <li>React 16: 事件委托到 document</li>
              <li>React 17+: 事件委托到 root 容器</li>
              <li>支持微前端隔离，避免多版本冲突</li>
            </ul>
          </div>
          <div className="info-card">
            <h4>合成事件特性</h4>
            <ul>
              <li>跨浏览器兼容的包装器</li>
              <li>事件对象池复用（React 17 前）</li>
              <li>自动批量更新（React 18+）</li>
            </ul>
          </div>
        </div>

        <div className="event-demo-area">
          <div className="event-interactive">
            <div
              className="event-target"
              data-label="outer"
              onClick={(e) => handleEvent(e, 'bubble')}
              onClickCapture={(e) => handleEvent(e, 'capture')}
            >
              <span className="target-label">外层容器</span>
              <span className="target-element">◼</span>
              <div
                className="event-target"
                data-label="middle"
                onClick={(e) => handleEvent(e, 'bubble')}
                onClickCapture={(e) => handleEvent(e, 'capture')}
                style={{ transform: 'scale(0.8)' }}
              >
                <span className="target-label">中层容器</span>
                <span className="target-element">◻</span>
                <div
                  className="event-target"
                  data-label="inner-button"
                  onClick={(e) => handleEvent(e, 'bubble')}
                  onClickCapture={(e) => handleEvent(e, 'capture')}
                  style={{ transform: 'scale(0.7)', background: 'var(--bg-elevated)' }}
                >
                  <span className="target-label">内部按钮</span>
                  <span className="target-element">⊙</span>
                </div>
              </div>
            </div>

            <div className="event-log" ref={eventLogRef}>
              <div className="event-log-title">
                事件日志
                <button className="btn btn-sm" onClick={clearLog} style={{ marginLeft: '1rem' }}>清除</button>
              </div>
              <div className="event-log-entries">
                {eventLog.length === 0 ? (
                  <div className="text-muted" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>
                    点击上方区域触发事件
                  </div>
                ) : (
                  eventLog.map((entry, i) => (
                    <div key={i} className="event-log-entry">
                      <span className="time">{entry.time}</span>
                      <span className={`phase ${entry.phase}`}>{entry.phase}</span>
                      <span className="target">{entry.target}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="info-grid mt-2">
            <div className="info-card fiber">
              <h4>事件执行顺序</h4>
              <ul>
                <li>点击按钮 → <strong>捕获阶段</strong>（外→内）</li>
                <li>→ <strong>事件目标</strong></li>
                <li>→ <strong>冒泡阶段</strong>（内→外）</li>
              </ul>
            </div>
            <div className="info-card event">
              <h4>为什么改到 root？</h4>
              <ul>
                <li><strong>微前端隔离</strong>：多 React 版本可共存</li>
                <li><strong>减少冲突</strong>：不覆盖 document 事件</li>
                <li><strong>更安全</strong>：避免第三方代码干扰</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

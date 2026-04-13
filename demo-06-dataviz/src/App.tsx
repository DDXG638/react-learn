import React, { useState, useMemo, memo, useRef, useEffect, Suspense } from 'react';
import { generateMockData, calculateStats } from './types/data';
import { useVirtualScroll } from './hooks/useVirtualScroll';

type Tab = 'virtual-list' | 'memo-demo' | 'lazy-loading' | 'context-opt';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('virtual-list');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold p-4">数据可视化大屏 - React 性能优化</h1>
        <nav className="flex gap-1 px-4 pb-2 overflow-x-auto">
          {[
            { id: 'virtual-list', label: '虚拟滚动' },
            { id: 'memo-demo', label: 'memo 优化' },
            { id: 'lazy-loading', label: '懒加载' },
            { id: 'context-opt', label: 'Context 优化' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
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

      <main className="p-6">
        {activeTab === 'virtual-list' && <VirtualListDemo />}
        {activeTab === 'memo-demo' && <MemoDemo />}
        {activeTab === 'lazy-loading' && <LazyLoadingDemo />}
        {activeTab === 'context-opt' && <ContextOptDemo />}
      </main>
    </div>
  );
}

// ============ 虚拟滚动演示 ============
function VirtualListDemo() {
  const [dataSize, setDataSize] = useState(10000);
  const itemHeight = 56;

  const data = useMemo(() => generateMockData(dataSize), [dataSize]);
  const stats = useMemo(() => calculateStats(data), [data]);

  const {
    containerRef,
    virtualItems,
    totalHeight,
    handleScroll,
    scrollToIndex,
  } = useVirtualScroll(data, { itemHeight, overscan: 5 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">虚拟滚动长列表</h2>
          <p className="text-gray-500 dark:text-gray-400">
            渲染 {data.length.toLocaleString()} 条数据，实际 DOM 节点仅 {virtualItems.length} 个
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <label className="text-sm">数据量：</label>
          <select
            value={dataSize}
            onChange={(e) => setDataSize(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value={1000}>1,000</option>
            <option value={10000}>10,000</option>
            <option value={50000}>50,000</option>
            <option value={100000}>100,000</option>
          </select>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '数据总量', value: data.length, color: 'purple' },
          { label: '最大值', value: stats.max, color: 'green' },
          { label: '最小值', value: stats.min, color: 'blue' },
          { label: '平均值', value: Math.round(stats.avg), color: 'orange' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <div className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 虚拟列表 */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button onClick={() => scrollToIndex(0)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            顶部
          </button>
          <button onClick={() => scrollToIndex(Math.floor(data.length / 2))} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            中间
          </button>
          <button onClick={() => scrollToIndex(data.length - 1)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            底部
          </button>
        </div>

        {/* 表头 */}
        <div className="flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium text-sm">
          <span className="w-20 text-gray-500">ID</span>
          <span className="flex-1">标签</span>
          <span className="w-28 text-right">数值</span>
          <span className="w-20 text-center">分类</span>
        </div>

        {/* 可滚动区域 */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-96 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            {virtualItems.map((vItem) => {
              const item = data[vItem.index];
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: vItem.start,
                    left: 0,
                    right: 0,
                    height: itemHeight,
                  }}
                  className="flex items-center px-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <span className="w-20 text-gray-500">#{item.id}</span>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <span className="w-28 text-right font-mono text-purple-600 dark:text-purple-400">
                    {item.value.toLocaleString()}
                  </span>
                  <span className={`w-20 text-center px-2 py-1 rounded text-sm ${
                    item.category === 'A' ? 'bg-red-100 text-red-700' :
                    item.category === 'B' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-gray-500">
          可见区域：{virtualItems.length} 个 DOM 节点 | 总高度：{totalHeight}px | 滚动位置：{Math.round(containerRef.current?.scrollTop || 0)}px
        </p>
      </div>
    </div>
  );
}

// ============ memo 优化演示 ============
function MemoDemo() {
  const [count, setCount] = useState(0);
  const [items] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({ id: i, name: `项目 ${i + 1}` }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">React.memo 优化</h2>
        <p className="text-gray-500 dark:text-gray-400">点击按钮改变父组件状态，观察子组件是否重新渲染</p>
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={() => setCount((c) => c + 1)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          父组件计数 +1 ({count})
        </button>
        <span className="text-gray-500">点击后子组件不重新渲染（已用 memo 包装）</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => (
          <MemoizedChild key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

interface ChildProps {
  item: { id: number; name: string };
}

// 未优化的子组件
const ChildComponent = ({ item }: ChildProps) => {
  console.log('ChildComponent 渲染:', item.id);
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
      <div className="text-2xl">{item.id}</div>
      <div className="text-sm text-gray-500">{item.name}</div>
    </div>
  );
};

// 使用 React.memo 优化的子组件
const MemoizedChild = memo(ChildComponent);

// ============ 懒加载演示 ============
function LazyLoadingDemo() {
  const [showChart, setShowChart] = useState(false);
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">组件懒加载</h2>
        <p className="text-gray-500 dark:text-gray-400">使用 React.lazy 和 Suspense 实现代码分割</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setShowChart((v) => !v)}
          className={`px-4 py-2 rounded-lg ${
            showChart ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          {showChart ? '隐藏图表' : '加载图表'}
        </button>
        <button
          onClick={() => setShowTable((v) => !v)}
          className={`px-4 py-2 rounded-lg ${
            showTable ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          {showTable ? '隐藏表格' : '加载表格'}
        </button>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-gray-500">加载中...</div>}>
        {showChart && <HeavyChart />}
        {showTable && <DataTable />}
      </Suspense>
    </div>
  );
}

// 模拟重量级图表组件
function HeavyChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, 400, 200);

    ctx.fillStyle = '#7c3aed';
    for (let i = 0; i < 20; i++) {
      const x = i * 20 + 10;
      const h = Math.random() * 150 + 20;
      ctx.fillRect(x, 200 - h, 15, h);
    }
  }, []);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">重量级图表组件 (lazy loaded)</h3>
      <canvas ref={canvasRef} width={400} height={200} className="border rounded" />
    </div>
  );
}

// 模拟数据表格组件
function DataTable() {
  const data = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => ({ id: i, value: Math.random() * 100 })),
    []
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">数据表格组件 (lazy loaded)</h3>
      <div className="space-y-2 max-h-60 overflow-auto">
        {data.slice(0, 20).map((row) => (
          <div key={row.id} className="flex justify-between px-4 py-2 bg-white dark:bg-gray-700 rounded">
            <span>ID: {row.id}</span>
            <span>Value: {row.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Context 优化演示 ============
interface ThemeContextType {
  theme: 'light' | 'dark';
  primary: string;
}

const ThemeContext = React.createContext<ThemeContextType | null>(null);

// 使用 useMemo 优化 Context value
function useOptimizedTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const value = useMemo(() => ({
    theme,
    primary: theme === 'dark' ? '#a78bfa' : '#7c3aed',
  }), [theme]);

  return { theme, setTheme, value };
}

function ContextOptDemo() {
  const { theme, setTheme, value } = useOptimizedTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Context 优化</h2>
        <p className="text-gray-500 dark:text-gray-400">
          使用 useMemo 避免不必要的 value 重创建，防止消费组件无谓重渲染
        </p>
      </div>

      <ThemeContext.Provider value={value}>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setTheme('light')}
            className={`px-4 py-2 rounded-lg ${theme === 'light' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
          >
            浅色
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
          >
            深色
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <ThemeConsumer name="组件 A" />
          <ThemeConsumer name="组件 B" />
          <ThemeConsumer name="组件 C" />
        </div>
      </ThemeContext.Provider>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
        <code>value 对象引用变化次数: {theme === 'light' ? 0 : 1}</code>
        <p className="text-gray-500 mt-2">
          由于 useMemo 优化，只有 theme 变化时 value 才会重建
        </p>
      </div>
    </div>
  );
}

// 消费 Context 的组件
const ThemeConsumer = memo(function ThemeConsumer({ name }: { name: string }) {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) return null;

  return (
    <div
      className="p-4 rounded-lg border-2 transition-colors"
      style={{ borderColor: ctx.primary }}
    >
      <div className="font-semibold">{name}</div>
      <div className="text-sm text-gray-500">主题: {ctx.theme}</div>
      <div
        className="w-full h-8 mt-2 rounded"
        style={{ backgroundColor: ctx.primary }}
      />
    </div>
  );
});
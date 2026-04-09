import type { FilterType } from '../types/todo';

interface StatsProps {
  completed: number;
  active: number;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onClearCompleted: () => void;
}

export function Stats({
  completed,
  active,
  filter,
  onFilterChange,
  onClearCompleted,
}: StatsProps) {
  return (
    <div className="stats">
      {/* JSX 条件渲染：使用 && 运算符 */}
      {completed > 0 && (
        <button onClick={onClearCompleted} className="btn-clear">
          清除已完成 ({completed})
        </button>
      )}

      <div className="filter-tabs">
        {/* 筛选 Tab：三元表达式 */}
        {(['all', 'active', 'completed'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
          >
            {f === 'all' ? '全部' : f === 'active' ? '待办' : '已完成'}
          </button>
        ))}
      </div>

      {/* JSX 条件渲染：使用三元表达式 */}
      <div className="stats-text">
        {active === 0 ? (
          <span className="all-done">🎉 所有任务已完成！</span>
        ) : (
          <span>
            还有 <strong>{active}</strong> 个任务待完成
          </span>
        )}
      </div>
    </div>
  );
}

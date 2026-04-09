import { useTodos } from './hooks/useTodos';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import { Stats } from './components/Stats';
import './App.css';

function App() {
  const {
    todos,
    filter,
    setFilter,
    isLoading,
    stats,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
  } = useTodos();

  return (
    <div className="app">
      <header className="header">
        <h1>📝 任务管理应用</h1>
        <p className="subtitle">React useState + useEffect 入门 Demo</p>
      </header>

      <main className="main">
        {/* 新增任务表单 */}
        <TodoForm onAdd={addTodo} />

        {/* 加载状态 */}
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : (
          <>
            {/* 任务列表 */}
            <TodoList
              todos={todos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />

            {/* 空状态提示 */}
            {todos.length === 0 && (
              <div className="empty-state">
                {filter === 'all'
                  ? '📋 还没有任务，添加一个吧！'
                  : filter === 'active'
                  ? '✅ 所有任务都完成了！'
                  : '📭 没有已完成的任务'}
              </div>
            )}

            {/* 统计和筛选 */}
            <Stats
              completed={stats.completed}
              active={stats.active}
              filter={filter}
              onFilterChange={setFilter}
              onClearCompleted={clearCompleted}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;

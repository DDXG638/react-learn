import { useState, useEffect } from 'react';
import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);

  useEffect(() => {
    console.log('[TodoItem] 组件挂载');

    return () => {
      console.log('[TodoItem] 组件卸载');
    }
  }, [])

  const handleSubmit = () => {
    if (editValue.trim()) {
      onEdit(todo.id, editValue);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setEditValue(todo.title);
      setIsEditing(false);
    }
  };

  // JSX 条件渲染：编辑模式 vs 查看模式
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        {/* 复选框：条件渲染 */}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="todo-checkbox"
        />

        {isEditing ? (
          // 编辑模式
          <input
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            className="todo-edit-input"
            autoFocus
          />
        ) : (
          // 查看模式：双击进入编辑
          <span
            className="todo-title"
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.title}
          </span>
        )}
      </div>

      <div className="todo-actions">
        {/* 编辑按钮 */}
        <button
          onClick={() => setIsEditing(true)}
          className="btn-icon"
          aria-label="编辑"
        >
          ✏️
        </button>
        {/* 删除按钮 */}
        <button
          onClick={() => onDelete(todo.id)}
          className="btn-icon btn-delete"
          aria-label="删除"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}

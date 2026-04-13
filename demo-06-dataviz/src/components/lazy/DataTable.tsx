import { useMemo } from 'react';

export default function DataTable() {
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
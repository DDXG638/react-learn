import { useEffect, useRef } from 'react';

export default function HeavyChart() {
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
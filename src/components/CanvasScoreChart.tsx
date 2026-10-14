import React, { useRef, useEffect } from 'react';
import { QuizAttempt } from '../types';

interface Props {
  data: QuizAttempt[];
  maxItems?: number;
  height?: number;
}

export const CanvasScoreChart: React.FC<Props> = ({ data, maxItems = 7, height = 180 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Take recent items and sort chronologically (oldest to newest for line chart)
  const chartData = [...data].slice(0, maxItems).reverse();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    if (chartData.length === 0) {
      return;
    }

    const pad = { top: 20, right: 24, bottom: 30, left: 36 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    // Gridlines at 0, 25, 50, 75, 100
    const ticks = [0, 25, 50, 75, 100];
    ticks.forEach((tick) => {
      const y = pad.top + chartH - (tick / 100) * chartH;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px "DM Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${tick}%`, pad.left - 8, y);
    });

    const step = chartData.length > 1 ? chartW / (chartData.length - 1) : 0;
    const points = chartData.map((q, i) => {
      const x = chartData.length === 1 ? pad.left + chartW / 2 : pad.left + i * step;
      const y = pad.top + chartH - (q.score / 100) * chartH;
      return { x, y, q };
    });

    // Area gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
    grad.addColorStop(0.7, 'rgba(34, 211, 238, 0.1)');
    grad.addColorStop(1, 'rgba(139, 92, 246, 0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, pad.top + chartH);
    points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Data points & bottom labels
    points.forEach((pt, idx) => {
      // Glow circle
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Score text above point
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 10px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${pt.q.score}%`, pt.x, pt.y - 10);

      // Bottom date or index label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      const label = pt.q.day ? pt.q.day.substring(5) : `#${idx + 1}`;
      ctx.fillText(label, pt.x, h - 8);
    });
  }, [chartData, height]);

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs text-center p-6"
        style={{ height }}
      >
        <span>Complete your first practice quiz to see your score trend visualized here.</span>
      </div>
    );
  }

  return (
    <div className="w-full relative" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

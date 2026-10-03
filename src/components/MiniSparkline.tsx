import React from "react";
import { ChartDataPoint } from "../types";

interface MiniSparklineProps {
  data?: ChartDataPoint[];
  isPositive: boolean;
  height?: number;
  width?: number;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data = [],
  isPositive,
  height = 50,
  width = 160,
}) => {
  if (!data || data.length < 2) {
    return <div className="h-[50px] w-[160px] bg-zinc-900/30 rounded animate-pulse" />;
  }

  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((d.price - min) / range) * (height - 10) - 5;
    return { x, y, isWhaleAction: d.isWhaleAction };
  });

  const svgPath = points.reduce((acc, point, index) => {
    return `${acc} ${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, "");

  const strokeColor = isPositive ? "#10b981" : "#f43f5e";
  const fillColor = isPositive ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)";

  // Area under curve
  const areaPath = `${svgPath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="relative overflow-hidden">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${isPositive ? "up" : "down"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity="0.25" />
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Fill Area */}
        <path d={areaPath} fill={`url(#grad-${isPositive ? "up" : "down"})`} />

        {/* Price Line */}
        <path
          d={svgPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Whale action dots */}
        {points.map((p, i) => {
          if (!p.isWhaleAction) return null;
          const isBuy = p.isWhaleAction === "BUY";
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill={isBuy ? "#34d399" : "#fb7185"}
                stroke="#09090b"
                strokeWidth="1.5"
                className="animate-ping opacity-75"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill={isBuy ? "#10b981" : "#f43f5e"}
                stroke="#ffffff"
                strokeWidth="1"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

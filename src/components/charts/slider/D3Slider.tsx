import React, { useMemo } from 'react';
import * as d3 from 'd3';

type BulletProps = {
  /** Numbers to summarize. Component computes min, mean, max. */
  values: number[];
  /** Optional width/height of the SVG (CSS width is responsive). */
  svgWidth?: number;
  svgHeight?: number;
  /** Optional: className for the outer card wrapper */
  className?: string;
  /** Optional number formatter for labels (default: 1 decimal for mean, integers for min/max) */
  formatNumber?: (v: number, kind: 'min' | 'mean' | 'max') => string;
  /** Optional array of colors for the chart elements */
  chartColors?: string[];
};

const D3Slider: React.FC<BulletProps> = ({
  values,
  svgWidth = 700,
  svgHeight = 180, // deeper to avoid label clipping
  formatNumber,
  chartColors = [d3.schemeTableau10[0], d3.schemeTableau10[3]]
}) => {
  const stats = useMemo(() => {
    const nums = (values || []).map(Number).filter(Number.isFinite);
    if (!nums.length) {
      return {
        hasData: false,
        min: 0,
        max: 1,
        mean: 0.5
      };
    }
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;

    // If domain collapses, pad a touch so visuals still render
    if (min === max) {
      const pad = Math.abs(min) * 0.05 + 1e-6;
      return { hasData: true, min: min - pad, max: max + pad, mean };
    }
    return { hasData: true, min, max, mean };
  }, [values]);

  const fmt =
    formatNumber ??
    ((v: number, kind: 'min' | 'mean' | 'max') =>
      kind === 'mean' ? v.toFixed(1) : `${Math.round(v)}`);

  // Layout (matches the pure HTML version)
  const innerMargin = { left: 24, top: 24, right: 24, bottom: 24 };
  const innerW = svgWidth - innerMargin.left - innerMargin.right;

  const barY = 42; // band position
  const barH = 20; // band height
  const axisY = 122; // tick line Y (keep labels visible below)

  // Scale (guard divide-by-zero)
  const x = (v: number) => ((v - stats.min) / (stats.max - stats.min || 1)) * innerW;

  // Minimal inline styles so the component is copy-paste ready
  const styles: Record<string, React.CSSProperties> = {
    card: {
      maxWidth: 760,
      border: '1px solid #e5e7eb',
      borderRadius: 16,
      boxShadow: '0 12px 28px rgba(0,0,0,.08)',
      padding: '18px 20px 32px', // extra bottom padding for labels
      background: 'linear-gradient(180deg,#ffffff 0%,#f7f7f7 100%)'
    },
    svg: {
      width: '100%',
      height: svgHeight,
      display: 'block',
      overflow: 'visible'
    },
    axisText: { fill: '#4b5563', fontSize: 12 },
    inlineText: { fill: '#374151', fontSize: 12 }
  };

  return (
    <>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Min mean max bullet"
        style={styles.svg}
      >
        <defs>
          {/* Soft matte gradient for the band (teal family) */}
          <linearGradient id="band-matte" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#dbeeee" />
            <stop offset="100%" stopColor="#cfe6e4" />
          </linearGradient>

          {/* Emboss filter applied to data shapes (band + mean) */}
          <filter id="emboss">
            <feDropShadow
              dx="0.7"
              dy="1.2"
              stdDeviation="1.0"
              floodColor="black"
              floodOpacity="0.30"
            />
            <feDropShadow
              dx="-0.7"
              dy="-0.7"
              stdDeviation="0.9"
              floodColor="white"
              floodOpacity="0.55"
            />
          </filter>

          {/* Subtle inner shadow for a recessed plotting area */}
          <filter id="inner-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feOffset dx="0" dy="1" />
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feComposite operator="out" in="SourceGraphic" in2="blur" result="inverse" />
            <feFlood floodColor="black" floodOpacity="0.08" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>

        {/* Inner group with margin transform */}
        <g transform={`translate(${innerMargin.left},${innerMargin.top})`}>
          {/* Optional frame for depth */}
          <rect
            x={0}
            y={8}
            width={innerW}
            height={120}
            rx={10}
            ry={10}
            fill="#ffffff"
            filter="url(#inner-shadow)"
          />

          {/* Band: min → max (matte + embossed) */}
          <rect
            x={x(stats.min)}
            y={barY}
            width={Math.max(1, x(stats.max) - x(stats.min))}
            height={barH}
            rx={10}
            ry={10}
            fill="url(#band-matte)"
            stroke={chartColors[1]}
            strokeWidth={1}
            filter="url(#emboss)"
          />

          {/* Mean marker (chartColors[0]) */}
          <line
            x1={x(stats.mean)}
            x2={x(stats.mean)}
            y1={barY - 7}
            y2={barY + barH + 7}
            stroke={chartColors[0]}
            strokeWidth={8}
            filter="url(#emboss)"
          />
          <circle
            cx={x(stats.mean)}
            cy={barY + barH / 2}
            r={10}
            fill={chartColors[0]}
            filter="url(#emboss)"
          />

          {/* Axis ticks & labels (min, mean, max) */}
          <g>
            {/* min */}
            <line
              x1={x(stats.min)}
              x2={x(stats.min)}
              y1={axisY}
              y2={axisY + 8}
              stroke="#9ca3af"
              strokeWidth={1}
            />
            <text x={x(stats.min)} y={axisY + 26} textAnchor="middle" style={styles.axisText}>
              {`min ${fmt(stats.min, 'min')}`}
            </text>

            {/* mean */}
            <line
              x1={x(stats.mean)}
              x2={x(stats.mean)}
              y1={axisY}
              y2={axisY + 8}
              stroke="#9ca3af"
              strokeWidth={1}
            />
            <text x={x(stats.mean)} y={axisY + 26} textAnchor="middle" style={styles.axisText}>
              {`mean ${fmt(stats.mean, 'mean')}`}
            </text>

            {/* max */}
            <line
              x1={x(stats.max)}
              x2={x(stats.max)}
              y1={axisY}
              y2={axisY + 8}
              stroke="#9ca3af"
              strokeWidth={1}
            />
            <text x={x(stats.max)} y={axisY + 26} textAnchor="middle" style={styles.axisText}>
              {`max ${fmt(stats.max, 'max')}`}
            </text>
          </g>

          {/* Inline labels above the band (optional, keeps numbers close to marks) */}
          <g>
            <text x={x(stats.min)} y={barY - 12} textAnchor="start" style={styles.inlineText}>
              {fmt(stats.min, 'min')}
            </text>
            <text x={x(stats.mean)} y={barY - 12} textAnchor="middle" style={styles.inlineText}>
              {fmt(stats.mean, 'mean')}
            </text>
            <text x={x(stats.max)} y={barY - 12} textAnchor="end" style={styles.inlineText}>
              {fmt(stats.max, 'max')}
            </text>
          </g>
        </g>
      </svg>
    </>
  );
};

export default D3Slider;

import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 110,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return 'text-emerald-400 stroke-emerald-400';
    if (s >= 65) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const getBgBadge = (s: number) => {
    if (s >= 80) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    if (s >= 65) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'Strong Fit';
    if (s >= 65) return 'Moderate Fit';
    return 'Needs Work';
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Subtle track ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active colored progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${getColor(score)} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Text: Changed text-slate-900 to bright text-white */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-black tracking-tight text-white leading-none">
            {score}%
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            ATS Score
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${getBgBadge(score)}`}>
          {getLabel(score)}
        </span>
        <p className="text-[11px] text-slate-400 leading-snug max-w-[140px]">
          Calculated from keyword density, verbs & structure.
        </p>
      </div>
    </div>
  );
};
'use client';

interface DataPoint {
  name: string;
  messages: number;
}

interface LineChartProps {
  data: DataPoint[];
}

export function LineChart({ data }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-slate-50 rounded-lg">
        <p className="text-slate-600">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.messages));
  const scale = maxValue > 0 ? 240 / maxValue : 1;

  return (
    <div className="w-full h-64 flex items-end gap-4 p-4 bg-slate-50 rounded-lg">
      {data.map((point, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="relative w-full h-48 flex items-end justify-center">
            <div
              className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all hover:from-green-600 hover:to-green-500"
              style={{
                height: `${point.messages * scale}px`,
                minHeight: '4px',
              }}
              title={`${point.name}: ${point.messages} messages`}
            />
          </div>
          <span className="text-xs font-medium text-slate-600 text-center">
            {point.name}
          </span>
          <span className="text-xs text-slate-500">{point.messages}</span>
        </div>
      ))}
    </div>
  );
}

'use client'

interface FunnelData {
  label: string
  value: number
  color: string
}

interface FunnelChartProps {
  data: FunnelData[]
}

export function FunnelChart({ data }: FunnelChartProps) {
  const max = data[0]?.value || 1

  return (
    <div className="space-y-4">
      {data.map((item, i) => {
        const width = Math.round((item.value / max) * 100)
        const rate = i > 0 ? ((item.value / data[i - 1].value) * 100).toFixed(1) : '100'
        return (
          <div key={item.label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-300 text-sm font-medium">{item.label}</span>
              <div className="flex items-center gap-2">
                {i > 0 && (
                  <span className="text-slate-500 text-xs">전단계 대비 {rate}%</span>
                )}
                <span className="text-white font-bold">{item.value.toLocaleString()}명</span>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-8 overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full flex items-center justify-end pr-3 transition-all duration-700`}
                style={{ width: `${width}%` }}
              >
                <span className="text-white text-xs font-bold">{width}%</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

interface PathData {
  path: string
  count: number
}

interface PathChartProps {
  data: PathData[]
}

export function PathChart({ data }: PathChartProps) {
  if (!data.length) {
    return <p className="text-slate-500 text-center py-8">데이터가 없습니다</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="path"
          cx="50%"
          cy="50%"
          outerRadius={110}
          label={({ path, percent }) => `${path} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: '#475569' }}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
          formatter={(value: number) => [`${value}명`, '신청자']}
        />
        <Legend wrapperStyle={{ color: '#94a3b8' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

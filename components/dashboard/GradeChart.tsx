'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface GradeData {
  grade: string
  신청: number
  출석: number
  출석률: number
}

interface GradeChartProps {
  data: GradeData[]
}

export function GradeChart({ data }: GradeChartProps) {
  if (!data.length) {
    return <p className="text-slate-500 text-center py-8">데이터가 없습니다</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="grade" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
          labelStyle={{ color: '#f1f5f9' }}
        />
        <Legend wrapperStyle={{ color: '#94a3b8', paddingTop: 8 }} />
        <Bar dataKey="신청" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="출석" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

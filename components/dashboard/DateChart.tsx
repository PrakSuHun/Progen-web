'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DateData {
  date: string
  신청: number
  출석: number
}

interface DateChartProps {
  data: DateData[]
}

export function DateChart({ data }: DateChartProps) {
  if (!data.length) {
    return <p className="text-slate-500 text-center py-8">데이터가 없습니다</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
          labelStyle={{ color: '#f1f5f9' }}
        />
        <Legend wrapperStyle={{ color: '#94a3b8', paddingTop: 16 }} />
        <Line type="monotone" dataKey="신청" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9' }} />
        <Line type="monotone" dataKey="출석" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

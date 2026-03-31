'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TagData {
  tag: string
  count: number
}

interface FeedbackTagChartProps {
  goodTags: TagData[]
  badTags: TagData[]
}

export function FeedbackTagChart({ goodTags, badTags }: FeedbackTagChartProps) {
  return (
    <div className="space-y-8">
      {/* 좋았던 점 */}
      <div>
        <h4 className="text-slate-300 font-semibold mb-4 flex items-center gap-2">
          <span className="text-green-400">👍</span> 좋았던 점 태그 빈도
        </h4>
        {goodTags.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={goodTags} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis dataKey="tag" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="선택 수" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-sm">데이터가 없습니다</p>
        )}
      </div>

      {/* 아쉬운 점 */}
      <div>
        <h4 className="text-slate-300 font-semibold mb-4 flex items-center gap-2">
          <span className="text-red-400">👎</span> 아쉬운 점 태그 빈도
        </h4>
        {badTags.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={badTags} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis dataKey="tag" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
              />
              <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} name="선택 수" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-sm">데이터가 없습니다</p>
        )}
      </div>
    </div>
  )
}

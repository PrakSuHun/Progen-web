'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface FeedbackRadarProps {
  score_overall: number
  score_content: number
  score_practice: number
  score_network: number
}

export function FeedbackRadar({
  score_overall,
  score_content,
  score_practice,
  score_network,
}: FeedbackRadarProps) {
  const data = [
    { subject: '전반적 만족도', score: score_overall },
    { subject: '강의 내용', score: score_content },
    { subject: '실습 경험', score: score_practice },
    { subject: '네트워킹', score: score_network },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 10 }} />
        <Radar
          name="만족도"
          dataKey="score"
          stroke="#0ea5e9"
          fill="#0ea5e9"
          fillOpacity={0.3}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
          formatter={(value: number) => [`${value.toFixed(2)} / 5.0`, '점수']}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

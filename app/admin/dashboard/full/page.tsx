'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { showToast } from '@/components/Toast'

interface DistItem { name: string; count: number }
interface TagItem { tag: string; count: number }

interface FullStats {
  section1: {
    all: { school: DistItem[]; grade: DistItem[]; path: DistItem[]; gender: DistItem[] }
    saengmyung: { school: DistItem[]; grade: DistItem[]; path: DistItem[]; gender: DistItem[] }
  }
  section2: {
    total_guests: number
    guest_attended: number
    guest_attendance_rate: number
    crew_conversion_count: number
    crew_conversion_rate: number
    total_saengmyung: number
  }
  section3: {
    total_responses: number
    would_return_count: number
    join_interest_count: number
    good_tags: TagItem[]
    bad_tags: TagItem[]
    responses: { good_points: string; bad_points: string }[]
  }
}

const COLORS = ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#a78bfa', '#c4b5fd']
const PIE_COLORS = ['#8b5cf6', '#34d399', '#f472b6', '#60a5fa']

function SimpleBarChart({ data, color = '#8b5cf6' }: { data: DistItem[]; color?: string }) {
  if (!data.length) return <p className="text-slate-500 text-sm">데이터 없음</p>
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }} />
        <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function SimplePieChart({ data }: { data: DistItem[] }) {
  if (!data.length) return <p className="text-slate-500 text-sm">데이터 없음</p>
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-3">{title}</h2>
      {children}
    </section>
  )
}

function TwoColChart({
  label,
  allData,
  smData,
  type = 'bar',
}: {
  label: string
  allData: DistItem[]
  smData: DistItem[]
  type?: 'bar' | 'pie'
}) {
  return (
    <div className="mb-6">
      <h3 className="text-slate-300 font-medium mb-3">{label}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-2">전체</p>
          {type === 'pie' ? <SimplePieChart data={allData} /> : <SimpleBarChart data={allData} />}
        </div>
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-2">생명만</p>
          {type === 'pie' ? <SimplePieChart data={smData} /> : <SimpleBarChart data={smData} color="#34d399" />}
        </div>
      </div>
    </div>
  )
}

export default function FullDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<FullStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/full-stats')
      if (res.status === 401) { router.push('/admin'); return }
      if (res.ok) setStats(await res.json())
    } catch {
      showToast('데이터를 불러올 수 없습니다', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">로딩 중...</p>
      </div>
    )
  }

  const s1 = stats?.section1
  const s2 = stats?.section2
  const s3 = stats?.section3

  return (
    <div className="min-h-screen bg-slate-900">
      {/* 헤더 */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">전체 분석</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-400 transition-colors"
          >
            새로고침
          </button>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-400 transition-colors"
          >
            ← 운영 대시보드
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 섹션 1: 오늘 행사 분석 */}
        <Section title="오늘 행사 분석">
          <p className="text-slate-500 text-sm mb-6">좌: 전체 출석자 기준 / 우: 생명(is_member=false)만 기준</p>
          {s1 ? (
            <>
              <TwoColChart label="학교별 분포" allData={s1.all.school} smData={s1.saengmyung.school} />
              <TwoColChart label="학년별 분포" allData={s1.all.grade} smData={s1.saengmyung.grade} />
              <TwoColChart label="알게 된 경로" allData={s1.all.path} smData={s1.saengmyung.path} />
              <TwoColChart label="성별 분포" allData={s1.all.gender} smData={s1.saengmyung.gender} type="pie" />
            </>
          ) : (
            <p className="text-slate-500">데이터 없음</p>
          )}
        </Section>

        {/* 섹션 2: 게스트 & 크루 전환 분석 */}
        <Section title="게스트 & 크루 전환 분석">
          {s2 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: '총 게스트 신청', value: `${s2.total_guests}명`, color: 'text-white' },
                { label: '게스트 참석률', value: `${s2.guest_attendance_rate}%`, color: 'text-green-400' },
                { label: '게스트 출석 인원', value: `${s2.guest_attended}명`, color: 'text-white' },
                { label: '크루 전환 수', value: `${s2.crew_conversion_count}명`, color: 'text-purple-400' },
                { label: '크루 전환율', value: `${s2.crew_conversion_rate}%`, color: 'text-purple-400' },
                { label: '누적 크루(생명)', value: `${s2.total_saengmyung}명`, color: 'text-white' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-800 rounded-xl p-5">
                  <p className="text-slate-400 text-sm">{label}</p>
                  <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">데이터 없음</p>
          )}
        </Section>

        {/* 섹션 3: 피드백 분석 */}
        <Section title="피드백 분석">
          {s3 ? (
            <>
              {/* 요약 카드 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800 rounded-xl p-5">
                  <p className="text-slate-400 text-sm">총 응답 수</p>
                  <p className="text-3xl font-bold text-white mt-1">{s3.total_responses}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-5">
                  <p className="text-slate-400 text-sm">재참여 희망</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">{s3.would_return_count}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-5">
                  <p className="text-slate-400 text-sm">가입 관심</p>
                  <p className="text-3xl font-bold text-purple-400 mt-1">{s3.join_interest_count}</p>
                </div>
              </div>

              {/* 태그 차트 */}
              {s3.good_tags.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-5 mb-4">
                  <h3 className="text-slate-300 font-medium mb-3">좋았던 점 태그</h3>
                  <SimpleBarChart data={s3.good_tags.map((t) => ({ name: t.tag, count: t.count }))} color="#34d399" />
                </div>
              )}
              {s3.bad_tags.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-5 mb-4">
                  <h3 className="text-slate-300 font-medium mb-3">아쉬운 점 태그</h3>
                  <SimpleBarChart data={s3.bad_tags.map((t) => ({ name: t.tag, count: t.count }))} color="#f87171" />
                </div>
              )}

              {/* 피드백 텍스트 카드 */}
              {s3.responses.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-5">
                  <h3 className="text-slate-300 font-medium mb-4">피드백 원문 ({s3.responses.length}개)</h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {s3.responses.map((r, i) => (
                      <div key={i} className="bg-slate-700 rounded-lg p-4 space-y-2">
                        {r.good_points && (
                          <div>
                            <span className="text-green-400 text-xs font-medium">좋았던 점</span>
                            <p className="text-slate-200 text-sm mt-0.5">{r.good_points}</p>
                          </div>
                        )}
                        {r.bad_points && (
                          <div>
                            <span className="text-red-400 text-xs font-medium">아쉬운 점</span>
                            <p className="text-slate-200 text-sm mt-0.5">{r.bad_points}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500">피드백 데이터 없음</p>
          )}
        </Section>
      </div>
    </div>
  )
}

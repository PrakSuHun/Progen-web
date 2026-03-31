'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/dashboard/StatCard'
import { FunnelChart } from '@/components/dashboard/FunnelChart'
import { SchoolChart } from '@/components/dashboard/SchoolChart'
import { GradeChart } from '@/components/dashboard/GradeChart'
import { PathChart } from '@/components/dashboard/PathChart'
import { DateChart } from '@/components/dashboard/DateChart'
import { FeedbackTagChart } from '@/components/dashboard/FeedbackTagChart'
import { MembersTable } from '@/components/dashboard/MembersTable'
import { showToast } from '@/components/Toast'

interface Stats {
  total_applicants: number
  total_attended: number
  attendance_rate: number
  feedback_responses: number
}

interface FunnelItem { label: string; value: number; color: string }
interface SchoolItem { school: string; 신청: number; 출석: number; 출석률: number }
interface GradeItem { grade: string; 신청: number; 출석: number; 출석률: number }
interface PathItem { path: string; count: number }
interface DateItem { date: string; 신청: number; 출석: number }
interface FeedbackStats {
  total: number
  would_return_count: number
  join_interest_count: number
  good_tags: { tag: string; count: number }[]
  bad_tags: { tag: string; count: number }[]
  responses: { good_points: string; bad_points: string }[]
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ total_applicants: 0, total_attended: 0, attendance_rate: 0, feedback_responses: 0 })
  const [funnel, setFunnel] = useState<FunnelItem[]>([])
  const [schoolData, setSchoolData] = useState<SchoolItem[]>([])
  const [gradeData, setGradeData] = useState<GradeItem[]>([])
  const [pathData, setPathData] = useState<PathItem[]>([])
  const [dateData, setDateData] = useState<DateItem[]>([])
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [statsRes, funnelRes, schoolRes, gradeRes, pathRes, dateRes, feedbackRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/funnel'),
        fetch('/api/admin/by-school'),
        fetch('/api/admin/by-grade'),
        fetch('/api/admin/by-path'),
        fetch('/api/admin/by-date'),
        fetch('/api/admin/feedback'),
      ])

      if (statsRes.status === 401) { router.push('/admin'); return }

      if (statsRes.ok) setStats(await statsRes.json())
      if (funnelRes.ok) { const d = await funnelRes.json(); setFunnel(d.data || []) }
      if (schoolRes.ok) { const d = await schoolRes.json(); setSchoolData(d.data || []) }
      if (gradeRes.ok) { const d = await gradeRes.json(); setGradeData(d.data || []) }
      if (pathRes.ok) { const d = await pathRes.json(); setPathData(d.data || []) }
      if (dateRes.ok) { const d = await dateRes.json(); setDateData(d.data || []) }
      if (feedbackRes.ok) setFeedbackStats(await feedbackRes.json())
    } catch {
      showToast('데이터를 불러올 수 없습니다', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  const handleExport = () => {
    window.location.href = '/api/admin/export'
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">로딩 중...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white">관리자 대시보드</h1>
            <p className="text-slate-400 mt-1">PROGEN 행사 통계 분석</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={fetchAll}>🔄 새로고침</Button>
            <Button variant="secondary" onClick={handleExport}>📥 CSV 내보내기</Button>
            <Button variant="secondary" onClick={handleLogout}>로그아웃</Button>
          </div>
        </div>

        {/* 핵심 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="총 신청자" value={stats.total_applicants} icon="👥" variant="primary" />
          <StatCard label="출석 인원" value={stats.total_attended} icon="✅" variant="success" />
          <StatCard label="출석률" value={`${stats.attendance_rate.toFixed(1)}%`} icon="📈" variant="secondary" />
          <StatCard label="피드백 응답" value={stats.feedback_responses} icon="💬" variant="danger" />
        </div>

        {/* 퍼널 차트 */}
        <div className="bg-slate-800 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">신청 → 출석 퍼널</h2>
          <FunnelChart data={funnel} />
        </div>

        {/* 학교 + 학년 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">대학별 분석</h2>
            <SchoolChart data={schoolData} />
          </div>
          <div className="bg-slate-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">학년별 분석</h2>
            <GradeChart data={gradeData} />
          </div>
        </div>

        {/* 경로 + 날짜 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">신청 경로 분석</h2>
            <PathChart data={pathData} />
          </div>
          <div className="bg-slate-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">신청 시기별 출석률</h2>
            <DateChart data={dateData} />
          </div>
        </div>

        {/* 피드백 분석 */}
        {feedbackStats && (
          <>
            <div className="bg-slate-800 p-6 rounded-xl mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">피드백 태그 분석</h2>
              <FeedbackTagChart
                goodTags={feedbackStats.good_tags}
                badTags={feedbackStats.bad_tags}
              />
            </div>
          </>
        )}

        {/* 출석 명단 */}
        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-white mb-4">신청자 명단</h2>
          <MembersTable />
        </div>
      </div>
    </main>
  )
}

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
import { FeedbackRadar } from '@/components/dashboard/FeedbackRadar'
import { FeedbackTagChart } from '@/components/dashboard/FeedbackTagChart'
import { MembersTable } from '@/components/dashboard/MembersTable'
import { showToast } from '@/components/Toast'

interface Stats {
  total_applicants: number
  total_attended: number
  attendance_rate: number
  feedback_responses: number
}

interface EventItem {
  id: string
  title: string
  event_date: string
  is_mandatory: boolean
  created_at: string
}

interface FunnelItem { label: string; value: number; color: string }
interface SchoolItem { school: string; 신청: number; 출석: number; 출석률: number }
interface GradeItem { grade: string; 신청: number; 출석: number; 출석률: number }
interface PathItem { path: string; count: number }
interface DateItem { date: string; 신청: number; 출석: number }
interface FeedbackStats {
  avg_overall: number; avg_content: number; avg_practice: number; avg_network: number
  good_tags: { tag: string; count: number }[]
  bad_tags: { tag: string; count: number }[]
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
  const [events, setEvents] = useState<EventItem[]>([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', event_date: '', is_mandatory: false })
  const [eventLoading, setEventLoading] = useState(false)

  useEffect(() => { fetchAll(); fetchEvents() }, [])

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

  const fetchEvents = async () => {
    const res = await fetch('/api/admin/events')
    if (res.ok) { const d = await res.json(); setEvents(d.data || []) }
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.event_date) return
    setEventLoading(true)
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      })
      if (res.ok) {
        showToast('이벤트가 생성되었습니다', 'success')
        setShowEventModal(false)
        setNewEvent({ title: '', event_date: '', is_mandatory: false })
        fetchEvents()
        fetchAll()
      } else {
        showToast('이벤트 생성 실패', 'error')
      }
    } finally {
      setEventLoading(false)
    }
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
            <Button variant="primary" onClick={() => setShowEventModal(true)}>➕ 이벤트 추가</Button>
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
              <h2 className="text-xl font-semibold text-white mb-4">만족도 레이더</h2>
              <FeedbackRadar
                score_overall={feedbackStats.avg_overall}
                score_content={feedbackStats.avg_content}
                score_practice={feedbackStats.avg_practice}
                score_network={feedbackStats.avg_network}
              />
            </div>

            <div className="bg-slate-800 p-6 rounded-xl mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">피드백 태그 분석</h2>
              <FeedbackTagChart
                goodTags={feedbackStats.good_tags}
                badTags={feedbackStats.bad_tags}
              />
            </div>
          </>
        )}

        {/* 이벤트 목록 */}
        <div className="bg-slate-800 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">이벤트 목록 <span className="text-sm text-purple-400 font-normal">(최신 이벤트가 자동 활성)</span></h2>
          {events.length === 0 ? (
            <p className="text-slate-400">이벤트가 없습니다. 추가해주세요.</p>
          ) : (
            <div className="space-y-2">
              {events.map((e, i) => (
                <div key={e.id} className={`flex items-center justify-between p-4 rounded-xl border ${i === 0 ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/5'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{e.title}</span>
                      {i === 0 && <span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">활성</span>}
                      {e.is_mandatory && <span className="text-xs px-2 py-0.5 bg-indigo-500/30 text-indigo-300 rounded-full">필수</span>}
                    </div>
                    <p className="text-slate-400 text-sm mt-0.5">{e.event_date ? new Date(e.event_date).toLocaleDateString('ko-KR') : '날짜 없음'}</p>
                  </div>
                  <p className="text-slate-500 text-xs font-mono">{e.id.slice(0, 8)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 출석 명단 */}
        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-white mb-4">신청자 명단</h2>
          <MembersTable />
        </div>
      </div>

      {/* 이벤트 추가 모달 */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-6">새 이벤트 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm mb-1 block">이벤트 제목 *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="예: PROGEN 1기 2회차 세미나"
                  className="w-full bg-slate-700 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1 block">날짜 *</label>
                <input
                  type="datetime-local"
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  className="w-full bg-slate-700 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEvent.is_mandatory}
                  onChange={(e) => setNewEvent({ ...newEvent, is_mandatory: e.target.checked })}
                  className="w-4 h-4 accent-purple-500"
                />
                <span className="text-slate-300 text-sm">필수 참석 이벤트</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowEventModal(false)} className="flex-1">취소</Button>
              <Button variant="primary" onClick={handleCreateEvent} disabled={eventLoading} className="flex-1">
                {eventLoading ? '생성 중...' : '생성하기'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

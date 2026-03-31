'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/dashboard/StatCard'
import { showToast } from '@/components/Toast'

interface Stats {
  total_applicants: number
  total_attended: number
  attendance_rate: number
  feedback_responses: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    total_applicants: 0,
    total_attended: 0,
    attendance_rate: 0,
    feedback_responses: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else if (response.status === 401) {
        router.push('/admin')
      }
    } catch (error) {
      showToast('통계를 불러올 수 없습니다', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin')
    } catch (error) {
      showToast('로그아웃 중 오류가 발생했습니다', 'error')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-white">로딩 중...</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">관리자 대시보드</h1>
          <Button variant="secondary" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            label="총 신청자"
            value={stats.total_applicants}
            icon="👥"
            variant="primary"
          />
          <StatCard
            label="출석 인원"
            value={stats.total_attended}
            icon="✅"
            variant="success"
          />
          <StatCard
            label="출석률"
            value={`${stats.attendance_rate.toFixed(1)}%`}
            icon="📈"
            variant="secondary"
          />
          <StatCard
            label="피드백 응답"
            value={stats.feedback_responses}
            icon="💬"
            variant="danger"
          />
        </div>

        {/* Analysis Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div
            className="bg-slate-800 p-6 rounded-lg cursor-pointer hover:bg-slate-750 transition"
            onClick={() => router.push('/admin/dashboard/full')}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  대학별 분석
                </h2>
                <p className="text-slate-400 text-sm">
                  대학별 신청자 분포 및 통계
                </p>
              </div>
              <span className="text-2xl">🏫</span>
            </div>
          </div>
          <div
            className="bg-slate-800 p-6 rounded-lg cursor-pointer hover:bg-slate-750 transition"
            onClick={() => router.push('/admin/dashboard/full')}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  학년별 분석
                </h2>
                <p className="text-slate-400 text-sm">
                  학년별 신청자 분포 및 통계
                </p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  피드백 요약
                </h2>
                <p className="text-slate-400 text-sm">
                  만족도 점수 및 주요 의견
                </p>
              </div>
              <span className="text-2xl">💬</span>
            </div>
          </div>
          <div
            className="bg-slate-800 p-6 rounded-lg cursor-pointer hover:bg-slate-750 transition"
            onClick={() => router.push('/admin/dashboard/full')}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  출석 명단
                </h2>
                <p className="text-slate-400 text-sm">
                  전체 신청자 및 출석 현황
                </p>
              </div>
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            주요 지표
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">신청 완료율</p>
              <p className="text-3xl font-bold text-purple-400">100%</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">평균 만족도</p>
              <p className="text-3xl font-bold text-green-400">4.2/5.0</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">가입 의향</p>
              <p className="text-3xl font-bold text-blue-400">68%</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" onClick={() => fetchStats()}>
            🔄 새로고침
          </Button>
          <Button variant="secondary">
            📥 CSV 내보내기
          </Button>
          <Button variant="secondary">
            📋 상세 분석 보기
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  )
}

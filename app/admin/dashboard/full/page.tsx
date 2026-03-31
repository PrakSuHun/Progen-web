'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/dashboard/StatCard'
import { MembersTable } from '@/components/dashboard/MembersTable'
import { showToast } from '@/components/Toast'

interface SchoolData {
  school: string
  count: number
}

interface GradeData {
  grade: string
  count: number
}

export default function FullDashboardPage() {
  const router = useRouter()
  const [schoolData, setSchoolData] = useState<SchoolData[]>([])
  const [gradeData, setGradeData] = useState<GradeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch school data
      const schoolRes = await fetch('/api/admin/by-school')
      if (schoolRes.ok) {
        const schoolJsonData = await schoolRes.json()
        setSchoolData(schoolJsonData.data || [])
      } else if (schoolRes.status === 401) {
        router.push('/admin')
        return
      }

      // Fetch grade data
      const gradeRes = await fetch('/api/admin/by-grade')
      if (gradeRes.ok) {
        const gradeJsonData = await gradeRes.json()
        setGradeData(gradeJsonData.data || [])
      }
    } catch (error) {
      showToast('데이터를 불러올 수 없습니다', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <p className="text-center text-white">로딩 중...</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">상세 분석</h1>
          <Button variant="secondary" onClick={() => router.back()}>
            돌아가기
          </Button>
        </div>

        {/* School Distribution */}
        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">대학별 분포</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {schoolData.map((school) => (
              <div key={school.school} className="bg-slate-700 p-4 rounded">
                <p className="text-slate-300 text-sm">{school.school}</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {school.count}명
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-slate-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">학년별 분포</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {gradeData.map((grade) => (
              <div key={grade.grade} className="bg-slate-700 p-4 rounded">
                <p className="text-slate-300 text-sm">{grade.grade}</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {grade.count}명
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Members Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            신청자 명단
          </h2>
          <MembersTable />
        </div>
      </div>

      <Footer />
    </main>
  )
}

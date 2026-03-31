'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/Toast'
import { formatPhone, isValidPhone } from '@/lib/constants'
import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

interface CheckInData {
  name: string
  phone: string
}

interface WalkInData extends CheckInData {
  school: string
  major: string
}

export default function CheckInPage() {
  const [checkInData, setCheckInData] = useState<CheckInData>({
    name: '',
    phone: '',
  })
  const [walkInData, setWalkInData] = useState<WalkInData>({
    name: '',
    phone: '',
    school: '',
    major: '',
  })
  const [loading, setLoading] = useState(false)
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateCheckIn = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!checkInData.name.trim()) newErrors.name = '이름을 입력해주세요'
    if (!isValidPhone(checkInData.phone)) newErrors.phone = '올바른 연락처를 입력해주세요'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateWalkIn = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!walkInData.name.trim()) newErrors.name = '이름을 입력해주세요'
    if (!isValidPhone(walkInData.phone)) newErrors.phone = '올바른 연락처를 입력해주세요'
    if (!walkInData.school.trim()) newErrors.school = '학교를 입력해주세요'
    if (!walkInData.major.trim()) newErrors.major = '전공을 입력해주세요'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCheckIn()) return

    setLoading(true)
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: checkInData.name,
          phone: formatPhone(checkInData.phone),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        showToast(`${data.name}님 출석 완료! 🎉`, 'success')
        setCheckInData({ name: '', phone: '' })
        setShowWalkIn(false)
        setTimeout(() => {
          // Auto-reset after 3 seconds
        }, 3000)
      } else if (response.status === 404) {
        setShowWalkIn(true)
        showToast('사전 신청 정보를 찾을 수 없습니다. 현장 등록을 진행해주세요.', 'info')
      } else {
        showToast('오류가 발생했습니다', 'error')
      }
    } catch (error) {
      showToast('오류가 발생했습니다', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleWalkIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateWalkIn()) return

    setLoading(true)
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: walkInData.name,
          phone: formatPhone(walkInData.phone),
          school: walkInData.school,
          major: walkInData.major,
          walkin: true,
        }),
      })

      if (response.ok) {
        showToast(`${walkInData.name}님 현장 등록 + 출석 완료! 🎉`, 'success')
        setWalkInData({ name: '', phone: '', school: '', major: '' })
        setShowWalkIn(false)
        setCheckInData({ name: '', phone: '' })
      } else {
        showToast('오류가 발생했습니다', 'error')
      }
    } catch (error) {
      showToast('오류가 발생했습니다', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">현장 출석체크</h1>

        {/* Check-in Form */}
        <form onSubmit={handleCheckIn} className="space-y-6 bg-slate-800 p-8 rounded-lg mb-8">
          <Input
            label="이름"
            type="text"
            placeholder="홍길동"
            value={checkInData.name}
            onChange={(e) => setCheckInData({ ...checkInData, name: e.target.value })}
            error={errors.name}
          />

          <Input
            label="연락처"
            type="tel"
            placeholder="010-1234-5678"
            value={checkInData.phone}
            onChange={(e) => setCheckInData({ ...checkInData, phone: e.target.value })}
            error={errors.phone}
            phoneFormat
          />

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? '확인 중...' : '출석체크'}
          </Button>
        </form>

        {/* Walk-in Form */}
        {showWalkIn && (
          <form onSubmit={handleWalkIn} className="space-y-6 bg-slate-700 p-8 rounded-lg animate-in slide-in-from-bottom-2">
            <h2 className="text-xl font-semibold text-white mb-4">현장 등록</h2>

            <Input
              label="이름"
              type="text"
              placeholder="홍길동"
              value={walkInData.name}
              onChange={(e) => setWalkInData({ ...walkInData, name: e.target.value })}
              error={errors.name}
            />

            <Input
              label="연락처"
              type="tel"
              placeholder="010-1234-5678"
              value={walkInData.phone}
              onChange={(e) => setWalkInData({ ...walkInData, phone: e.target.value })}
              error={errors.phone}
              phoneFormat
            />

            <Input
              label="학교"
              type="text"
              placeholder="서울대학교"
              value={walkInData.school}
              onChange={(e) => setWalkInData({ ...walkInData, school: e.target.value })}
              error={errors.school}
            />

            <Input
              label="전공"
              type="text"
              placeholder="컴퓨터과학"
              value={walkInData.major}
              onChange={(e) => setWalkInData({ ...walkInData, major: e.target.value })}
              error={errors.major}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowWalkIn(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? '등록 중...' : '현장 등록'}
              </Button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </main>
  )
}

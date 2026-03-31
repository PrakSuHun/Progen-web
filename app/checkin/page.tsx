'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/Modal'
import { showToast } from '@/components/Toast'
import {
  SCHOOLS,
  GRADES,
  PATHS,
  PROJECTS,
  GENDERS,
  formatPhone,
  isValidPhone,
} from '@/lib/constants'

interface CheckInData {
  name: string
  phone: string
  age: string
}

interface WalkInData {
  name: string
  phone: string
  age: string
  school: string
  grade: string
  major: string
  path: string
  project: string
  gender: string
  motivation: string
}

export default function CheckInPage() {
  const [checkInData, setCheckInData] = useState<CheckInData>({ name: '', phone: '', age: '' })
  const [walkInData, setWalkInData] = useState<WalkInData>({
    name: '', phone: '', age: '', school: '', grade: '',
    major: '', path: '', project: '', gender: '', motivation: '',
  })

  const [loading, setLoading] = useState(false)
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [checkedInName, setCheckedInName] = useState('')
  const [checkInErrors, setCheckInErrors] = useState<Partial<CheckInData>>({})
  const [walkInErrors, setWalkInErrors] = useState<Partial<WalkInData>>({})

  const validateCheckIn = (): boolean => {
    const errors: Partial<CheckInData> = {}
    if (!checkInData.name.trim()) errors.name = '이름을 입력해주세요'
    if (!isValidPhone(checkInData.phone)) errors.phone = '올바른 연락처를 입력해주세요'
    if (!checkInData.age.trim()) errors.age = '나이를 입력해주세요'
    setCheckInErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateWalkIn = (): boolean => {
    const errors: Partial<WalkInData> = {}
    if (!walkInData.name.trim()) errors.name = '이름을 입력해주세요'
    if (!isValidPhone(walkInData.phone)) errors.phone = '올바른 연락처를 입력해주세요'
    if (!walkInData.age.trim()) errors.age = '나이를 입력해주세요'
    if (!walkInData.school) errors.school = '학교를 선택해주세요'
    if (!walkInData.grade) errors.grade = '학년을 선택해주세요'
    if (!walkInData.major.trim()) errors.major = '전공을 입력해주세요'
    if (!walkInData.path) errors.path = '경로를 선택해주세요'
    if (!walkInData.project) errors.project = '프로젝트를 선택해주세요'
    if (!walkInData.gender) errors.gender = '성별을 선택해주세요'
    if (!walkInData.motivation.trim()) errors.motivation = '참여 동기를 입력해주세요'
    setWalkInErrors(errors)
    return Object.keys(errors).length === 0
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
          age: checkInData.age,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCheckedInName(data.name)
        setShowSuccess(true)
        setCheckInData({ name: '', phone: '', age: '' })
        setShowWalkIn(false)
      } else if (response.status === 404) {
        // 사전 신청 없음 → walk-in 폼으로
        setWalkInData({
          ...walkInData,
          name: checkInData.name,
          phone: checkInData.phone,
          age: checkInData.age,
        })
        setShowWalkIn(true)
      } else if (response.status === 409) {
        setCheckedInName(data.name || checkInData.name)
        setShowDuplicate(true)
      } else {
        showToast('오류가 발생했습니다', 'error')
      }
    } catch {
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
          age: walkInData.age,
          school: walkInData.school,
          grade: walkInData.grade,
          major: walkInData.major,
          path: walkInData.path,
          project: walkInData.project,
          gender: walkInData.gender,
          motivation: walkInData.motivation,
          walkin: true,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCheckedInName(data.name || walkInData.name)
        setShowSuccess(true)
        setWalkInData({
          name: '', phone: '', age: '', school: '', grade: '',
          major: '', path: '', project: '', gender: '', motivation: '',
        })
        setShowWalkIn(false)
        setCheckInData({ name: '', phone: '', age: '' })
      } else if (response.status === 409) {
        setCheckedInName(data.name || walkInData.name)
        setShowDuplicate(true)
      } else {
        showToast('오류가 발생했습니다', 'error')
      }
    } catch {
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

        {/* 사전 신청자 출석 폼 */}
        <form onSubmit={handleCheckIn} className="space-y-6 bg-slate-800 p-8 rounded-lg mb-8">
          <Input
            label="이름"
            placeholder="홍길동"
            value={checkInData.name}
            onChange={(e) => setCheckInData({ ...checkInData, name: e.target.value })}
            error={checkInErrors.name}
          />
          <Input
            label="연락처"
            placeholder="010-1234-5678"
            value={checkInData.phone}
            onChange={(e) => setCheckInData({ ...checkInData, phone: e.target.value })}
            error={checkInErrors.phone}
            phoneFormat
          />
          <Input
            label="나이"
            type="number"
            placeholder="20"
            value={checkInData.age}
            onChange={(e) => setCheckInData({ ...checkInData, age: e.target.value })}
            error={checkInErrors.age}
          />
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? '확인 중...' : '출석체크'}
          </Button>
        </form>

        {/* 현장 등록 (Walk-in) 폼 */}
        {showWalkIn && (
          <form onSubmit={handleWalkIn} className="space-y-6 bg-slate-700 p-8 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-white">현장 등록</h2>
              <button
                type="button"
                onClick={() => setShowWalkIn(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ← 취소
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              사전 신청 내역이 없어요. 아래 정보를 입력하면 바로 출석 처리됩니다.
            </p>

            <Input
              label="이름"
              placeholder="홍길동"
              value={walkInData.name}
              onChange={(e) => setWalkInData({ ...walkInData, name: e.target.value })}
              error={walkInErrors.name}
            />
            <Input
              label="연락처"
              placeholder="010-1234-5678"
              value={walkInData.phone}
              onChange={(e) => setWalkInData({ ...walkInData, phone: e.target.value })}
              error={walkInErrors.phone}
              phoneFormat
            />
            <Select
              label="학교"
              options={SCHOOLS}
              value={walkInData.school}
              onChange={(e) => setWalkInData({ ...walkInData, school: e.target.value })}
              error={walkInErrors.school}
            />
            <Select
              label="학년"
              options={GRADES}
              value={walkInData.grade}
              onChange={(e) => setWalkInData({ ...walkInData, grade: e.target.value })}
              error={walkInErrors.grade}
            />
            <Input
              label="나이"
              type="number"
              placeholder="20"
              value={walkInData.age}
              onChange={(e) => setWalkInData({ ...walkInData, age: e.target.value })}
              error={walkInErrors.age}
            />
            <Input
              label="전공"
              placeholder="컴퓨터과학"
              value={walkInData.major}
              onChange={(e) => setWalkInData({ ...walkInData, major: e.target.value })}
              error={walkInErrors.major}
            />
            <Select
              label="우리를 알게 된 경로"
              options={PATHS}
              value={walkInData.path}
              onChange={(e) => setWalkInData({ ...walkInData, path: e.target.value })}
              error={walkInErrors.path}
            />
            <Select
              label="관심 프로젝트"
              options={PROJECTS}
              value={walkInData.project}
              onChange={(e) => setWalkInData({ ...walkInData, project: e.target.value })}
              error={walkInErrors.project}
            />
            <Select
              label="성별"
              options={GENDERS}
              value={walkInData.gender}
              onChange={(e) => setWalkInData({ ...walkInData, gender: e.target.value })}
              error={walkInErrors.gender}
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">참여 동기</label>
              <textarea
                placeholder="이번 행사에 참여하는 이유를 알려주세요"
                value={walkInData.motivation}
                onChange={(e) => setWalkInData({ ...walkInData, motivation: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 transition h-32"
              />
              {walkInErrors.motivation && (
                <p className="text-red-400 text-sm mt-1">{walkInErrors.motivation}</p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? '등록 중...' : '현장 등록 및 출석'}
            </Button>
          </form>
        )}
      </div>

      {/* 출석 완료 Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="출석 완료 🎉"
      >
        <p className="text-slate-300 mb-6">
          <span className="text-white font-semibold">{checkedInName}</span>님 출석이 확인됐습니다!
        </p>
        <button
          onClick={() => setShowSuccess(false)}
          className="block w-full text-center bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          확인
        </button>
      </Modal>

      {/* 중복 출석 Modal */}
      <Modal
        isOpen={showDuplicate}
        onClose={() => setShowDuplicate(false)}
        title="이미 출석하셨어요"
      >
        <p className="text-slate-300 mb-2">
          <span className="text-white font-semibold">{checkedInName}</span>님은 이미 출석 처리되었습니다.
        </p>
        <p className="text-slate-400 text-sm mb-6">문제가 있으시면 운영진에게 문의해주세요.</p>
        <button
          onClick={() => setShowDuplicate(false)}
          className="block w-full text-center bg-slate-600 hover:bg-slate-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          확인
        </button>
      </Modal>

      <Footer />
    </main>
  )
}

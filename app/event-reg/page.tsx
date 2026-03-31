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

type UserMode = 'crew' | 'guest' | null

interface CrewFormData {
  name: string
  phone: string
  age: string
}

interface GuestFormData {
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

export default function EventRegPage() {
  const [mode, setMode] = useState<UserMode>(null)

  const [crewForm, setCrewForm] = useState<CrewFormData>({ name: '', phone: '', age: '' })
  const [guestForm, setGuestForm] = useState<GuestFormData>({
    name: '', phone: '', age: '', school: '', grade: '',
    major: '', path: '', project: '', gender: '', motivation: '',
  })

  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [crewErrors, setCrewErrors] = useState<Partial<CrewFormData>>({})
  const [guestErrors, setGuestErrors] = useState<Partial<GuestFormData>>({})

  const validateCrew = (): boolean => {
    const errors: Partial<CrewFormData> = {}
    if (!crewForm.name.trim()) errors.name = '이름을 입력해주세요'
    if (!isValidPhone(crewForm.phone)) errors.phone = '올바른 연락처를 입력해주세요'
    if (!crewForm.age.trim()) errors.age = '나이를 입력해주세요'
    setCrewErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateGuest = (): boolean => {
    const errors: Partial<GuestFormData> = {}
    if (!guestForm.name.trim()) errors.name = '이름을 입력해주세요'
    if (!isValidPhone(guestForm.phone)) errors.phone = '올바른 연락처를 입력해주세요'
    if (!guestForm.age.trim()) errors.age = '나이를 입력해주세요'
    if (!guestForm.school) errors.school = '학교를 선택해주세요'
    if (!guestForm.grade) errors.grade = '학년을 선택해주세요'
    if (!guestForm.major.trim()) errors.major = '전공을 입력해주세요'
    if (!guestForm.path) errors.path = '경로를 선택해주세요'
    if (!guestForm.project) errors.project = '프로젝트를 선택해주세요'
    if (!guestForm.gender) errors.gender = '성별을 선택해주세요'
    if (!guestForm.motivation.trim()) errors.motivation = '참여 동기를 입력해주세요'
    setGuestErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = mode === 'crew' ? validateCrew() : validateGuest()
    if (!isValid) {
      showToast('필수 입력 항목을 확인해주세요', 'error')
      return
    }

    setLoading(true)

    try {
      const body =
        mode === 'crew'
          ? { mode, name: crewForm.name, phone: formatPhone(crewForm.phone), age: crewForm.age }
          : {
              mode,
              name: guestForm.name,
              phone: formatPhone(guestForm.phone),
              age: guestForm.age,
              school: guestForm.school,
              grade: guestForm.grade,
              major: guestForm.major,
              path: guestForm.path,
              project: guestForm.project,
              gender: guestForm.gender,
              motivation: guestForm.motivation,
            }

      const response = await fetch('/api/event-reg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        setShowSuccess(true)
      } else if (response.status === 404) {
        showToast('크루 정보를 찾을 수 없습니다. 먼저 지원해주세요.', 'error')
      } else if (response.status === 409) {
        setShowDuplicate(true)
      } else {
        showToast(data.message || '신청 중 오류가 발생했습니다', 'error')
      }
    } catch {
      showToast('오류가 발생했습니다. 다시 시도해주세요', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetForms = () => {
    setCrewForm({ name: '', phone: '', age: '' })
    setGuestForm({
      name: '', phone: '', age: '', school: '', grade: '',
      major: '', path: '', project: '', gender: '', motivation: '',
    })
    setCrewErrors({})
    setGuestErrors({})
  }

  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">행사 사전 신청</h1>

        {/* Mode Selection Modal */}
        <Modal isOpen={mode === null} onClose={() => {}} title="신청 유형 선택">
          <p className="text-slate-300 mb-6">신청 유형을 선택해주세요</p>
          <div className="flex gap-4">
            <Button variant="primary" onClick={() => setMode('crew')} className="flex-1">
              크루
            </Button>
            <Button variant="secondary" onClick={() => setMode('guest')} className="flex-1">
              게스트
            </Button>
          </div>
        </Modal>

        {/* Form */}
        {mode !== null && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-8 rounded-lg">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => { setMode(null); resetForms() }}
                className="text-slate-400 hover:text-white text-sm"
              >
                ← 유형 변경
              </button>
            </div>

            {/* 크루: 간소화 폼 */}
            {mode === 'crew' && (
              <>
                <Input
                  label="이름"
                  placeholder="홍길동"
                  value={crewForm.name}
                  onChange={(e) => setCrewForm({ ...crewForm, name: e.target.value })}
                  error={crewErrors.name}
                />
                <Input
                  label="연락처"
                  placeholder="010-1234-5678"
                  value={crewForm.phone}
                  onChange={(e) => setCrewForm({ ...crewForm, phone: e.target.value })}
                  error={crewErrors.phone}
                  phoneFormat
                />
                <Input
                  label="나이"
                  type="number"
                  placeholder="20"
                  value={crewForm.age}
                  onChange={(e) => setCrewForm({ ...crewForm, age: e.target.value })}
                  error={crewErrors.age}
                />
              </>
            )}

            {/* 게스트: 지원서와 동일한 전체 폼 */}
            {mode === 'guest' && (
              <>
                <Input
                  label="이름"
                  placeholder="홍길동"
                  value={guestForm.name}
                  onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                  error={guestErrors.name}
                />
                <Input
                  label="연락처"
                  placeholder="010-1234-5678"
                  value={guestForm.phone}
                  onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                  error={guestErrors.phone}
                  phoneFormat
                />
                <Select
                  label="학교"
                  options={SCHOOLS}
                  value={guestForm.school}
                  onChange={(e) => setGuestForm({ ...guestForm, school: e.target.value })}
                  error={guestErrors.school}
                />
                <Select
                  label="학년"
                  options={GRADES}
                  value={guestForm.grade}
                  onChange={(e) => setGuestForm({ ...guestForm, grade: e.target.value })}
                  error={guestErrors.grade}
                />
                <Input
                  label="나이"
                  type="number"
                  placeholder="20"
                  value={guestForm.age}
                  onChange={(e) => setGuestForm({ ...guestForm, age: e.target.value })}
                  error={guestErrors.age}
                />
                <Input
                  label="전공"
                  placeholder="컴퓨터과학"
                  value={guestForm.major}
                  onChange={(e) => setGuestForm({ ...guestForm, major: e.target.value })}
                  error={guestErrors.major}
                />
                <Select
                  label="우리를 알게 된 경로"
                  options={PATHS}
                  value={guestForm.path}
                  onChange={(e) => setGuestForm({ ...guestForm, path: e.target.value })}
                  error={guestErrors.path}
                />
                <Select
                  label="관심 프로젝트"
                  options={PROJECTS}
                  value={guestForm.project}
                  onChange={(e) => setGuestForm({ ...guestForm, project: e.target.value })}
                  error={guestErrors.project}
                />
                <Select
                  label="성별"
                  options={GENDERS}
                  value={guestForm.gender}
                  onChange={(e) => setGuestForm({ ...guestForm, gender: e.target.value })}
                  error={guestErrors.gender}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    참여 동기
                  </label>
                  <textarea
                    placeholder="이번 행사에 참여하는 이유를 알려주세요"
                    value={guestForm.motivation}
                    onChange={(e) => setGuestForm({ ...guestForm, motivation: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 transition h-32"
                  />
                  {guestErrors.motivation && (
                    <p className="text-red-400 text-sm mt-1">{guestErrors.motivation}</p>
                  )}
                </div>
              </>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? '신청 중...' : '신청하기'}
            </Button>
          </form>
        )}
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          setMode(null)
          resetForms()
        }}
        title="신청 완료 🎉"
      >
        <p className="text-slate-300 mb-2">사전 신청이 완료되었습니다!</p>
        <p className="text-slate-400 text-sm mb-6">
          행사 당일 현장에서 이름과 연락처로 출석체크를 진행해주세요.
        </p>
        <button
          onClick={() => {
            setShowSuccess(false)
            setMode(null)
            resetForms()
          }}
          className="block w-full text-center bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          확인
        </button>
      </Modal>

      {/* Duplicate Modal */}
      <Modal
        isOpen={showDuplicate}
        onClose={() => setShowDuplicate(false)}
        title="이미 신청하셨어요"
      >
        <p className="text-slate-300 mb-2">이미 이번 행사에 신청하셨어요.</p>
        <p className="text-slate-400 text-sm mb-6">
          문제가 있으시면 아래 버튼으로 문의해주세요.
        </p>
        <a
          href="https://open.kakao.com/o/sQqCopki"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors mb-3"
        >
          문의하기
        </a>
        <button
          onClick={() => setShowDuplicate(false)}
          className="block w-full text-center text-slate-400 hover:text-white text-sm transition-colors"
        >
          닫기
        </button>
      </Modal>

      <Footer />
    </main>
  )
}

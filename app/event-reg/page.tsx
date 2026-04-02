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
  SCHOOLS, GRADES, PATHS, GENDERS,
  formatPhone, isValidPhone,
} from '@/lib/constants'

type UserMode = 'crew' | 'guest' | null

interface CrewFormData { name: string; phone: string; age: string }
interface GuestFormData {
  name: string; phone: string; age: string; school: string; grade: string
  major: string; path: string; gender: string
}

export default function EventRegPage() {
  const [mode, setMode] = useState<UserMode>(null)
  const [crewForm, setCrewForm] = useState<CrewFormData>({ name: '', phone: '', age: '' })
  const [guestForm, setGuestForm] = useState<GuestFormData>({
    name: '', phone: '', age: '', school: '', grade: '',
    major: '', path: '', gender: '',
  })
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [crewErrors, setCrewErrors] = useState<Partial<CrewFormData>>({})
  const [guestErrors, setGuestErrors] = useState<Partial<GuestFormData>>({})

  const validateCrew = (): boolean => {
    const e: Partial<CrewFormData> = {}
    if (!crewForm.name.trim()) e.name = '이름을 입력해주세요'
    if (!isValidPhone(crewForm.phone)) e.phone = '올바른 연락처를 입력해주세요'
    if (!crewForm.age.trim()) e.age = '나이를 입력해주세요'
    setCrewErrors(e); return Object.keys(e).length === 0
  }

  const validateGuest = (): boolean => {
    const e: Partial<GuestFormData> = {}
    if (!guestForm.name.trim()) e.name = '이름을 입력해주세요'
    if (!isValidPhone(guestForm.phone)) e.phone = '올바른 연락처를 입력해주세요'
    if (!guestForm.age.trim()) e.age = '나이를 입력해주세요'
    if (!guestForm.school) e.school = '학교를 선택해주세요'
    if (!guestForm.grade) e.grade = '학년을 선택해주세요'
    if (!guestForm.major.trim()) e.major = '전공을 입력해주세요'
    if (!guestForm.path) e.path = '경로를 선택해주세요'
    if (!guestForm.gender) e.gender = '성별을 선택해주세요'
    setGuestErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = mode === 'crew' ? validateCrew() : validateGuest()
    if (!isValid) { showToast('필수 입력 항목을 확인해주세요', 'error'); return }
    setLoading(true)
    try {
      const body = mode === 'crew'
        ? { mode, name: crewForm.name, phone: formatPhone(crewForm.phone), age: crewForm.age }
        : { mode, ...guestForm, phone: formatPhone(guestForm.phone) }
      const response = await fetch('/api/event-reg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      if (response.ok) setShowSuccess(true)
      else if (response.status === 404) showToast('크루 정보를 찾을 수 없습니다. 먼저 지원해주세요.', 'error')
      else if (response.status === 409) setShowDuplicate(true)
      else showToast(data.message || '신청 중 오류가 발생했습니다', 'error')
    } catch { showToast('오류가 발생했습니다. 다시 시도해주세요', 'error') }
    finally { setLoading(false) }
  }

  const resetForms = () => {
    setCrewForm({ name: '', phone: '', age: '' })
    setGuestForm({ name: '', phone: '', age: '', school: '', grade: '', major: '', path: '', gender: '' })
    setCrewErrors({}); setGuestErrors({})
  }

  const setCrew = (key: keyof CrewFormData, val: string) => setCrewForm({ ...crewForm, [key]: val })
  const setGuest = (key: keyof GuestFormData, val: string) => setGuestForm({ ...guestForm, [key]: val })

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="pt-20 md:pt-24 pb-16 px-5 lg:px-8">
        <div className="max-w-lg mx-auto">

          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
            Event Registration
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-black mb-2">행사 사전 신청</h1>
          <p className="text-[#888] text-sm mb-8">크루 또는 비회원으로 사전 신청하세요</p>

          {/* Mode Selection */}
          <Modal isOpen={mode === null} onClose={() => {}} title="신청 유형 선택">
            <p className="text-[#555] mb-6">신청 유형을 선택해주세요</p>
            <div className="flex gap-3">
              <button onClick={() => setMode('crew')} className="flex-1 py-3 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-full transition-colors">크루</button>
              <button onClick={() => setMode('guest')} className="flex-1 py-3 bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#333] font-bold rounded-full border border-[#e0e0e0] transition-colors">비회원</button>
            </div>
          </Modal>

          {mode !== null && (
            <form onSubmit={handleSubmit} className="bg-white border border-[#eee] rounded-2xl p-5 md:p-8 space-y-5">
              <button type="button" onClick={() => { setMode(null); resetForms() }} className="text-[#999] hover:text-violet-500 text-sm transition-colors">
                ← 유형 변경
              </button>

              {mode === 'crew' && (
                <>
                  <Input label="이름" placeholder="홍길동" value={crewForm.name} onChange={(e) => setCrew('name', e.target.value)} error={crewErrors.name} />
                  <Input label="연락처" placeholder="010-1234-5678" value={crewForm.phone} onChange={(e) => setCrew('phone', e.target.value)} error={crewErrors.phone} phoneFormat />
                  <Input label="나이" type="number" placeholder="20" value={crewForm.age} onChange={(e) => setCrew('age', e.target.value)} error={crewErrors.age} />
                </>
              )}

              {mode === 'guest' && (
                <>
                  <Input label="이름" placeholder="홍길동" value={guestForm.name} onChange={(e) => setGuest('name', e.target.value)} error={guestErrors.name} />
                  <Select label="성별" options={GENDERS} value={guestForm.gender} onChange={(e) => setGuest('gender', e.target.value)} error={guestErrors.gender} />
                  <Input label="연락처" placeholder="010-1234-5678" value={guestForm.phone} onChange={(e) => setGuest('phone', e.target.value)} error={guestErrors.phone} phoneFormat />
                  <Input label="나이" type="number" placeholder="20" value={guestForm.age} onChange={(e) => setGuest('age', e.target.value)} error={guestErrors.age} />
                  <Select label="학교" options={SCHOOLS} value={guestForm.school} onChange={(e) => setGuest('school', e.target.value)} error={guestErrors.school} />
                  <Select label="학년" options={GRADES} value={guestForm.grade} onChange={(e) => setGuest('grade', e.target.value)} error={guestErrors.grade} />
                  <Input label="전공" placeholder="컴퓨터과학" value={guestForm.major} onChange={(e) => setGuest('major', e.target.value)} error={guestErrors.major} />
                  <Select label="우리를 알게 된 경로" options={PATHS} value={guestForm.path} onChange={(e) => setGuest('path', e.target.value)} error={guestErrors.path} />
                </>
              )}

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? '신청 중...' : '신청하기'}
              </Button>
            </form>
          )}
        </div>
      </div>

      <Modal isOpen={showSuccess} onClose={() => { setShowSuccess(false); setMode(null); resetForms() }} title="신청 완료!">
        <p className="text-[#333] mb-1">사전 신청이 완료되었습니다!</p>
        <p className="text-[#888] text-sm mb-5">행사 당일 현장에서 이름과 연락처로 출석체크를 진행해주세요.</p>
        <button onClick={() => { setShowSuccess(false); setMode(null); resetForms() }}
          className="block w-full text-center bg-violet-500 hover:bg-violet-600 text-white font-bold px-6 py-3 rounded-full transition-colors">확인</button>
      </Modal>

      <Modal isOpen={showDuplicate} onClose={() => setShowDuplicate(false)} title="이미 신청하셨어요">
        <p className="text-[#333] mb-1">이미 이번 행사에 신청하셨어요.</p>
        <p className="text-[#888] text-sm mb-5">문제가 있으시면 아래 버튼으로 문의해주세요.</p>
        <a href="https://open.kakao.com/o/sQqCopki" target="_blank" rel="noopener noreferrer"
          className="block w-full text-center bg-violet-500 hover:bg-violet-600 text-white font-bold px-6 py-3 rounded-full transition-colors mb-3">문의하기</a>
        <button onClick={() => setShowDuplicate(false)} className="block w-full text-center text-[#999] hover:text-black text-sm transition-colors">닫기</button>
      </Modal>

      <Footer />
    </main>
  )
}

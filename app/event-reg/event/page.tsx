'use client'

// 이벤트 전용 신청 폼 — 게스트 폼에서 보증금(안내·환불계좌)만 뺀 버전.
// kind:'event'로 제출되어 is_event=true 행사(getActivePromoEventId)에만 연결된다.
import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/Modal'
import { showToast } from '@/components/Toast'
import { SpotlightBackground } from '@/components/SpotlightBackground'
import {
  SCHOOLS, GRADES, PATHS, GENDERS,
  formatPhone, formatStudentNumber, isValidPhone, isValidStudentNumber,
} from '@/lib/constants'

interface EventFormData {
  name: string; phone: string; age: string; school: string; grade: string
  major: string; path: string; gender: string; student_number: string; companion: string
}

export default function EventRegEventPage() {
  const [form, setForm] = useState<EventFormData>({
    name: '', phone: '', age: '', school: '', grade: '',
    major: '', path: '', gender: '', student_number: '', companion: '',
  })
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [errors, setErrors] = useState<Partial<EventFormData>>({})

  const validate = (): boolean => {
    const e: Partial<EventFormData> = {}
    if (!form.name.trim()) e.name = '이름을 입력해주세요'
    if (!isValidPhone(form.phone)) e.phone = '올바른 연락처를 입력해주세요'
    if (!form.age.trim()) e.age = '나이를 입력해주세요'
    if (!form.school) e.school = '학교를 선택해주세요'
    if (!form.grade) e.grade = '학년을 선택해주세요'
    if (!isValidStudentNumber(form.student_number)) e.student_number = '학번을 숫자 6~12자리로 입력해주세요'
    if (!form.major.trim()) e.major = '전공을 입력해주세요'
    if (!form.path) e.path = '경로를 선택해주세요'
    if (!form.gender) e.gender = '성별을 선택해주세요'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.name.trim() === '테스트') { setShowSuccess(true); return }
    if (form.name.trim() === '테스트1') { setShowDuplicate(true); return }
    if (!validate()) { showToast('필수 입력 항목을 확인해주세요', 'error'); return }
    setLoading(true)
    try {
      const response = await fetch('/api/event-reg', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'guest', kind: 'event', ...form, phone: formatPhone(form.phone) }),
      })
      const data = await response.json()
      if (response.ok) setShowSuccess(true)
      else if (response.status === 409) setShowDuplicate(true)
      else showToast(data.message || '신청 중 오류가 발생했습니다', 'error')
    } catch { showToast('오류가 발생했습니다. 다시 시도해주세요', 'error') }
    finally { setLoading(false) }
  }

  const set = (key: keyof EventFormData, val: string) => setForm({ ...form, [key]: val })
  const reset = () => {
    setForm({ name: '', phone: '', age: '', school: '', grade: '', major: '', path: '', gender: '', student_number: '', companion: '' })
    setErrors({})
  }

  return (
    <main className="min-h-screen">
      <SpotlightBackground variant="page">
      <Navbar />
      <div className="pt-20 md:pt-24 pb-16 px-4 sm:px-5 lg:px-8">
        <div className="max-w-lg mx-auto">

          <div className="inline-flex items-center gap-2 mb-4 md:mb-5 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
            Event Registration
          </div>
          <h1 className="text-[26px] sm:text-3xl md:text-4xl font-black text-black mb-2 break-keep">이벤트 신청</h1>
          <p className="text-[#888] text-sm mb-5 break-keep">이벤트에 참여하시는 분의 정보를 입력해주세요</p>

          <form onSubmit={handleSubmit} className="bg-white border border-[#eee] rounded-2xl p-4 sm:p-5 md:p-8 space-y-5">
            <Input label="이름" placeholder="홍길동" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            <Select label="성별" options={GENDERS} value={form.gender} onChange={(e) => set('gender', e.target.value)} error={errors.gender} />
            <Input label="연락처" placeholder="010-1234-5678" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} phoneFormat />
            <Input label={<>나이 <span className="text-[#aaa] text-xs font-normal">*2007년생 기준 20살</span></>} type="number" placeholder="20" value={form.age} onChange={(e) => set('age', e.target.value)} error={errors.age} />
            <Select label="학교" options={SCHOOLS} value={form.school} onChange={(e) => set('school', e.target.value)} error={errors.school} />
            <Select label="학년" options={GRADES} value={form.grade} onChange={(e) => set('grade', e.target.value)} error={errors.grade} />
            <Input
              label="학번"
              placeholder="202600178"
              inputMode="numeric"
              autoComplete="off"
              value={form.student_number}
              onChange={(e) => set('student_number', formatStudentNumber(e.target.value))}
              error={errors.student_number}
            />
            <Input label="전공" placeholder="컴퓨터과학" value={form.major} onChange={(e) => set('major', e.target.value)} error={errors.major} />
            <Select label="참여 경로" options={PATHS} value={form.path} onChange={(e) => set('path', e.target.value)} error={errors.path} />

            <Input
              label={<>같이 오는 분 <span className="text-[#aaa] text-xs font-normal">(선택)</span></>}
              placeholder="예) 김철수, 이영희"
              value={form.companion}
              onChange={(e) => set('companion', e.target.value)}
            />

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? '신청 중...' : '신청하기'}
            </Button>
          </form>
        </div>
      </div>

      <Modal isOpen={showSuccess} onClose={() => { setShowSuccess(false); reset() }} title="신청 완료!">
        <p className="text-[#333] mb-1 break-keep">이벤트 신청이 완료되었습니다!</p>
        <p className="text-[#888] text-sm mb-5 break-keep">자세한 안내는 추후 연락드릴게요. 문의사항은 아래 오픈채팅으로 남겨주세요.</p>
        <a href="https://open.kakao.com/o/sQqCopki" target="_blank" rel="noopener noreferrer"
          className="block w-full text-center bg-white hover:bg-violet-50 border border-violet-200 text-violet-600 font-bold px-4 py-2.5 rounded-full text-sm transition-colors mb-3">
          문의하기 (오픈채팅)
        </a>
        <button onClick={() => { setShowSuccess(false); reset() }}
          className="block w-full text-center bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-full transition-colors">확인</button>
      </Modal>

      <Modal isOpen={showDuplicate} onClose={() => setShowDuplicate(false)} title="이미 신청하셨어요">
        <p className="text-[#333] mb-1">이미 이번 이벤트에 신청하셨어요.</p>
        <p className="text-[#888] text-sm mb-5">문제가 있으시면 아래 버튼으로 문의해주세요.</p>
        <a href="https://open.kakao.com/o/sQqCopki" target="_blank" rel="noopener noreferrer"
          className="block w-full text-center bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-full transition-colors mb-3">문의하기</a>
        <button onClick={() => setShowDuplicate(false)} className="block w-full text-center text-[#999] hover:text-black text-sm transition-colors">닫기</button>
      </Modal>

      <Footer />
      </SpotlightBackground>
    </main>
  )
}

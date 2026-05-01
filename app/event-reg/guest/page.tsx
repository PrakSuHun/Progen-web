'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  formatPhone, isValidPhone,
} from '@/lib/constants'

interface GuestFormData {
  name: string; phone: string; age: string; school: string; grade: string
  major: string; path: string; gender: string
}

export default function EventRegGuestPage() {
  const [form, setForm] = useState<GuestFormData>({
    name: '', phone: '', age: '', school: '', grade: '',
    major: '', path: '', gender: '',
  })
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [errors, setErrors] = useState<Partial<GuestFormData>>({})

  const validate = (): boolean => {
    const e: Partial<GuestFormData> = {}
    if (!form.name.trim()) e.name = '이름을 입력해주세요'
    if (!isValidPhone(form.phone)) e.phone = '올바른 연락처를 입력해주세요'
    if (!form.age.trim()) e.age = '나이를 입력해주세요'
    if (!form.school) e.school = '학교를 선택해주세요'
    if (!form.grade) e.grade = '학년을 선택해주세요'
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
        body: JSON.stringify({ mode: 'guest', ...form, phone: formatPhone(form.phone) }),
      })
      const data = await response.json()
      if (response.ok) setShowSuccess(true)
      else if (response.status === 409) setShowDuplicate(true)
      else showToast(data.message || '신청 중 오류가 발생했습니다', 'error')
    } catch { showToast('오류가 발생했습니다. 다시 시도해주세요', 'error') }
    finally { setLoading(false) }
  }

  const set = (key: keyof GuestFormData, val: string) => setForm({ ...form, [key]: val })
  const reset = () => {
    setForm({ name: '', phone: '', age: '', school: '', grade: '', major: '', path: '', gender: '' })
    setErrors({})
  }

  return (
    <main className="min-h-screen">
      <SpotlightBackground variant="page">
      <Navbar />
      <div className="pt-20 md:pt-24 pb-16 px-5 lg:px-8">
        <div className="max-w-lg mx-auto">

          <Link href="/event-reg" className="inline-flex items-center gap-1 text-[#999] hover:text-sky-500 text-sm transition-colors mb-4">
            ← 유형 변경
          </Link>

          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-500 text-[11px] font-bold tracking-wider uppercase">
            Guest · Event Registration
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-black mb-2">비회원 사전 신청</h1>
          <p className="text-[#888] text-sm mb-5">행사에 참여하시는 분의 정보를 입력해주세요</p>

          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0">!</div>
              <div className="flex-1">
                <p className="text-amber-900 font-bold text-sm mb-1">노쇼 방지 보증금 5,000원</p>
                <p className="text-amber-800 text-xs leading-relaxed">
                  비회원(게스트) 신청 시 노쇼 방지를 위해 보증금 5,000원이 부과됩니다.
                  <br />행사에 참석하시면 <span className="font-bold">전액 환불</span>되며, 무단 불참 시 환불되지 않습니다.
                  <br />입금 안내는 신청 완료 후 화면에서 확인하실 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-[#eee] rounded-2xl p-5 md:p-8 space-y-5">
            <Input label="이름" placeholder="홍길동" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            <Select label="성별" options={GENDERS} value={form.gender} onChange={(e) => set('gender', e.target.value)} error={errors.gender} />
            <Input label="연락처" placeholder="010-1234-5678" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} phoneFormat />
            <Input label={<>나이 <span className="text-[#aaa] text-xs font-normal">*2007년생 기준 20살</span></>} type="number" placeholder="20" value={form.age} onChange={(e) => set('age', e.target.value)} error={errors.age} />
            <Select label="학교" options={SCHOOLS} value={form.school} onChange={(e) => set('school', e.target.value)} error={errors.school} />
            <Select label="학년" options={GRADES} value={form.grade} onChange={(e) => set('grade', e.target.value)} error={errors.grade} />
            <Input label="전공" placeholder="컴퓨터과학" value={form.major} onChange={(e) => set('major', e.target.value)} error={errors.major} />
            <Select label="행사 참여 경로" options={PATHS} value={form.path} onChange={(e) => set('path', e.target.value)} error={errors.path} />

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? '신청 중...' : '신청하기'}
            </Button>
          </form>

          <p className="text-center text-[#aaa] text-xs mt-6">
            크루이신가요? <Link href="/event-reg/crew" className="text-sky-500 hover:text-sky-600 underline">크루로 신청</Link>
          </p>
        </div>
      </div>

      <Modal isOpen={showSuccess} onClose={() => { setShowSuccess(false); reset() }} title="신청 완료!">
        <p className="text-[#333] mb-1">사전 신청이 완료되었습니다!</p>
        <p className="text-[#888] text-sm mb-4">행사 당일 현장에서 이름과 연락처로 출석체크를 진행해주세요.</p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <p className="text-amber-900 font-bold text-sm mb-2">노쇼 방지 보증금 입금 안내</p>
          <p className="text-amber-800 text-xs leading-relaxed mb-3">
            아래 계좌로 <span className="font-bold">5,000원</span>을 입금해주세요.
            <br />입금자명은 <span className="font-bold">신청자 본인 이름</span>으로 부탁드립니다.
            <br />행사 참석 시 <span className="font-bold">전액 환불</span>되며, 무단 불참 시 환불되지 않습니다.
          </p>
          <div className="bg-white border border-amber-200 rounded-lg p-3 text-xs text-[#333] mb-2">
            <p className="text-[#888] text-[10px] mb-1">입금 계좌</p>
            <p className="font-bold text-sm mb-0.5">하나은행 660-910011-22904</p>
            <p className="text-[#666]">예금주: 프로젠(ProGen)</p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText('660-910011-22904')
              showToast('계좌번호가 복사되었습니다', 'success')
            }}
            className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-full text-sm transition-colors mb-2">
            계좌번호 복사하기
          </button>
          <a href="https://open.kakao.com/o/sQqCopki" target="_blank" rel="noopener noreferrer"
            className="block w-full text-center bg-white hover:bg-amber-50 border border-amber-300 text-amber-700 font-bold px-4 py-2.5 rounded-full text-sm transition-colors">
            문의하기 (오픈채팅)
          </a>
        </div>

        <button onClick={() => { setShowSuccess(false); reset() }}
          className="block w-full text-center bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-full transition-colors">확인</button>
      </Modal>

      <Modal isOpen={showDuplicate} onClose={() => setShowDuplicate(false)} title="이미 신청하셨어요">
        <p className="text-[#333] mb-1">이미 이번 행사에 신청하셨어요.</p>
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

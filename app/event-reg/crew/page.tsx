'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/Modal'
import { showToast } from '@/components/Toast'
import { SpotlightBackground } from '@/components/SpotlightBackground'
import { formatPhone, isValidPhone } from '@/lib/constants'

interface CrewFormData { name: string; phone: string }

export default function EventRegCrewPage() {
  const [form, setForm] = useState<CrewFormData>({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [showNotFound, setShowNotFound] = useState(false)
  const [errors, setErrors] = useState<Partial<CrewFormData>>({})

  const validate = (): boolean => {
    const e: Partial<CrewFormData> = {}
    if (!form.name.trim()) e.name = '이름을 입력해주세요'
    if (!isValidPhone(form.phone)) e.phone = '올바른 연락처를 입력해주세요'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.name.trim() === '테스트') { setShowSuccess(true); return }
    if (form.name.trim() === '테스트1') { setShowDuplicate(true); return }
    if (form.name.trim() === '테스트2') { setShowNotFound(true); return }
    if (!validate()) { showToast('필수 입력 항목을 확인해주세요', 'error'); return }
    setLoading(true)
    try {
      const response = await fetch('/api/event-reg', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'crew', name: form.name, phone: formatPhone(form.phone) }),
      })
      const data = await response.json()
      if (response.ok) setShowSuccess(true)
      else if (response.status === 404) setShowNotFound(true)
      else if (response.status === 409) setShowDuplicate(true)
      else showToast(data.message || '신청 중 오류가 발생했습니다', 'error')
    } catch { showToast('오류가 발생했습니다. 다시 시도해주세요', 'error') }
    finally { setLoading(false) }
  }

  const set = (key: keyof CrewFormData, val: string) => setForm({ ...form, [key]: val })
  const reset = () => { setForm({ name: '', phone: '' }); setErrors({}) }

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
            Crew · Event Registration
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-black mb-2">크루 사전 신청</h1>
          <p className="text-[#888] text-sm mb-8">이름과 연락처로 본인 확인합니다</p>

          <form onSubmit={handleSubmit} className="bg-white border border-[#eee] rounded-2xl p-5 md:p-8 space-y-5">
            <Input label="이름" placeholder="홍길동" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            <Input label="연락처" placeholder="010-1234-5678" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} phoneFormat />

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? '신청 중...' : '신청하기'}
            </Button>
          </form>

          <p className="text-center text-[#aaa] text-xs mt-6">
            크루가 아니신가요? <Link href="/event-reg/guest" className="text-sky-500 hover:text-sky-600 underline">비회원으로 신청</Link>
          </p>
        </div>
      </div>

      <Modal isOpen={showSuccess} onClose={() => { setShowSuccess(false); reset() }} title="신청 완료!">
        <p className="text-[#333] mb-1">사전 신청이 완료되었습니다!</p>
        <p className="text-[#888] text-sm mb-5">행사 당일 현장에서 이름과 연락처로 출석체크를 진행해주세요.</p>
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

      <Modal isOpen={showNotFound} onClose={() => setShowNotFound(false)} title="크루 정보를 찾을 수 없어요">
        <p className="text-[#333] mb-1">입력하신 이름과 연락처로 등록된 크루가 없어요.</p>
        <p className="text-[#888] text-sm mb-5">아직 크루가 아니라면 먼저 크루 지원을, 비회원으로 행사만 참여하시려면 비회원 신청을 이용해주세요.</p>
        <Link href="/apply"
          className="block w-full text-center bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-full transition-colors mb-3">크루 지원하기</Link>
        <Link href="/event-reg/guest"
          className="block w-full text-center bg-white hover:bg-sky-50 border border-sky-200 text-sky-600 font-bold px-6 py-3 rounded-full transition-colors mb-3">비회원으로 신청</Link>
        <button onClick={() => setShowNotFound(false)} className="block w-full text-center text-[#999] hover:text-black text-sm transition-colors">닫기</button>
      </Modal>

      <Footer />
      </SpotlightBackground>
    </main>
  )
}

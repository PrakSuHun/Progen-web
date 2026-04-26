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
  SCHOOLS, GRADES, PATHS, PROJECTS, GENDERS,
  isValidPhone, formatPhone,
} from '@/lib/constants'

interface FormData {
  name: string; phone: string; school: string; grade: string; age: string
  major: string; path: string; project: string; gender: string; motivation: string
}

export default function ApplyPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '', phone: '', school: '', grade: '', age: '',
    major: '', path: '', project: '', gender: '', motivation: '',
  })
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = (): boolean => {
    const e: Partial<FormData> = {}
    if (!formData.name.trim()) e.name = '이름을 입력해주세요'
    if (!isValidPhone(formData.phone)) e.phone = '올바른 연락처를 입력해주세요'
    if (!formData.school) e.school = '학교를 선택해주세요'
    if (!formData.grade) e.grade = '학년을 선택해주세요'
    if (!formData.age.trim()) e.age = '나이를 입력해주세요'
    if (!formData.major.trim()) e.major = '전공을 입력해주세요'
    if (!formData.path) e.path = '경로를 선택해주세요'
    if (!formData.project) e.project = '프로젝트를 선택해주세요'
    if (!formData.gender) e.gender = '성별을 선택해주세요'
    if (!formData.motivation.trim()) e.motivation = '지원 동기를 입력해주세요'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) { showToast('필수 입력 항목을 확인해주세요', 'error'); return }
    setLoading(true)
    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, phone: formatPhone(formData.phone) }),
      })
      const data = await response.json()
      if (response.ok) setShowSuccess(true)
      else if (response.status === 409) setShowDuplicate(true)
      else showToast(data.message || '지원 중 오류가 발생했습니다', 'error')
    } catch { showToast('오류가 발생했습니다. 다시 시도해주세요', 'error') }
    finally { setLoading(false) }
  }

  const set = (key: keyof FormData, val: string) => setFormData({ ...formData, [key]: val })

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="pt-20 md:pt-24 pb-16 px-5 lg:px-8">
        <div className="max-w-lg mx-auto">

          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-500 text-[11px] font-bold tracking-wider uppercase">
            Apply
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-black mb-2">1기 크루 지원</h1>
          <p className="text-[#888] text-sm mb-8">지원과 동시에 크루 확정! 무료 · 전공 무관</p>

          <form onSubmit={handleSubmit} className="bg-white border border-[#eee] rounded-2xl p-5 md:p-8 space-y-5">
            <Input label="이름" placeholder="홍길동" value={formData.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            <Select label="성별" options={GENDERS} value={formData.gender} onChange={(e) => set('gender', e.target.value)} error={errors.gender} />
            <Input label="연락처" type="tel" placeholder="010-1234-5678" value={formData.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} phoneFormat />
            <Input label="나이" type="number" placeholder="20" value={formData.age} onChange={(e) => set('age', e.target.value)} error={errors.age} />
            <Select label="학교" options={SCHOOLS} value={formData.school} onChange={(e) => set('school', e.target.value)} error={errors.school} />
            <Select label="학년" options={GRADES} value={formData.grade} onChange={(e) => set('grade', e.target.value)} error={errors.grade} />
            <Input label="전공" placeholder="컴퓨터과학" value={formData.major} onChange={(e) => set('major', e.target.value)} error={errors.major} />
            <Select label="우리를 알게 된 경로" options={PATHS} value={formData.path} onChange={(e) => set('path', e.target.value)} error={errors.path} />
            <Select label="관심 프로젝트" options={PROJECTS} value={formData.project} onChange={(e) => set('project', e.target.value)} error={errors.project} />
            <div>
              <label className="block text-sm font-medium text-[#333] mb-2">지원 동기</label>
              <textarea
                placeholder="PROGEN에 지원하는 이유를 알려주세요"
                value={formData.motivation}
                onChange={(e) => set('motivation', e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-[#111] placeholder-[#aaa] focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition h-32 text-base ${errors.motivation ? 'border-red-400' : 'border-[#e0e0e0]'}`}
              />
              {errors.motivation && <p className="text-red-500 text-xs mt-1.5">{errors.motivation}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? '제출 중...' : '지원하기'}
            </Button>
          </form>

        </div>
      </div>

      <Modal isOpen={showSuccess} onClose={() => { setShowSuccess(false); window.location.href = '/' }} title="지원 완료!">
        <p className="text-[#333] mb-1">지원해주셔서 감사합니다!</p>
        <p className="text-[#888] text-sm mb-5">지원과 동시에 크루 확정이에요. 아래 링크로 카카오톡 팀 채팅방에 바로 입장해주세요!</p>
        <a href="https://invite.kakao.com/tc/Y2VGimsEqA" target="_blank" rel="noopener noreferrer"
          className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded-full transition-colors mb-3">
          카카오톡 팀 채팅방 입장하기
        </a>
        <button onClick={() => { setShowSuccess(false); window.location.href = '/' }}
          className="block w-full text-center text-[#999] hover:text-black text-sm transition-colors">
          나중에 할게요
        </button>
      </Modal>

      <Modal isOpen={showDuplicate} onClose={() => setShowDuplicate(false)} title="이미 지원하셨어요">
        <p className="text-[#333] mb-1">동일한 연락처로 이미 지원 내역이 있어요.</p>
        <p className="text-[#888] text-sm mb-5">문제가 있거나 정보를 수정하고 싶으시면 아래 버튼으로 문의해주세요.</p>
        <a href="https://open.kakao.com/o/sQqCopki" target="_blank" rel="noopener noreferrer"
          className="block w-full text-center bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-full transition-colors mb-3">
          문의하기
        </a>
        <button onClick={() => setShowDuplicate(false)}
          className="block w-full text-center text-[#999] hover:text-black text-sm transition-colors">
          닫기
        </button>
      </Modal>

      <Footer />
    </main>
  )
}

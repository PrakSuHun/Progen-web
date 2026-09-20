'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/Toast'
import { SpotlightBackground } from '@/components/SpotlightBackground'

const QUESTIONS = [
  { key: 'q1', label: '1. 생명과 친해질 수 있었나요? 어떤 부분이 도움이 되었나요?', placeholder: '자유롭게 작성해주세요' },
  { key: 'q2', label: '2. 애로사항이 있었나요?', placeholder: '자유롭게 작성해주세요' },
  { key: 'q3', label: '3. 생명을 2차 만남 혹은 이후 계획이 있으신가요?', placeholder: '자유롭게 작성해주세요' },
] as const

export default function GrapeFeedbackPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [formData, setFormData] = useState({ name: '', q1: '', q2: '', q3: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요'
    for (const q of QUESTIONS) {
      if (!formData[q.key].trim()) newErrors[q.key] = '답변을 입력해주세요'
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); showToast('모든 항목을 입력해주세요', 'error'); return }
    setErrors({})
    setLoading(true)
    try {
      const response = await fetch('/api/grape-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (response.ok) setDone(true)
      else showToast('오류가 발생했습니다', 'error')
    } catch { showToast('오류가 발생했습니다', 'error') }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen">
      <SpotlightBackground variant="page">
      <Navbar />
      <div className="pt-20 md:pt-24 pb-16 px-5 lg:px-8">
        <div className="max-w-lg mx-auto">

          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-500 text-[11px] font-bold tracking-wider uppercase">
            Podo Feedback
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-black mb-8">포도용 피드백</h1>

          {!done ? (
            <div className="bg-white border border-[#eee] rounded-2xl p-5 md:p-8 space-y-6">
              <Input
                label={<>이름 <span className="text-red-500">*</span></>}
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors((prev) => ({ ...prev, name: '' })) }}
                placeholder="이름을 입력해주세요"
                error={errors.name}
              />
              {QUESTIONS.map((q) => (
                <div key={q.key}>
                  <label className="block text-sm font-medium text-[#333] mb-2">{q.label} <span className="text-red-500">*</span></label>
                  <textarea
                    value={formData[q.key]}
                    onChange={(e) => { setFormData({ ...formData, [q.key]: e.target.value }); if (errors[q.key]) setErrors((prev) => ({ ...prev, [q.key]: '' })) }}
                    placeholder={q.placeholder}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-[#111] placeholder-[#aaa] focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition h-28 text-base ${errors[q.key] ? 'border-red-400' : 'border-[#e0e0e0]'}`}
                  />
                  {errors[q.key] && <p className="text-red-500 text-xs mt-1.5">{errors[q.key]}</p>}
                </div>
              ))}
              <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">{loading ? '제출 중...' : '제출하기'}</Button>
            </div>
          ) : (
            <div className="bg-white border border-[#eee] rounded-2xl p-6 md:p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-500 font-black text-2xl flex items-center justify-center mx-auto">!</div>
              <h2 className="text-2xl font-black text-black">감사합니다!</h2>
              <p className="text-[#555] text-sm">소중한 답변을 제출해주셔서 감사합니다.</p>
              <Button variant="secondary" onClick={() => router.push('/')} className="w-full">홈으로 돌아가기</Button>
            </div>
          )}

        </div>
      </div>
      <Footer />
      </SpotlightBackground>
    </main>
  )
}

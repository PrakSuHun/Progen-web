'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { TagSelector } from '@/components/feedback/TagSelector'
import { showToast } from '@/components/Toast'
import { GOOD_TAGS, BAD_TAGS } from '@/lib/constants'

interface FeedbackData {
  good_tags: string[]; good_points: string
  bad_tags: string[]; bad_points: string
  would_return: boolean; join_interest: boolean
}

export default function FeedbackPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FeedbackData>({
    good_tags: [], good_points: '', bad_tags: [], bad_points: '',
    would_return: false, join_interest: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNext = () => {
    const newErrors: Record<string, string> = {}
    if (step === 1 && !formData.good_points.trim()) newErrors.good_points = '좋았던 점을 입력해주세요'
    if (step === 2 && !formData.bad_points.trim()) newErrors.bad_points = '아쉬운 점을 입력해주세요'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); showToast('필수 항목을 입력해주세요', 'error'); return }
    setErrors({}); setStep(step + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (response.ok) setStep(4)
      else showToast('오류가 발생했습니다', 'error')
    } catch { showToast('오류가 발생했습니다', 'error') }
    finally { setLoading(false) }
  }

  const stepIndicator = (current: number) => (
    <div className="flex gap-1.5 mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className={`h-1 rounded-full flex-1 transition-colors ${s <= current ? 'bg-sky-500' : 'bg-[#e0e0e0]'}`} />
      ))}
    </div>
  )

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="pt-20 md:pt-24 pb-16 px-5 lg:px-8">
        <div className="max-w-lg mx-auto">

          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-500 text-[11px] font-bold tracking-wider uppercase">
            Feedback
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-black mb-8">행사 피드백</h1>

          {/* Step 0 */}
          {step === 0 && (
            <div className="bg-white border border-[#eee] rounded-2xl p-6 md:p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-500 font-black text-2xl flex items-center justify-center mx-auto">?</div>
              <h2 className="text-xl font-black text-black">솔직한 의견을 들려주세요</h2>
              <p className="text-[#666] text-sm">좋았던 점과 아쉬웠던 점을 작성해주시면<br />더 좋은 행사를 만드는 데 큰 도움이 됩니다.</p>
              <p className="text-[#aaa] text-xs">익명으로 제출되며 개인정보는 수집하지 않습니다.</p>
              <Button onClick={() => setStep(1)} className="w-full" size="lg">설문 시작하기</Button>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="bg-white border border-[#eee] rounded-2xl p-5 md:p-8 space-y-5">
              {stepIndicator(1)}
              <h2 className="text-xl font-black text-black">좋았던 점</h2>
              <TagSelector label="해당하는 항목을 선택해주세요 (선택)" tags={GOOD_TAGS} selectedTags={formData.good_tags} onChange={(tags) => setFormData({ ...formData, good_tags: tags })} />
              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">자유롭게 작성해주세요 <span className="text-red-500">*</span></label>
                <textarea value={formData.good_points} onChange={(e) => { setFormData({ ...formData, good_points: e.target.value }); if (errors.good_points) setErrors({}) }}
                  placeholder="이번 행사에서 좋았던 점을 자유롭게 적어주세요"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-[#111] placeholder-[#aaa] focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition h-32 text-base ${errors.good_points ? 'border-red-400' : 'border-[#e0e0e0]'}`}
                />
                {errors.good_points && <p className="text-red-500 text-xs mt-1.5">{errors.good_points}</p>}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">이전</Button>
                <Button onClick={handleNext} className="flex-1">다음</Button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="bg-white border border-[#eee] rounded-2xl p-5 md:p-8 space-y-5">
              {stepIndicator(2)}
              <h2 className="text-xl font-black text-black">아쉬운 점</h2>
              <TagSelector label="해당하는 항목을 선택해주세요 (선택)" tags={BAD_TAGS} selectedTags={formData.bad_tags} onChange={(tags) => setFormData({ ...formData, bad_tags: tags })} />
              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">자유롭게 작성해주세요 <span className="text-red-500">*</span></label>
                <textarea value={formData.bad_points} onChange={(e) => { setFormData({ ...formData, bad_points: e.target.value }); if (errors.bad_points) setErrors({}) }}
                  placeholder="이번 행사에서 아쉬웠던 점을 자유롭게 적어주세요"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-[#111] placeholder-[#aaa] focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition h-32 text-base ${errors.bad_points ? 'border-red-400' : 'border-[#e0e0e0]'}`}
                />
                {errors.bad_points && <p className="text-red-500 text-xs mt-1.5">{errors.bad_points}</p>}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">이전</Button>
                <Button onClick={handleNext} className="flex-1">다음</Button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="bg-white border border-[#eee] rounded-2xl p-5 md:p-8 space-y-5">
              {stepIndicator(3)}
              <h2 className="text-xl font-black text-black">행사 참여 의향</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-[#fafafa] border border-[#eee] rounded-xl hover:border-sky-200 transition">
                  <input type="checkbox" checked={formData.would_return} onChange={(e) => setFormData({ ...formData, would_return: e.target.checked })} className="w-5 h-5 accent-sky-500" />
                  <span className="text-[#333] text-sm">다음 행사에도 참여하고 싶습니다</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-[#fafafa] border border-[#eee] rounded-xl hover:border-sky-200 transition">
                  <input type="checkbox" checked={formData.join_interest} onChange={(e) => setFormData({ ...formData, join_interest: e.target.checked })} className="w-5 h-5 accent-sky-500" />
                  <span className="text-[#333] text-sm">PROGEN 단체 가입에 관심이 있습니다</span>
                </label>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">이전</Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">{loading ? '제출 중...' : '제출하기'}</Button>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="bg-white border border-[#eee] rounded-2xl p-6 md:p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-500 font-black text-2xl flex items-center justify-center mx-auto">!</div>
              <h2 className="text-2xl font-black text-black">감사합니다!</h2>
              <p className="text-[#555] text-sm">귀중한 피드백을 제출해주셔서 감사합니다.<br />더 좋은 행사를 만들기 위해 적극 반영할게요.</p>
              {formData.join_interest && (
                <div className="bg-sky-50 border border-sky-100 p-5 rounded-xl">
                  <p className="text-sky-600 text-sm mb-3 font-semibold">PROGEN에 관심을 가져주셔서 감사해요!</p>
                  <Button className="w-full" onClick={() => router.push('/apply')}>크루 지원하러 가기</Button>
                </div>
              )}
              <Button variant="secondary" onClick={() => router.push('/')} className="w-full">홈으로 돌아가기</Button>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </main>
  )
}

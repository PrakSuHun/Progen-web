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
  good_tags: string[]
  good_points: string
  bad_tags: string[]
  bad_points: string
  would_return: boolean
  join_interest: boolean
}

export default function FeedbackPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FeedbackData>({
    good_tags: [],
    good_points: '',
    bad_tags: [],
    bad_points: '',
    would_return: false,
    join_interest: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (step === 1 && !formData.good_points.trim()) {
      newErrors.good_points = '좋았던 점을 입력해주세요'
    }
    if (step === 2 && !formData.bad_points.trim()) {
      newErrors.bad_points = '아쉬운 점을 입력해주세요'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showToast('필수 항목을 입력해주세요', 'error')
      return
    }

    setErrors({})
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStep(4)
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
        <h1 className="text-4xl font-bold text-white mb-8 text-center">행사 피드백</h1>

        {/* Step 0: Start */}
        {step === 0 && (
          <div className="bg-slate-800 p-8 rounded-lg text-center space-y-6">
            <div className="text-6xl">📝</div>
            <h2 className="text-2xl font-semibold text-white">솔직한 의견을 들려주세요</h2>
            <p className="text-slate-400">
              좋았던 점과 아쉬웠던 점을 작성해주시면<br />
              더 좋은 행사를 만드는 데 큰 도움이 됩니다.
            </p>
            <p className="text-slate-500 text-sm">익명으로 제출되며 개인정보는 수집하지 않습니다.</p>
            <Button onClick={() => setStep(1)} className="w-full" size="lg">
              설문 시작하기
            </Button>
          </div>
        )}

        {/* Step 1: Good Points */}
        {step === 1 && (
          <div className="space-y-6 bg-slate-800 p-8 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-purple-400 text-sm font-medium">1 / 3</span>
              <h2 className="text-2xl font-semibold text-white">좋았던 점</h2>
            </div>
            <TagSelector
              label="해당하는 항목을 선택해주세요 (선택)"
              tags={GOOD_TAGS}
              selectedTags={formData.good_tags}
              onChange={(tags) => setFormData({ ...formData, good_tags: tags })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                자유롭게 작성해주세요 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.good_points}
                onChange={(e) => {
                  setFormData({ ...formData, good_points: e.target.value })
                  if (errors.good_points) setErrors({})
                }}
                placeholder="이번 행사에서 좋았던 점을 자유롭게 적어주세요"
                className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 transition h-32 ${
                  errors.good_points ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              {errors.good_points && (
                <p className="text-red-400 text-sm mt-1">{errors.good_points}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">
                이전
              </Button>
              <Button onClick={handleNext} className="flex-1">
                다음
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Bad Points */}
        {step === 2 && (
          <div className="space-y-6 bg-slate-800 p-8 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-purple-400 text-sm font-medium">2 / 3</span>
              <h2 className="text-2xl font-semibold text-white">아쉬운 점</h2>
            </div>
            <TagSelector
              label="해당하는 항목을 선택해주세요 (선택)"
              tags={BAD_TAGS}
              selectedTags={formData.bad_tags}
              onChange={(tags) => setFormData({ ...formData, bad_tags: tags })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                자유롭게 작성해주세요 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.bad_points}
                onChange={(e) => {
                  setFormData({ ...formData, bad_points: e.target.value })
                  if (errors.bad_points) setErrors({})
                }}
                placeholder="이번 행사에서 아쉬웠던 점을 자유롭게 적어주세요"
                className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 transition h-32 ${
                  errors.bad_points ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              {errors.bad_points && (
                <p className="text-red-400 text-sm mt-1">{errors.bad_points}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                이전
              </Button>
              <Button onClick={handleNext} className="flex-1">
                다음
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Intent + Submit */}
        {step === 3 && (
          <div className="space-y-6 bg-slate-800 p-8 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-purple-400 text-sm font-medium">3 / 3</span>
              <h2 className="text-2xl font-semibold text-white">행사 참여 의향</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                <input
                  type="checkbox"
                  checked={formData.would_return}
                  onChange={(e) => setFormData({ ...formData, would_return: e.target.checked })}
                  className="w-5 h-5 accent-purple-500"
                />
                <span className="text-white">다음 행사에도 참여하고 싶습니다</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                <input
                  type="checkbox"
                  checked={formData.join_interest}
                  onChange={(e) => setFormData({ ...formData, join_interest: e.target.checked })}
                  className="w-5 h-5 accent-purple-500"
                />
                <span className="text-white">PROGEN 단체 가입에 관심이 있습니다</span>
              </label>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                이전
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? '제출 중...' : '제출하기'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="bg-slate-800 p-8 rounded-lg text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold text-white">감사합니다!</h2>
            <p className="text-slate-300">
              귀중한 피드백을 제출해주셔서 감사합니다.<br />
              더 좋은 행사를 만들기 위해 적극 반영할게요.
            </p>
            {formData.join_interest && (
              <div className="bg-purple-900 bg-opacity-50 border border-purple-700 p-4 rounded-lg">
                <p className="text-purple-300 mb-3">PROGEN에 관심을 가져주셔서 감사해요!</p>
                <Button variant="primary" className="w-full" onClick={() => router.push('/apply')}>
                  크루 지원하러 가기
                </Button>
              </div>
            )}
            <Button variant="secondary" onClick={() => router.push('/')} className="w-full">
              홈으로 돌아가기
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}

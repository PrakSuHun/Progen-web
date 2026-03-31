'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StepIndicator } from '@/components/feedback/StepIndicator'
import { StarRating } from '@/components/feedback/StarRating'
import { TagSelector } from '@/components/feedback/TagSelector'
import { showToast } from '@/components/Toast'
import { isValidPhone, formatPhone, GOOD_TAGS, BAD_TAGS } from '@/lib/constants'


interface FeedbackData {
  name: string
  phone: string
  score_overall: number
  score_content: number
  score_practice: number
  score_network: number
  good_tags: string[]
  good_points: string
  bad_tags: string[]
  bad_points: string
  would_return: boolean
  join_interest: boolean
}

export default function FeedbackPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FeedbackData>({
    name: '',
    phone: '',
    score_overall: 0,
    score_content: 0,
    score_practice: 0,
    score_network: 0,
    good_tags: [],
    good_points: '',
    bad_tags: [],
    bad_points: '',
    would_return: false,
    join_interest: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요'
        if (!isValidPhone(formData.phone)) newErrors.phone = '올바른 연락처를 입력해주세요'
        break
      case 2:
        if (formData.score_overall === 0) newErrors.overall = '만족도를 선택해주세요'
        break
      case 3:
        if (formData.score_content === 0) newErrors.content = '강의 만족도를 선택해주세요'
        if (formData.score_practice === 0) newErrors.practice = '실습 만족도를 선택해주세요'
        if (formData.score_network === 0) newErrors.network = '네트워킹 만족도를 선택해주세요'
        break
      case 4:
        if (formData.good_tags.length === 0) newErrors.goodTags = '좋았던 점을 선택해주세요'
        break
      case 5:
        if (formData.bad_tags.length === 0) newErrors.badTags = '아쉬운 점을 선택해주세요'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    } else {
      showToast('필수 항목을 입력해주세요', 'error')
    }
  }

  const handlePrev = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: formatPhone(formData.phone),
        }),
      })

      if (response.ok) {
        setStep(7) // Complete step
        showToast('피드백이 저장되었습니다!', 'success')
      } else if (response.status === 409) {
        showToast('이미 피드백을 제출하셨습니다', 'error')
      } else {
        showToast('오류가 발생했습니다', 'error')
      }
    } catch (error) {
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

        <StepIndicator currentStep={step} totalSteps={7} />

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 bg-slate-800 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold text-white">본인 확인</h2>
            <Input
              label="이름"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />
            <Input
              label="연락처"
              phoneFormat
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
            />
            <Button onClick={handleNext} className="w-full">
              다음
            </Button>
          </div>
        )}

        {/* Step 2: Overall Satisfaction */}
        {step === 2 && (
          <div className="space-y-6 bg-slate-800 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold text-white">전반적 만족도</h2>
            <StarRating
              label="행사 전반에 대해 얼마나 만족하셨나요?"
              value={formData.score_overall}
              onChange={(value) => setFormData({ ...formData, score_overall: value })}
            />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handlePrev} className="flex-1">
                이전
              </Button>
              <Button onClick={handleNext} className="flex-1">
                다음
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Details Satisfaction */}
        {step === 3 && (
          <div className="space-y-6 bg-slate-800 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold text-white">세부 만족도</h2>
            <StarRating
              label="강의 내용"
              value={formData.score_content}
              onChange={(value) => setFormData({ ...formData, score_content: value })}
            />
            <StarRating
              label="실습 경험"
              value={formData.score_practice}
              onChange={(value) => setFormData({ ...formData, score_practice: value })}
            />
            <StarRating
              label="네트워킹"
              value={formData.score_network}
              onChange={(value) => setFormData({ ...formData, score_network: value })}
            />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handlePrev} className="flex-1">
                이전
              </Button>
              <Button onClick={handleNext} className="flex-1">
                다음
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Good Points */}
        {step === 4 && (
          <div className="space-y-6 bg-slate-800 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold text-white">좋았던 점</h2>
            <TagSelector
              label="좋았던 점을 선택해주세요"
              tags={GOOD_TAGS}
              selectedTags={formData.good_tags}
              onChange={(tags) => setFormData({ ...formData, good_tags: tags })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                자유 의견 (선택)
              </label>
              <textarea
                value={formData.good_points}
                onChange={(e) => setFormData({ ...formData, good_points: e.target.value })}
                placeholder="더 있는 좋았던 점을 작성해주세요"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 h-24"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handlePrev} className="flex-1">
                이전
              </Button>
              <Button onClick={handleNext} className="flex-1">
                다음
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Bad Points */}
        {step === 5 && (
          <div className="space-y-6 bg-slate-800 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold text-white">아쉬운 점</h2>
            <TagSelector
              label="아쉬운 점을 선택해주세요"
              tags={BAD_TAGS}
              selectedTags={formData.bad_tags}
              onChange={(tags) => setFormData({ ...formData, bad_tags: tags })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                자유 의견 (선택)
              </label>
              <textarea
                value={formData.bad_points}
                onChange={(e) => setFormData({ ...formData, bad_points: e.target.value })}
                placeholder="더 있는 아쉬운 점을 작성해주세요"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 h-24"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handlePrev} className="flex-1">
                이전
              </Button>
              <Button onClick={handleNext} className="flex-1">
                다음
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Future Intent */}
        {step === 6 && (
          <div className="space-y-6 bg-slate-800 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold text-white">행사 참여 의향</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.would_return}
                  onChange={(e) => setFormData({ ...formData, would_return: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white">다음 행사에도 참여하고 싶습니다</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.join_interest}
                  onChange={(e) => setFormData({ ...formData, join_interest: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white">PROGEN 단체 가입에 관심이 있습니다</span>
              </label>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handlePrev} className="flex-1">
                이전
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? '제출 중...' : '완료'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 7: Complete */}
        {step === 7 && (
          <div className="bg-slate-800 p-8 rounded-lg text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">감사합니다! 🎉</h2>
            <p className="text-slate-300">
              귀중한 피드백을 제출해주셔서 감사합니다.
            </p>
            {formData.join_interest && (
              <div className="bg-purple-900 bg-opacity-50 p-4 rounded-lg">
                <p className="text-purple-300">
                  PROGEN 단체에 관심을 가져주셨습니다!
                </p>
                <Button variant="primary" className="mt-4 w-full" onClick={() => router.push('/apply')}>
                  지원하러 가기
                </Button>
              </div>
            )}
            <Button
              onClick={() => router.push('/')}
              className="w-full"
            >
              홈으로 돌아가기
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}

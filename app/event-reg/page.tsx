'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/Modal'
import { showToast } from '@/components/Toast'
import { formatPhone, isValidPhone } from '@/lib/constants'


type UserMode = 'crew' | 'guest' | null

interface FormData {
  name: string
  phone: string
  school?: string
  major?: string
}

export default function EventRegPage() {
  const [mode, setMode] = useState<UserMode>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    school: '',
    major: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요'
    if (!isValidPhone(formData.phone)) newErrors.phone = '올바른 연락처를 입력해주세요'
    if (mode === 'guest') {
      if (!formData.school?.trim()) newErrors.school = '학교를 입력해주세요'
      if (!formData.major?.trim()) newErrors.major = '전공을 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast('필수 입력 항목을 확인해주세요', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/event-reg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          name: formData.name,
          phone: formatPhone(formData.phone),
          school: formData.school,
          major: formData.major,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast('신청이 완료되었습니다!', 'success')
        setMode(null)
        setFormData({ name: '', phone: '', school: '', major: '' })
      } else if (response.status === 404) {
        showToast('크루 정보를 찾을 수 없습니다. 먼저 지원해주세요.', 'error')
      } else if (response.status === 409) {
        showToast('이미 신청하셨습니다', 'error')
      } else {
        showToast(data.message || '신청 중 오류가 발생했습니다', 'error')
      }
    } catch (error) {
      showToast('오류가 발생했습니다. 다시 시도해주세요', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">행사 사전 신청</h1>

        {/* Mode Selection Modal */}
        <Modal
          isOpen={mode === null}
          onClose={() => {}}
          title="신청 유형 선택"
        >
          <p className="text-slate-300 mb-6">당신의 신청 유형을 선택해주세요</p>
          <div className="flex gap-4">
            <Button
              variant="primary"
              onClick={() => setMode('crew')}
              className="flex-1"
            >
              크루
            </Button>
            <Button
              variant="secondary"
              onClick={() => setMode('guest')}
              className="flex-1"
            >
              게스트
            </Button>
          </div>
        </Modal>

        {/* Registration Form */}
        {mode !== null && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-8 rounded-lg">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setMode(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ← 유형 변경
              </button>
            </div>

            {/* Name */}
            <Input
              label="이름"
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />

            {/* Phone */}
            <Input
              label="연락처"
              type="tel"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              phoneFormat
            />

            {/* Guest Only Fields */}
            {mode === 'guest' && (
              <>
                <Input
                  label="학교"
                  type="text"
                  placeholder="서울대학교"
                  value={formData.school}
                  onChange={(e) =>
                    setFormData({ ...formData, school: e.target.value })
                  }
                  error={errors.school}
                />

                <Input
                  label="전공"
                  type="text"
                  placeholder="컴퓨터과학"
                  value={formData.major}
                  onChange={(e) =>
                    setFormData({ ...formData, major: e.target.value })
                  }
                  error={errors.major}
                />
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? '신청 중...' : '신청하기'}
            </Button>
          </form>
        )}
      </div>

      <Footer />
    </main>
  )
}

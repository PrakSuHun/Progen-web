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
  SCHOOLS,
  GRADES,
  PATHS,
  PROJECTS,
  GENDERS,
  isValidPhone,
  formatPhone,
} from '@/lib/constants'


interface FormData {
  name: string
  phone: string
  school: string
  grade: string
  age: string
  major: string
  path: string
  project: string
  gender: string
  motivation: string
}

export default function ApplyPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    school: '',
    grade: '',
    age: '',
    major: '',
    path: '',
    project: '',
    gender: '',
    motivation: '',
  })

  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요'
    if (!isValidPhone(formData.phone)) newErrors.phone = '올바른 연락처를 입력해주세요'
    if (!formData.school) newErrors.school = '학교를 선택해주세요'
    if (!formData.grade) newErrors.grade = '학년을 선택해주세요'
    if (!formData.age.trim()) newErrors.age = '나이를 입력해주세요'
    if (!formData.major.trim()) newErrors.major = '전공을 입력해주세요'
    if (!formData.path) newErrors.path = '경로를 선택해주세요'
    if (!formData.project) newErrors.project = '프로젝트를 선택해주세요'
    if (!formData.gender) newErrors.gender = '성별을 선택해주세요'
    if (!formData.motivation.trim()) newErrors.motivation = '지원 동기를 입력해주세요'

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
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: formatPhone(formData.phone),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowSuccess(true)
      } else if (response.status === 409) {
        setShowDuplicate(true)
      } else {
        showToast(data.message || '지원 중 오류가 발생했습니다', 'error')
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
        <h1 className="text-4xl font-bold text-white mb-8 text-center">1기 크루 지원</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* School */}
          <Select
            label="학교"
            options={SCHOOLS}
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            error={errors.school}
          />

          {/* Grade */}
          <Select
            label="학년"
            options={GRADES}
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            error={errors.grade}
          />

          {/* Age */}
          <Input
            label="나이"
            type="number"
            placeholder="20"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            error={errors.age}
          />

          {/* Major */}
          <Input
            label="전공"
            type="text"
            placeholder="컴퓨터과학"
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            error={errors.major}
          />

          {/* Path */}
          <Select
            label="우리를 알게 된 경로"
            options={PATHS}
            value={formData.path}
            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            error={errors.path}
          />

          {/* Project */}
          <Select
            label="관심 프로젝트"
            options={PROJECTS}
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            error={errors.project}
          />

          {/* Gender */}
          <Select
            label="성별"
            options={GENDERS}
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            error={errors.gender}
          />

          {/* Motivation */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              지원 동기
            </label>
            <textarea
              placeholder="PROGEN에 지원하는 이유를 알려주세요"
              value={formData.motivation}
              onChange={(e) =>
                setFormData({ ...formData, motivation: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 transition h-32"
            />
            {errors.motivation && (
              <p className="text-red-400 text-sm mt-1">{errors.motivation}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? '제출 중...' : '지원하기'}
          </Button>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          window.location.href = '/'
        }}
        title="지원 완료 🎉"
      >
        <p className="text-slate-300 mb-2">지원해주셔서 감사합니다!</p>
        <p className="text-slate-400 text-sm mb-6">
          지원과 동시에 크루 확정이에요.
          <br />
          아래 링크로 카카오톡 팀 채팅방에 바로 입장해주세요!
        </p>
        <a
          href="https://invite.kakao.com/tc/Y2VGimsEqA"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold px-6 py-3 rounded-lg transition-colors mb-3"
        >
          카카오톡 팀 채팅방 입장하기
        </a>
        <button
          onClick={() => {
            setShowSuccess(false)
            window.location.href = '/'
          }}
          className="block w-full text-center text-slate-400 hover:text-white text-sm transition-colors"
        >
          나중에 할게요
        </button>
      </Modal>

      {/* Duplicate Modal */}
      <Modal
        isOpen={showDuplicate}
        onClose={() => setShowDuplicate(false)}
        title="이미 지원하셨어요"
      >
        <p className="text-slate-300 mb-2">동일한 연락처로 이미 지원 내역이 있어요.</p>
        <p className="text-slate-400 text-sm mb-6">
          문제가 있거나 정보를 수정하고 싶으시면 아래 버튼으로 문의해주세요.
        </p>
        <a
          href="https://open.kakao.com/o/sQqCopki"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors mb-3"
        >
          문의하기
        </a>
        <button
          onClick={() => setShowDuplicate(false)}
          className="block w-full text-center text-slate-400 hover:text-white text-sm transition-colors"
        >
          닫기
        </button>
      </Modal>

      <Footer />
    </main>
  )
}

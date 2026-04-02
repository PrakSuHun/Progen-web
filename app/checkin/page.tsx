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
  SCHOOLS, GRADES, PATHS, GENDERS,
  formatPhone, isValidPhone,
} from '@/lib/constants'

interface CheckInData { name: string; phone: string; age: string }
interface WalkInData {
  name: string; phone: string; age: string; school: string; grade: string
  major: string; path: string; gender: string
}

export default function CheckInPage() {
  const [checkInData, setCheckInData] = useState<CheckInData>({ name: '', phone: '', age: '' })
  const [walkInData, setWalkInData] = useState<WalkInData>({
    name: '', phone: '', age: '', school: '', grade: '',
    major: '', path: '', gender: '',
  })
  const [loading, setLoading] = useState(false)
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [checkedInName, setCheckedInName] = useState('')
  const [checkInErrors, setCheckInErrors] = useState<Partial<CheckInData>>({})
  const [walkInErrors, setWalkInErrors] = useState<Partial<WalkInData>>({})

  const validateCheckIn = (): boolean => {
    const e: Partial<CheckInData> = {}
    if (!checkInData.name.trim()) e.name = '이름을 입력해주세요'
    if (!isValidPhone(checkInData.phone)) e.phone = '올바른 연락처를 입력해주세요'
    if (!checkInData.age.trim()) e.age = '나이를 입력해주세요'
    setCheckInErrors(e); return Object.keys(e).length === 0
  }

  const validateWalkIn = (): boolean => {
    const e: Partial<WalkInData> = {}
    if (!walkInData.name.trim()) e.name = '이름을 입력해주세요'
    if (!isValidPhone(walkInData.phone)) e.phone = '올바른 연락처를 입력해주세요'
    if (!walkInData.age.trim()) e.age = '나이를 입력해주세요'
    if (!walkInData.school) e.school = '학교를 선택해주세요'
    if (!walkInData.grade) e.grade = '학년을 선택해주세요'
    if (!walkInData.major.trim()) e.major = '전공을 입력해주세요'
    if (!walkInData.path) e.path = '경로를 선택해주세요'
    if (!walkInData.gender) e.gender = '성별을 선택해주세요'
    setWalkInErrors(e); return Object.keys(e).length === 0
  }

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCheckIn()) return
    setLoading(true)
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: checkInData.name, phone: formatPhone(checkInData.phone), age: checkInData.age }),
      })
      const data = await response.json()
      if (response.ok) { setCheckedInName(data.name); setShowSuccess(true); setCheckInData({ name: '', phone: '', age: '' }); setShowWalkIn(false) }
      else if (response.status === 404) { setWalkInData({ ...walkInData, name: checkInData.name, phone: checkInData.phone, age: checkInData.age }); setShowWalkIn(true) }
      else if (response.status === 409) { setCheckedInName(data.name || checkInData.name); setShowDuplicate(true) }
      else showToast('오류가 발생했습니다', 'error')
    } catch { showToast('오류가 발생했습니다', 'error') }
    finally { setLoading(false) }
  }

  const handleWalkIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateWalkIn()) return
    setLoading(true)
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...walkInData, phone: formatPhone(walkInData.phone), walkin: true }),
      })
      const data = await response.json()
      if (response.ok) {
        setCheckedInName(data.name || walkInData.name); setShowSuccess(true)
        setWalkInData({ name: '', phone: '', age: '', school: '', grade: '', major: '', path: '', gender: '' })
        setShowWalkIn(false); setCheckInData({ name: '', phone: '', age: '' })
      } else if (response.status === 409) { setCheckedInName(data.name || walkInData.name); setShowDuplicate(true) }
      else showToast('오류가 발생했습니다', 'error')
    } catch { showToast('오류가 발생했습니다', 'error') }
    finally { setLoading(false) }
  }

  const setCI = (key: keyof CheckInData, val: string) => setCheckInData({ ...checkInData, [key]: val })
  const setWI = (key: keyof WalkInData, val: string) => setWalkInData({ ...walkInData, [key]: val })

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="pt-20 md:pt-24 pb-16 px-5 lg:px-8">
        <div className="max-w-lg mx-auto">

          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-500 text-[11px] font-bold tracking-wider uppercase">
            Check-in
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-black mb-2">현장 출석체크</h1>
          <p className="text-[#888] text-sm mb-8">이름, 연락처, 나이를 입력해주세요</p>

          <form onSubmit={handleCheckIn} className="bg-white border border-[#eee] rounded-2xl p-5 md:p-8 space-y-5 mb-5">
            <Input label="이름" placeholder="홍길동" value={checkInData.name} onChange={(e) => setCI('name', e.target.value)} error={checkInErrors.name} />
            <Input label="연락처" placeholder="010-1234-5678" value={checkInData.phone} onChange={(e) => setCI('phone', e.target.value)} error={checkInErrors.phone} phoneFormat />
            <Input label="나이" type="number" placeholder="20" value={checkInData.age} onChange={(e) => setCI('age', e.target.value)} error={checkInErrors.age} />
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? '확인 중...' : '출석체크'}
            </Button>
          </form>

          {showWalkIn && (
            <form onSubmit={handleWalkIn} className="bg-white border border-violet-200 rounded-2xl p-5 md:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-black">현장 등록</h2>
                <button type="button" onClick={() => setShowWalkIn(false)} className="text-[#999] hover:text-violet-500 text-sm transition-colors">← 취소</button>
              </div>
              <p className="text-[#888] text-sm">사전 신청 내역이 없어요. 아래 정보를 입력하면 바로 출석 처리됩니다.</p>

              <Input label="이름" placeholder="홍길동" value={walkInData.name} onChange={(e) => setWI('name', e.target.value)} error={walkInErrors.name} />
              <Input label="연락처" placeholder="010-1234-5678" value={walkInData.phone} onChange={(e) => setWI('phone', e.target.value)} error={walkInErrors.phone} phoneFormat />
              <Select label="학교" options={SCHOOLS} value={walkInData.school} onChange={(e) => setWI('school', e.target.value)} error={walkInErrors.school} />
              <Select label="학년" options={GRADES} value={walkInData.grade} onChange={(e) => setWI('grade', e.target.value)} error={walkInErrors.grade} />
              <Input label="나이" type="number" placeholder="20" value={walkInData.age} onChange={(e) => setWI('age', e.target.value)} error={walkInErrors.age} />
              <Input label="전공" placeholder="컴퓨터과학" value={walkInData.major} onChange={(e) => setWI('major', e.target.value)} error={walkInErrors.major} />
              <Select label="우리를 알게 된 경로" options={PATHS} value={walkInData.path} onChange={(e) => setWI('path', e.target.value)} error={walkInErrors.path} />
              <Select label="성별" options={GENDERS} value={walkInData.gender} onChange={(e) => setWI('gender', e.target.value)} error={walkInErrors.gender} />
              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? '등록 중...' : '현장 등록 및 출석'}
              </Button>
            </form>
          )}
        </div>
      </div>

      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="출석 완료!">
        <p className="text-[#333] mb-5"><span className="font-bold text-violet-600">{checkedInName}</span>님 출석이 확인됐습니다!</p>
        <button onClick={() => setShowSuccess(false)} className="block w-full text-center bg-violet-500 hover:bg-violet-600 text-white font-bold px-6 py-3 rounded-full transition-colors">확인</button>
      </Modal>

      <Modal isOpen={showDuplicate} onClose={() => setShowDuplicate(false)} title="이미 출석하셨어요">
        <p className="text-[#333] mb-1"><span className="font-bold">{checkedInName}</span>님은 이미 출석 처리되었습니다.</p>
        <p className="text-[#888] text-sm mb-5">문제가 있으시면 운영진에게 문의해주세요.</p>
        <button onClick={() => setShowDuplicate(false)} className="block w-full text-center bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#333] font-bold px-6 py-3 rounded-full transition-colors">확인</button>
      </Modal>

      <Footer />
    </main>
  )
}

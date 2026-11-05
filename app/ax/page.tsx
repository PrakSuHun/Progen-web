'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/Modal'
import { showToast } from '@/components/Toast'
import { SpotlightBackground } from '@/components/SpotlightBackground'
import { isValidPhone, formatPhone } from '@/lib/constants'

// 겨울방학 AX 프로젝트 간편 신청 — 11/7 행사 신청자는 이름+연락처만으로 신청 (기본 정보는 행사 신청 정보 사용)
export default function AxQuickPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<null | 'success' | 'duplicate' | 'not_found'>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() === '테스트') { setModal('success'); return }
    if (name.trim() === '테스트1') { setModal('duplicate'); return }
    if (name.trim() === '테스트2') { setModal('not_found'); return }
    const errs: { name?: string; phone?: string } = {}
    if (!name.trim()) errs.name = '이름을 입력해주세요'
    if (!isValidPhone(phone)) errs.phone = '올바른 연락처를 입력해주세요'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    try {
      const res = await fetch('/api/ax-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: formatPhone(phone) }),
      })
      if (res.ok) setModal('success')
      else if (res.status === 409) setModal('duplicate')
      else if (res.status === 404) setModal('not_found')
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
            AX Project
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-black mb-2 break-keep">겨울방학 AX 프로젝트 신청</h1>
          <p className="text-[#888] text-sm mb-8 break-keep">오늘 행사에 신청하신 분은 이름과 연락처만 입력하면 신청 완료!</p>

          <form onSubmit={handleSubmit} className="bg-white border border-[#eee] rounded-2xl p-5 md:p-8 space-y-5">
            <Input label="이름" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
            <Input label="연락처" type="tel" placeholder="010-1234-5678" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} phoneFormat />
            <p className="text-[#aaa] text-xs break-keep">행사 신청 때 입력한 이름·연락처와 같아야 해요.</p>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? '신청 중...' : '신청하기'}
            </Button>
          </form>
        </div>
      </div>

      <Modal isOpen={modal === 'success'} onClose={() => { setModal(null); router.push('/') }} title="신청 완료!">
        <p className="text-[#333] mb-1">겨울방학 AX 프로젝트 신청이 완료되었어요.</p>
        <p className="text-[#888] text-sm mb-5">자세한 안내는 카카오톡으로 보내드릴게요.</p>
        <Button className="w-full" onClick={() => { setModal(null); router.push('/') }}>확인</Button>
      </Modal>

      <Modal isOpen={modal === 'duplicate'} onClose={() => setModal(null)} title="이미 신청하셨어요">
        <p className="text-[#333] mb-1">이미 AX 프로젝트 신청 내역이 있어요.</p>
        <p className="text-[#888] text-sm mb-5">문제가 있으면 아래 버튼으로 문의해주세요.</p>
        <a href="https://pf.kakao.com/_nLiKX/chat" target="_blank" rel="noopener noreferrer"
          className="block w-full text-center bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-full transition-colors mb-3">
          문의하기 (카카오톡 채널)
        </a>
        <button onClick={() => setModal(null)} className="block w-full text-center text-[#999] hover:text-black text-sm transition-colors">닫기</button>
      </Modal>

      <Modal isOpen={modal === 'not_found'} onClose={() => setModal(null)} title="신청 정보를 찾을 수 없어요">
        <p className="text-[#333] mb-1">오늘 행사 신청 명단에 없는 이름·연락처예요.</p>
        <p className="text-[#888] text-sm mb-5">행사 신청 때 입력한 이름·연락처가 맞는지 확인해주세요. 계속 안 되면 문의해주세요.</p>
        <a href="https://pf.kakao.com/_nLiKX/chat" target="_blank" rel="noopener noreferrer"
          className="block w-full text-center bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-full transition-colors mb-3">
          문의하기 (카카오톡 채널)
        </a>
        <button onClick={() => setModal(null)} className="block w-full text-center text-[#999] hover:text-black text-sm transition-colors">다시 입력하기</button>
      </Modal>

      <Footer />
      </SpotlightBackground>
    </main>
  )
}

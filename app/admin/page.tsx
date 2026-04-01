'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/Toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (response.ok) { showToast('로그인 성공!', 'success'); router.push('/admin/dashboard') }
      else if (response.status === 401) { setError('비밀번호가 맞지 않습니다'); showToast('비밀번호가 맞지 않습니다', 'error') }
      else showToast('로그인 중 오류가 발생했습니다', 'error')
    } catch { showToast('오류가 발생했습니다', 'error') }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-5 pt-14">
        <div className="bg-white border border-[#eee] rounded-2xl p-6 md:p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-violet-500 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">A</div>
            <h1 className="text-2xl font-black text-black">관리자 로그인</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="비밀번호" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} error={error} />
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}

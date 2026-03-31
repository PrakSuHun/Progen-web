'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/Toast'
import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        showToast('로그인 성공!', 'success')
        router.push('/admin/dashboard')
      } else if (response.status === 401) {
        setError('비밀번호가 맞지 않습니다')
        showToast('비밀번호가 맞지 않습니다', 'error')
      } else {
        showToast('로그인 중 오류가 발생했습니다', 'error')
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

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-lg w-full">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">관리자 로그인</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="비밀번호"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  )
}

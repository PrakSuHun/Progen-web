'use client'

import { useEffect, useState } from 'react'
import { showToast } from '@/components/Toast'

// 어드민 웹푸시 알림 켜기/끄기 (2026-09-06, 설정 모달 하단에 노출)
// 계정 없는 어드민 구조: 구독은 "이 브라우저(기기)" 단위. 관리자 4명이 각자 기기에서 한 번씩 켜면 됨.

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export function PushToggle() {
  const [supported, setSupported] = useState(false)
  const [checked, setChecked] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setChecked(true)
      return
    }
    setSupported(true)
    navigator.serviceWorker.getRegistration('/sw.js')
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => setEnabled(!!sub))
      .finally(() => setChecked(true))
  }, [])

  const enable = async () => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) { showToast('푸시 키가 설정되지 않았습니다', 'error'); return }
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      showToast('브라우저 알림 권한을 허용해주세요', 'error')
      return
    }
    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    })
    const res = await fetch('/api/admin/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    })
    if (!res.ok) throw new Error('subscribe failed')
    setEnabled(true)
    showToast('이 기기로 신청 알림이 옵니다 🔔', 'success')
  }

  const disable = async () => {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js')
    const sub = await reg?.pushManager.getSubscription()
    if (sub) {
      await fetch('/api/admin/push-subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
      await sub.unsubscribe()
    }
    setEnabled(false)
    showToast('알림을 껐습니다', 'success')
  }

  const toggle = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (enabled) await disable()
      else await enable()
    } catch (e) {
      console.error('push toggle error:', e)
      showToast('알림 설정 중 오류가 발생했습니다', 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!checked) return null

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-bold text-slate-700">🔔 신청 알림 (이 기기)</div>
        <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
          {supported
            ? '행사 신청이 들어오면 이 기기로 푸시 알림을 보내드려요. 기기마다 따로 켜야 합니다.'
            : '이 브라우저는 푸시 미지원 — 아이폰은 사파리 「공유 → 홈 화면에 추가」 후 그 앱에서 켜주세요.'}
        </div>
      </div>
      {supported && (
        <button
          onClick={toggle}
          disabled={busy}
          className={`shrink-0 text-xs font-bold rounded-full px-3.5 py-1.5 border transition-colors disabled:opacity-50 ${
            enabled
              ? 'bg-sky-500 border-sky-500 text-white hover:bg-sky-600'
              : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'
          }`}
        >
          {enabled ? '알림 ON' : '알림 OFF'}
        </button>
      )}
    </div>
  )
}

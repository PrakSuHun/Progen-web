'use client'

import { useCallback, useEffect, useState } from 'react'
import { showToast } from '@/components/Toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  eventId: string
}

interface Settings {
  location: string
  entry_time: string
  materials: string
  program_detail: string
  kakao_chat_url: string
}

interface PendingInfo {
  confirm: { total: number; sent: number; pending: number }
  d1: { total: number; sent: number; pending: number }
}

const EMPTY: Settings = { location: '', entry_time: '', materials: '', program_detail: '', kakao_chat_url: '' }

export function EventAlimtalkSettings({ isOpen, onClose, eventId }: Props) {
  const [tab, setTab] = useState<'info' | 'send'>('info')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Settings>(EMPTY)
  const [eventTitle, setEventTitle] = useState('')
  const [confirmReady, setConfirmReady] = useState(false)
  const [pending, setPending] = useState<PendingInfo | null>(null)
  const [sendingKey, setSendingKey] = useState<string | null>(null)

  // 일정/장소 변경 입력
  const [chg, setChg] = useState({ oldDate: '', oldLocation: '', newDate: '', newLocation: '' })

  const load = useCallback(async () => {
    if (!eventId || eventId === 'crew-all') return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/event-settings?eventId=${encodeURIComponent(eventId)}`)
      const d = await res.json()
      if (res.ok) {
        setSettings({ ...EMPTY, ...d.settings })
        setEventTitle(d.event?.title ?? '')
        setConfirmReady(!!d.confirmReady)
        setPending(d.pending ?? null)
      } else {
        showToast(d.message || '설정을 불러올 수 없습니다', 'error')
      }
    } catch {
      showToast('설정을 불러올 수 없습니다', 'error')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (isOpen) {
      setTab('info')
      setChg({ oldDate: '', oldLocation: '', newDate: '', newLocation: '' })
      load()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen, load])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/event-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, ...settings }),
      })
      const d = await res.json()
      if (res.ok) {
        showToast('행사 정보가 저장되었습니다', 'success')
        await load()
      } else {
        showToast(d.message || '저장 실패', 'error')
      }
    } catch {
      showToast('저장 중 오류가 발생했습니다', 'error')
    } finally {
      setSaving(false)
    }
  }

  const runBatch = async (
    key: string,
    template: 'confirm' | 'd1' | 'change',
    confirmMsg: string,
    extra?: Record<string, string>,
  ) => {
    if (!window.confirm(confirmMsg)) return
    setSendingKey(key)
    try {
      const res = await fetch('/api/admin/send-alimtalk-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, template, ...(extra || {}) }),
      })
      const d = await res.json()
      if (res.ok) {
        showToast(d.message || '발송 완료', d.failed ? 'error' : 'success')
        await load()
      } else {
        showToast(d.message || '발송 실패', 'error')
      }
    } catch {
      showToast('발송 중 오류가 발생했습니다', 'error')
    } finally {
      setSendingKey(null)
    }
  }

  if (!isOpen) return null

  const field = (k: keyof Settings, label: string, placeholder: string, multiline = false) => (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={settings[k]}
          onChange={(e) => setSettings((s) => ({ ...s, [k]: e.target.value }))}
          placeholder={placeholder}
          rows={3}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-sky-400 resize-y"
        />
      ) : (
        <input
          value={settings[k]}
          onChange={(e) => setSettings((s) => ({ ...s, [k]: e.target.value }))}
          placeholder={placeholder}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-sky-400"
        />
      )}
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-black text-slate-800">행사 알림톡 설정</h2>
              <p className="text-xs text-slate-400 mt-0.5">{eventTitle || '행사'}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
          </div>

          {/* 탭 */}
          <div className="flex border-b border-slate-200 shrink-0">
            {([['info', '행사 정보'], ['send', '알림톡 발송']] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                  tab === id ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/40' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="px-5 py-4 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-slate-400">불러오는 중...</div>
            ) : tab === 'info' ? (
              <div className="space-y-3.5">
                <div className={`text-xs rounded-lg px-3 py-2 ${confirmReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {confirmReady
                    ? '✅ 참석 확정 알림톡 자동 발송 준비 완료'
                    : '⚠️ 아래 5개 항목을 모두 채워야 참석 확정 알림톡이 자동으로 나갑니다 (그 전까지는 보류 → 발송 탭에서 일괄 발송)'}
                </div>
                {field('location', '장소 *', '예: 충남대학교 공대 5호관 201호')}
                {field('entry_time', '입장 시간 *', '예: 오후 1시 30분')}
                {field('materials', '준비물 *', '예: 노트북, 충전기', true)}
                {field('program_detail', '당일 진행 *', '예: 14:00 오리엔테이션 / 14:30 실습 ...', true)}
                {field('kakao_chat_url', '참여자 채팅방 링크 *', 'https://open.kakao.com/o/...')}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg py-2.5 transition-colors"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 참석 확정 일괄 발송 */}
                <div className="border border-slate-200 rounded-xl p-3.5">
                  <div className="text-sm font-bold text-slate-700 mb-1">참석 확정 알림톡 (2번)</div>
                  <div className="text-xs text-slate-500 mb-2.5">
                    크루 신청 + 입금된 게스트 대상.
                    {pending && (
                      <> 전체 {pending.confirm.total}명 / 발송 {pending.confirm.sent}명 / <b className="text-slate-700">미발송 {pending.confirm.pending}명</b></>
                    )}
                  </div>
                  {!confirmReady && <div className="text-xs text-amber-600 mb-2">행사 정보 탭을 먼저 모두 채워주세요.</div>}
                  <button
                    onClick={() => runBatch(
                      'confirm', 'confirm',
                      `미발송 ${pending?.confirm.pending ?? 0}명에게 참석 확정 알림톡을 보냅니다. 계속할까요?`,
                    )}
                    disabled={!confirmReady || sendingKey !== null || !pending || pending.confirm.pending === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-bold rounded-lg py-2 transition-colors"
                  >
                    {sendingKey === 'confirm' ? '발송 중...' : `미발송 ${pending?.confirm.pending ?? 0}명에게 발송`}
                  </button>
                </div>

                {/* 행사 전 공지 */}
                <div className="border border-slate-200 rounded-xl p-3.5">
                  <div className="text-sm font-bold text-slate-700 mb-1">행사 전 공지 (4번 · D-1)</div>
                  <div className="text-xs text-slate-500 mb-2.5">
                    노쇼확정 제외 전 신청자 대상.
                    {pending && (
                      <> 전체 {pending.d1.total}명 / 발송 {pending.d1.sent}명 / <b className="text-slate-700">미발송 {pending.d1.pending}명</b></>
                    )}
                  </div>
                  <button
                    onClick={() => runBatch(
                      'd1', 'd1',
                      `미발송 ${pending?.d1.pending ?? 0}명에게 행사 전 공지를 보냅니다. 계속할까요?`,
                    )}
                    disabled={sendingKey !== null || !pending || pending.d1.pending === 0}
                    className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white text-sm font-bold rounded-lg py-2 transition-colors"
                  >
                    {sendingKey === 'd1' ? '발송 중...' : `미발송 ${pending?.d1.pending ?? 0}명에게 발송`}
                  </button>
                </div>

                {/* 일정/장소 변경 */}
                <div className="border border-slate-200 rounded-xl p-3.5">
                  <div className="text-sm font-bold text-slate-700 mb-1">일정/장소 변경 안내 (8번)</div>
                  <div className="text-xs text-slate-500 mb-2.5">노쇼확정 제외 전원에게 발송 (중복 방지 없음 — 변경 시마다 다시 보낼 수 있음).</div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input value={chg.oldDate} onChange={(e) => setChg((c) => ({ ...c, oldDate: e.target.value }))} placeholder="변경 전 일시" className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:border-sky-400" />
                    <input value={chg.oldLocation} onChange={(e) => setChg((c) => ({ ...c, oldLocation: e.target.value }))} placeholder="변경 전 장소" className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:border-sky-400" />
                    <input value={chg.newDate} onChange={(e) => setChg((c) => ({ ...c, newDate: e.target.value }))} placeholder="변경 후 일시" className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:border-sky-400" />
                    <input value={chg.newLocation} onChange={(e) => setChg((c) => ({ ...c, newLocation: e.target.value }))} placeholder="변경 후 장소" className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:border-sky-400" />
                  </div>
                  <button
                    onClick={() => {
                      if (!chg.oldDate || !chg.oldLocation || !chg.newDate || !chg.newLocation) {
                        showToast('변경 전/후 일시·장소를 모두 입력해주세요', 'error'); return
                      }
                      runBatch('change', 'change', `${pending?.d1.total ?? 0}명에게 일정/장소 변경 안내를 보냅니다. 계속할까요?`, chg)
                    }}
                    disabled={sendingKey !== null}
                    className="w-full bg-slate-700 hover:bg-slate-800 disabled:opacity-40 text-white text-sm font-bold rounded-lg py-2 transition-colors"
                  >
                    {sendingKey === 'change' ? '발송 중...' : '변경 안내 발송'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

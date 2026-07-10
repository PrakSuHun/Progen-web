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

interface Recipient {
  id: string
  name: string
  type: 'crew' | 'guest'
  sent: boolean
}

interface RecipientsInfo {
  confirm: Recipient[]
  d1: Recipient[]
}

const EMPTY: Settings = { location: '', entry_time: '', materials: '', program_detail: '', kakao_chat_url: '' }

export function EventAlimtalkSettings({ isOpen, onClose, eventId }: Props) {
  const [tab, setTab] = useState<'info' | 'send'>('info')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Settings>(EMPTY)
  const [isPublic, setIsPublic] = useState(true)
  const [eventTitle, setEventTitle] = useState('')
  const [confirmReady, setConfirmReady] = useState(false)
  const [pending, setPending] = useState<PendingInfo | null>(null)
  const [recipients, setRecipients] = useState<RecipientsInfo | null>(null)
  const [selectedConfirm, setSelectedConfirm] = useState<Set<string>>(new Set())
  const [selectedD1, setSelectedD1] = useState<Set<string>>(new Set())
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
        setIsPublic(d.is_public !== false)
        setEventTitle(d.event?.title ?? '')
        setConfirmReady(!!d.confirmReady)
        setPending(d.pending ?? null)
        const recs: RecipientsInfo | null = d.recipients ?? null
        setRecipients(recs)
        // 미발송자 기본 전체 선택
        if (recs) {
          setSelectedConfirm(new Set(recs.confirm.filter((r) => !r.sent).map((r) => r.id)))
          setSelectedD1(new Set(recs.d1.filter((r) => !r.sent).map((r) => r.id)))
        } else {
          setSelectedConfirm(new Set())
          setSelectedD1(new Set())
        }
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
        body: JSON.stringify({ eventId, ...settings, is_public: isPublic }),
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
    extra?: Record<string, string | string[]>,
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
                {/* 내부/외부 행사 토글 */}
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs font-bold text-slate-500 mb-2">행사 유형</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`rounded-lg border px-3 py-2 text-left transition-colors ${isPublic ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className={`text-sm font-bold ${isPublic ? 'text-sky-700' : 'text-slate-500'}`}>외부 행사</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">신청폼 연결 · 자동 노출</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`rounded-lg border px-3 py-2 text-left transition-colors ${!isPublic ? 'border-slate-700 bg-slate-100' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className={`text-sm font-bold ${!isPublic ? 'text-slate-800' : 'text-slate-500'}`}>내부 행사</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">출석체크 전용 · 신청 X</div>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {isPublic
                      ? '웹 사전신청이 이 행사로 연결되고, 행사가 끝나면 다음 외부 행사가 자동으로 노출됩니다.'
                      : '웹 신청폼·자동 선택 대상에서 제외됩니다. 행사 당일 현장 체크인(/checkin)은 날짜에 맞춰 정상 동작해요. (설정은 저장을 눌러야 반영)'}
                  </p>
                </div>
                {isPublic ? (
                  <div className={`text-xs rounded-lg px-3 py-2 ${confirmReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {confirmReady
                      ? '✅ 참석 확정 알림톡 자동 발송 준비 완료'
                      : '⚠️ 아래 5개 항목을 모두 채워야 참석 확정 알림톡이 자동으로 나갑니다 (그 전까지는 보류 → 발송 탭에서 일괄 발송)'}
                  </div>
                ) : (
                  <div className="text-xs rounded-lg px-3 py-2 bg-slate-100 text-slate-500">
                    🔒 내부 행사 — 알림톡·신청폼이 필요 없어요. 아래 항목은 비워둬도 됩니다.
                  </div>
                )}
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
                  <RecipientChecklist
                    list={recipients?.confirm ?? []}
                    selected={selectedConfirm}
                    setSelected={setSelectedConfirm}
                    emptyText="발송 대상이 없습니다"
                  />
                  <button
                    onClick={() => runBatch(
                      'confirm', 'confirm',
                      `선택한 ${selectedConfirm.size}명에게 참석 확정 알림톡을 보냅니다. 계속할까요?`,
                      { registrationIds: Array.from(selectedConfirm) },
                    )}
                    disabled={!confirmReady || sendingKey !== null || selectedConfirm.size === 0}
                    className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-bold rounded-lg py-2 transition-colors"
                  >
                    {sendingKey === 'confirm' ? '발송 중...' : `선택한 ${selectedConfirm.size}명에게 발송`}
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
                  <RecipientChecklist
                    list={recipients?.d1 ?? []}
                    selected={selectedD1}
                    setSelected={setSelectedD1}
                    emptyText="발송 대상이 없습니다"
                  />
                  <button
                    onClick={() => runBatch(
                      'd1', 'd1',
                      `선택한 ${selectedD1.size}명에게 행사 전 공지를 보냅니다. 계속할까요?`,
                      { registrationIds: Array.from(selectedD1) },
                    )}
                    disabled={sendingKey !== null || selectedD1.size === 0}
                    className="mt-2 w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white text-sm font-bold rounded-lg py-2 transition-colors"
                  >
                    {sendingKey === 'd1' ? '발송 중...' : `선택한 ${selectedD1.size}명에게 발송`}
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

function RecipientChecklist({
  list,
  selected,
  setSelected,
  emptyText,
}: {
  list: Recipient[]
  selected: Set<string>
  setSelected: (s: Set<string>) => void
  emptyText: string
}) {
  const unsent = list.filter((r) => !r.sent)
  const sentList = list.filter((r) => r.sent)
  const allChecked = unsent.length > 0 && unsent.every((r) => selected.has(r.id))

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }
  const toggleAll = () => {
    if (allChecked) setSelected(new Set())
    else setSelected(new Set(unsent.map((r) => r.id)))
  }

  if (list.length === 0) {
    return <div className="text-xs text-slate-400 italic py-2">{emptyText}</div>
  }

  return (
    <div className="border border-slate-200 rounded-lg bg-slate-50/50">
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-200 bg-white rounded-t-lg">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            disabled={unsent.length === 0}
            className="w-3.5 h-3.5 accent-sky-500"
          />
          전체 {allChecked ? '해제' : '선택'} ({selected.size}/{unsent.length})
        </label>
        {sentList.length > 0 && (
          <span className="text-[10px] text-slate-400">발송 완료 {sentList.length}명 회색 표시</span>
        )}
      </div>
      <div className="max-h-40 overflow-y-auto px-1 py-1">
        {unsent.map((r) => (
          <label
            key={r.id}
            className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-white text-xs cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.has(r.id)}
              onChange={() => toggle(r.id)}
              className="w-3.5 h-3.5 accent-sky-500"
            />
            <span className="text-slate-700 font-medium">{r.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                r.type === 'crew' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {r.type === 'crew' ? '크루' : '게스트'}
            </span>
          </label>
        ))}
        {sentList.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-1.5 px-1.5 py-1 text-xs text-slate-300"
          >
            <span className="w-3.5 h-3.5 inline-flex items-center justify-center text-[10px]">✓</span>
            <span className="line-through">{r.name}</span>
            <span className="text-[10px]">({r.type === 'crew' ? '크루' : '게스트'})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

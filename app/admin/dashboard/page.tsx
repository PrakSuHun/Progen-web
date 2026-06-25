'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList,
} from 'recharts'
import { showToast } from '@/components/Toast'
import { EventAlimtalkSettings } from '@/components/dashboard/EventAlimtalkSettings'

// ───────────── Types ─────────────
type Tab = 'checkin' | 'team' | 'analysis' | 'members' | 'deposit'
type SortKey = 'none' | 'name' | 'school' | 'grade' | 'gender' | 'crew'
type DepositStatus = '미입금' | '입금' | '환불'

interface Attendee {
  registration_id: string
  name: string
  phone: string
  school: string
  grade: string
  age: string
  major: string
  gender: string
  is_member: boolean
  noshow_count: number
  is_crew: boolean
  status: string
  team_name: string | null
  deposit_status: DepositStatus
  refund_account: string | null
}

interface DashboardData {
  pre_registered_count: number
  checked_in_count: number
  noshow_count: number
  unassigned: Attendee[]
  assigned: Record<string, Attendee[]>
  not_arrived: Attendee[]
  noshow: Attendee[]
}

interface EventItem { id: string; title: string; event_date: string; auto_checkin_alimtalk?: boolean }

interface CrewMember {
  id: string; name: string; phone: string; school: string; grade: string
  age: string; major: string; path: string; project: string; gender: string
  motivation: string; role: string; status: string; is_member: boolean
  noshow_count: number; created_at: string; is_crew: boolean
  registration_id?: string; guest_id?: string; registered_at?: string
}

interface DistItem { name: string; count: number }
interface TagItem { tag: string; count: number }
interface SegPerson {
  name: string; school: string; grade: string; gender: string
  major?: string; phone?: string; path?: string; age?: string
  status?: string; is_member?: boolean; is_crew?: boolean
}

interface FullStats {
  section1: {
    all: { school: DistItem[]; grade: DistItem[]; path: DistItem[]; gender: DistItem[] }
    saengmyung: { school: DistItem[]; grade: DistItem[]; path: DistItem[]; gender: DistItem[] }
    people?: SegPerson[]
  }
  section2: {
    total_registrations: number
    checked_in_count: number
    total_crews: number
    total_guests: number
    guest_attended: number
    guest_attendance_rate: number
    crew_from_event: number
    guests_from_event: number
    crew_conversion_count: number
    crew_conversion_rate: number
    total_saengmyung: number
    guest_deposit_paid?: number
    guest_deposit_pending?: number
    guest_deposit_refunded?: number
  }
  section3: {
    total_responses: number
    would_return_count: number
    join_interest_count: number
    good_tags: TagItem[]
    bad_tags: TagItem[]
    responses: { good_points: string; bad_points: string }[]
  }
}

// ───────────── Helpers ─────────────
const PIE_COLORS = ['#0ea5e9', '#34d399', '#f472b6', '#60a5fa', '#fbbf24']
const FROM_NOT_ARRIVED = '__NOT_ARRIVED__'

function genderColor(gender: string) {
  if (gender === '남성' || gender === '남') return 'text-blue-600'
  if (gender === '여성' || gender === '여') return 'text-pink-600'
  return 'text-slate-400'
}

function sortAttendees(list: Attendee[], sortBy: SortKey): Attendee[] {
  if (sortBy === 'none') return list
  return [...list].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'ko')
    if (sortBy === 'school') return a.school.localeCompare(b.school, 'ko')
    if (sortBy === 'grade') return a.grade.localeCompare(b.grade, 'ko')
    if (sortBy === 'gender') return a.gender.localeCompare(b.gender, 'ko')
    return 0
  })
}

// ───────────── Sub-components ─────────────
function MiniBarChart({ data, color = '#0ea5e9', onPick }: { data: DistItem[]; color?: string; onPick?: (name: string) => void }) {
  if (!data.length) return <p className="text-slate-400 text-sm py-4 text-center">데이터 없음</p>
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 4 }}>
        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
        <Tooltip cursor={{ fill: 'rgba(14,165,233,0.06)' }} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
        <Bar
          dataKey="count"
          fill={color}
          radius={[4, 4, 0, 0]}
          style={{ cursor: onPick ? 'pointer' : 'default' }}
          onClick={(d: any) => onPick?.(d?.payload?.name ?? d?.name)}
        >
          <LabelList dataKey="count" position="top" style={{ fill: '#374151', fontSize: 10, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function MiniPieChart({ data, onPick }: { data: DistItem[]; onPick?: (name: string) => void }) {
  if (!data.length) return <p className="text-slate-400 text-sm py-4 text-center">데이터 없음</p>
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius={70}
          style={{ cursor: onPick ? 'pointer' : 'default' }}
          onClick={(d: any) => onPick?.(d?.payload?.name ?? d?.name)}
        >
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
        <Legend
          formatter={(value) => <span style={{ color: '#374151', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

function DepositRow({ guest, onCycle, onSaveAccount, onSendCancel }: {
  guest: Attendee
  onCycle: () => void
  onSaveAccount: (val: string) => void
  onSendCancel: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(guest.refund_account ?? '')
  const status = guest.deposit_status ?? '미입금'

  useEffect(() => {
    if (!editing) setDraft(guest.refund_account ?? '')
  }, [guest.refund_account, editing])

  const save = () => { onSaveAccount(draft); setEditing(false) }

  return (
    <div className="px-3 md:px-4 py-3 flex items-start md:items-center gap-3 flex-wrap md:flex-nowrap">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <span>{guest.name}</span>
          {guest.is_member && <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />}
          <span className="text-slate-300 text-xs">·</span>
          <a href={`tel:${guest.phone}`} className="text-sky-500 hover:text-sky-600 text-xs font-normal">{guest.phone}</a>
        </div>
        <div className="mt-1.5">
          {editing ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setEditing(false); setDraft(guest.refund_account ?? '') } }}
                placeholder="예: 하나은행 110-123-456789"
                className="flex-1 min-w-[200px] bg-white border border-sky-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-sky-100"
              />
              <button onClick={save} className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors">저장</button>
              <button onClick={() => { setEditing(false); setDraft(guest.refund_account ?? '') }} className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs px-2.5 py-1.5 rounded-lg transition-colors">취소</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {guest.refund_account
                ? <span className="text-slate-700 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 break-all">{guest.refund_account}</span>
                : <span className="text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">계좌 미입력</span>}
              <button onClick={() => setEditing(true)} className="text-sky-500 hover:text-sky-600 text-xs font-medium">수정</button>
            </div>
          )}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <button
          onClick={onSendCancel}
          className="text-[11px] text-red-400 hover:text-red-600 hover:underline"
          title="신청 취소 알림톡 발송 (실제 삭제는 신청자 탭에서 별도로)"
        >
          취소 알림
        </button>
        <button
          onClick={onCycle}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition
            ${status === '입금'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
              : status === '환불'
                ? 'bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100'
                : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'}`}
          title="클릭 시 다음 상태로 (미입금 → 입금 → 환불)"
        >
          {status === '입금' ? '✓ 입금' : status === '환불' ? '↩ 환불' : '✗ 미입금'}
        </button>
      </div>
    </div>
  )
}

function PersonCard({ person, showPhone = false, dimmed = false, draggable: isDraggable = false, onDragStart, onTap, isSelected = false, showDeposit = false, onCycleDeposit }: {
  person: Attendee
  showPhone?: boolean
  dimmed?: boolean
  draggable?: boolean
  onDragStart?: () => void
  onTap?: (e?: React.MouseEvent) => void
  isSelected?: boolean
  showDeposit?: boolean
  onCycleDeposit?: (registration_id: string) => void
}) {
  const isTarget = person.noshow_count >= 2
  const isNoshow = person.status === '노쇼확정'
  const isNotArrived = person.status === '사전신청'
  return (
    <div
      data-person
      draggable={isDraggable}
      onDragStart={onDragStart}
      onClick={(e) => { e.stopPropagation(); onTap?.(e) }}
      className={`px-3 py-2 rounded-lg text-sm select-none transition-all w-full
        ${isDraggable || onTap ? 'cursor-pointer' : ''}
        ${isDraggable ? 'active:cursor-grabbing' : ''}
        ${dimmed ? 'opacity-50' : ''}
        ${isSelected
          ? 'bg-sky-100 border-2 border-sky-500 shadow-md'
          : isNoshow
            ? 'bg-red-50 border-2 border-red-400'
            : isTarget
              ? 'bg-red-50 border border-red-300'
              : isNotArrived
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-slate-50 border border-slate-200'
        }`}
    >
      <div className="flex items-center gap-1 font-medium text-slate-800">
        <span>{person.name}</span>
        {person.is_member && <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />}
        {isNoshow && (
          <span className="text-red-500 text-xs font-bold">노쇼</span>
        )}
        {isNotArrived && (
          <span className="text-amber-600 text-xs font-normal">미출석</span>
        )}
        {person.team_name && (
          <span className="ml-auto text-sky-500 text-xs font-normal">{person.team_name}</span>
        )}
        {isTarget && !person.team_name && (
          <span className="ml-auto text-red-500 text-xs font-normal">박탈대상</span>
        )}
      </div>
      <div className="text-xs mt-0.5 flex items-center gap-1 flex-wrap">
        <span className="text-slate-500">{person.school}</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-500">{person.grade}</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-500">{person.age}세</span>
        <span className="text-slate-300">·</span>
        <span className={genderColor(person.gender)}>{person.gender}</span>
      </div>
      {person.major && (
        <div className="text-xs text-slate-400 mt-0.5">{person.major}</div>
      )}
      {showPhone && person.phone && (
        <a
          href={`tel:${person.phone}`}
          className="text-xs text-sky-500 hover:text-sky-600 mt-0.5 block"
          onClick={(e) => e.stopPropagation()}
        >
          {person.phone}
        </a>
      )}
      {showDeposit && !person.is_crew && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCycleDeposit?.(person.registration_id) }}
          className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition
            ${person.deposit_status === '입금'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
              : person.deposit_status === '환불'
                ? 'bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100'
                : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'}`}
          title="클릭 시 다음 상태로 (미입금 → 입금 → 환불)"
        >
          보증금 {person.deposit_status === '입금' ? '✓ 입금' : person.deposit_status === '환불' ? '↩ 환불' : '✗ 미입금'}
        </button>
      )}
    </div>
  )
}

function TeamCard({ teamName, members, onDrop, onDragStartMember, onRename, onDelete, onTapAssign, onTapSelectMember, selectedId }: {
  teamName: string
  members: Attendee[]
  onDrop: (t: string) => void
  onDragStartMember: (p: Attendee, from: string) => void
  onRename: (old: string, next: string) => void
  onDelete: (t: string) => void
  onTapAssign?: () => void
  onTapSelectMember?: (p: Attendee) => void
  selectedId?: string
}) {
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState(teamName)
  const [over, setOver] = useState(false)
  const podoOnly = members.length > 0 && members.every((m) => m.is_member)
  const checkedInCount = members.filter((m) => m.status === '출석완료').length
  const hasNoshowIssue = members.length > 0 && checkedInCount <= 2 && checkedInCount < members.length

  const confirmRename = () => {
    const t = inputVal.trim()
    if (t && t !== teamName) onRename(teamName, t)
    setEditing(false)
  }

  return (
    <div
      className={`relative bg-white border-2 rounded-xl p-3 min-h-[120px] transition-colors
        ${over ? 'border-sky-400 bg-sky-50 shadow-md'
          : hasNoshowIssue ? 'border-orange-400 bg-orange-50/30 shadow-sm'
          : 'border-slate-200 shadow-sm'}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { setOver(false); onDrop(teamName) }}
      onClick={(e) => { if ((e.target as HTMLElement).closest('button, input')) return; onTapAssign?.() }}
    >
      {podoOnly && <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-sky-500" />}
      <button
        onClick={() => onDelete(teamName)}
        className="absolute top-1.5 right-2 text-slate-300 hover:text-red-400 transition-colors text-xs leading-none"
        title="팀 삭제"
      >✕</button>
      <div className="mb-2">
        {editing ? (
          <input autoFocus value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={confirmRename}
            onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
            className="bg-slate-50 text-slate-800 text-sm font-semibold px-2 py-0.5 rounded w-full outline-none border border-sky-400"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-slate-800 text-sm font-semibold hover:text-sky-500 transition-colors">
            {teamName}
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {members.map((m) => (
          <div key={m.registration_id} draggable onDragStart={() => onDragStartMember(m, teamName)} className="cursor-grab">
            <PersonCard person={m} onTap={() => onTapSelectMember?.(m)} isSelected={selectedId === m.registration_id} />
          </div>
        ))}
        {Array.from({ length: Math.max(0, 4 - members.length) }).map((_, i) => (
          <div key={i} className="h-8 rounded-lg border border-dashed border-slate-200 bg-slate-50/50" />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        {hasNoshowIssue ? (
          <span className="text-orange-500 font-bold">출석 {checkedInCount}명</span>
        ) : <span />}
        <span className="text-slate-400">{members.length} / 4</span>
      </div>
    </div>
  )
}

// ───────────── Main Page ─────────────
export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('checkin')
  const [data, setData] = useState<DashboardData | null>(null)
  const [fullStats, setFullStats] = useState<FullStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoMatchLoading, setAutoMatchLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('none')
  const dragRef = useRef<{ person: Attendee; fromTeam: string | null } | null>(null)
  const knownTeamsRef = useRef<Set<string>>(new Set())

  // 터치(iPad) 탭 배정용
  const [selected, setSelected] = useState<{ person: Attendee; fromTeam: string | null } | null>(null)

  // Event selector
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [activeEventId, setActiveEventId] = useState<string>('')
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Cohort(기수) selector — events를 기수로 스코프. 기본 현재 기수, 'all'=전체
  const [cohorts, setCohorts] = useState<{ id: number; number: number; name: string; is_current: boolean }[]>([])
  const [cohortFilter, setCohortFilter] = useState<string>('') // ''=현재 기수(기본), 숫자=특정, 'all'=전체

  // Deposit tab
  const [depositSearch, setDepositSearch] = useState('')

  // Members tab
  const [members, setMembers] = useState<CrewMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [memberSort, setMemberSort] = useState<SortKey>('none')
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null)

  const loadEvents = async (cohortParam?: string) => {
    const qs = cohortParam ? `?cohort_id=${cohortParam}` : ''
    const res = await fetch(`/api/admin/events${qs}`)
    if (res.ok) {
      const json = await res.json()
      const list: EventItem[] = (json.data ?? json).map((e: any) => ({ id: e.id, title: e.title, event_date: e.event_date, auto_checkin_alimtalk: e.auto_checkin_alimtalk ?? false }))
      setEvents(list)
      setActiveEventId(json.activeEventId ?? '')
      if (json.cohorts) setCohorts(json.cohorts)
      if (list.length > 0) {
        // 서버에서 내려준 activeEventId(다음 예정 행사)를 기본값으로 사용
        const activeId = json.activeEventId
        const defaultId = activeId && list.some((e) => e.id === activeId) ? activeId : list[0].id
        setSelectedEventId(defaultId)
        fetchAll(defaultId)
      } else {
        setSelectedEventId('')
        fetchAll()
      }
    } else {
      fetchAll()
    }
  }

  useEffect(() => {
    loadEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCohortChange = (val: string) => {
    setCohortFilter(val)
    setMembers([])
    loadEvents(val || undefined)
  }

  const fetchAll = async (eventId?: string) => {
    setLoading(true)
    const eid = eventId || selectedEventId
    const qs = eid ? `?eventId=${eid}` : ''
    try {
      await fetch('/api/admin/compact-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: eid }),
      })

      const [dashRes, statsRes] = await Promise.all([
        fetch(`/api/admin/dashboard-data${qs}`),
        fetch(`/api/admin/full-stats${qs}`),
      ])
      if (dashRes.status === 401) { router.push('/admin'); return }
      if (dashRes.ok) {
        const newData: DashboardData = await dashRes.json()
        knownTeamsRef.current = new Set(Object.keys(newData.assigned))
        for (const name of knownTeamsRef.current) {
          if (!newData.assigned[name]) newData.assigned[name] = []
        }
        setData(newData)
      }
      if (statsRes.ok) setFullStats(await statsRes.json())
    } catch {
      showToast('데이터를 불러올 수 없습니다', 'error')
    } finally {
      setLoading(false)
    }
  }

  const isCrewMode = selectedEventId === 'crew-all'

  const handleEventChange = (newEventId: string) => {
    setSelectedEventId(newEventId)
    if (newEventId === 'crew-all') {
      setActiveTab('analysis')
      setMembersMode('all')
    }
    fetchAll(newEventId)
    setMembers([])
  }

  const [membersMode, setMembersMode] = useState<'event' | 'all'>('event')
  const [addCrewOpen, setAddCrewOpen] = useState(false)

  const fetchMembers = async (mode?: 'event' | 'all') => {
    setMembersLoading(true)
    const m = mode ?? membersMode
    const qs = m === 'all' ? '?mode=all' : `?eventId=${selectedEventId}`
    try {
      const res = await fetch(`/api/admin/members-list${qs}`)
      if (res.ok) {
        const json = await res.json()
        setMembers(json.members ?? [])
      }
    } catch { showToast('신청자 목록을 불러올 수 없습니다', 'error') }
    finally { setMembersLoading(false) }
  }

  useEffect(() => {
    if (activeTab === 'members' && selectedEventId) fetchMembers()
    if (activeTab === 'analysis' && selectedEventId) fetchReports()
  }, [activeTab, selectedEventId])

  const assignTeam = (registration_id: string, team_name: string | null) =>
    fetch('/api/admin/assign-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_id, team_name }),
    })

  // 탭(터치) 선택 → 배정
  const handleTapSelect = (person: Attendee, fromTeam: string | null) => {
    if (selected?.person.registration_id === person.registration_id) {
      setSelected(null) // 같은 사람 다시 탭하면 선택 해제
    } else {
      setSelected({ person, fromTeam })
    }
  }

  const handleTapAssign = (targetTeam: string | null) => {
    if (!selected) return
    dragRef.current = selected
    setSelected(null)
    handleDrop(targetTeam)
  }

  const handleDrop = (targetTeam: string | null) => {
    if (!dragRef.current || !data) return
    const { person, fromTeam } = dragRef.current
    dragRef.current = null
    if (fromTeam === targetTeam) return

    setData((prev) => {
      if (!prev) return prev
      let newUnassigned = [...prev.unassigned]
      let newNotArrived = [...prev.not_arrived]
      const newAssigned: Record<string, Attendee[]> = {}
      for (const k of Object.keys(prev.assigned)) newAssigned[k] = [...prev.assigned[k]]

      if (fromTeam === null) {
        newUnassigned = newUnassigned.filter((a) => a.registration_id !== person.registration_id)
      } else if (fromTeam === FROM_NOT_ARRIVED) {
        newNotArrived = newNotArrived.filter((a) => a.registration_id !== person.registration_id)
      } else {
        newAssigned[fromTeam] = (newAssigned[fromTeam] || []).filter((a) => a.registration_id !== person.registration_id)
      }

      if (targetTeam === null) {
        if (person.status === '사전신청') {
          newNotArrived = [{ ...person, team_name: null }, ...newNotArrived]
        } else {
          newUnassigned = [{ ...person, team_name: null }, ...newUnassigned]
        }
      } else {
        if (!newAssigned[targetTeam]) newAssigned[targetTeam] = []
        if (newAssigned[targetTeam].length >= 4) {
          showToast('팀이 가득 찼습니다 (최대 4명)', 'error')
          return prev
        }
        newAssigned[targetTeam] = [...newAssigned[targetTeam], { ...person, team_name: targetTeam }]
      }
      return { ...prev, unassigned: newUnassigned, not_arrived: newNotArrived, assigned: newAssigned }
    })
    if (targetTeam) knownTeamsRef.current.add(targetTeam)
    assignTeam(person.registration_id, targetTeam)
  }

  const handleDropOnNewTeam = () => {
    if (!data) return
    const allNums = [...Object.keys(data.assigned), ...knownTeamsRef.current]
      .map((n) => parseInt(n)).filter((n) => !isNaN(n))
    const next = allNums.length > 0 ? Math.max(...allNums) + 1 : 1
    const newTeamName = `${next}팀`
    knownTeamsRef.current.add(newTeamName)
    handleDrop(newTeamName)
  }

  const handleRenameTeam = (oldName: string, newName: string) => {
    if (!data) return
    if (data.assigned[newName]) { showToast('이미 존재하는 팀명입니다', 'error'); return }
    const members = data.assigned[oldName] || []
    knownTeamsRef.current.delete(oldName)
    knownTeamsRef.current.add(newName)
    setData((prev) => {
      if (!prev) return prev
      const a = { ...prev.assigned }
      a[newName] = a[oldName]; delete a[oldName]
      return { ...prev, assigned: a }
    })
    members.forEach((m) => assignTeam(m.registration_id, newName))
  }

  const handleAutoMatch = async () => {
    setAutoMatchLoading(true)
    try {
      const clientMaxTeam = Object.keys(data?.assigned ?? {}).length
      const res = await fetch('/api/admin/auto-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientMaxTeam, eventId: selectedEventId, teamSize }),
      })
      const d = await res.json()
      if (res.ok) { showToast('자동 매칭 완료!', 'success'); await fetchAll() }
      else showToast(d.message || '오류 발생', 'error')
    } catch { showToast('오류가 발생했습니다', 'error') }
    finally { setAutoMatchLoading(false) }
  }

  const handleDeleteTeam = async (teamName: string) => {
    if (!data) return
    const members = data.assigned[teamName] ?? []

    knownTeamsRef.current.delete(teamName)
    setData((prev) => {
      if (!prev) return prev
      const newAssigned = { ...prev.assigned }
      delete newAssigned[teamName]
      return {
        ...prev,
        unassigned: [...members.map((m) => ({ ...m, team_name: null })), ...prev.unassigned],
        assigned: newAssigned,
      }
    })

    await Promise.all(members.map((m) => assignTeam(m.registration_id, null)))
    await fetch('/api/admin/compact-teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: selectedEventId }),
    })
    await fetchAll()
  }

  const handleCycleDeposit = async (registration_id: string) => {
    // 현재 상태가 '미입금'이면 다음은 '입금' = 게스트에게 참석 확정 알림톡 발송 → 사고 방지용 확인
    const allAttendees = [
      ...(data?.unassigned ?? []), ...(data?.not_arrived ?? []), ...(data?.noshow ?? []),
      ...Object.values(data?.assigned ?? {}).flat(),
    ]
    const curDeposit = (allAttendees.find((a) => a.registration_id === registration_id)?.deposit_status ?? '미입금') as DepositStatus
    if (curDeposit === '미입금') {
      if (!window.confirm('보증금을 입금 처리합니다.\n해당 게스트에게 참석 확정 알림톡이 발송됩니다.\n계속할까요?')) return
    }
    const NEXT: Record<DepositStatus, DepositStatus> = { '미입금': '입금', '입금': '환불', '환불': '미입금' }
    let nextStatus: DepositStatus = '입금'
    setData((prev) => {
      if (!prev) return prev
      const flip = (a: Attendee) => {
        if (a.registration_id !== registration_id) return a
        const cur = (a.deposit_status ?? '미입금') as DepositStatus
        nextStatus = NEXT[cur] ?? '입금'
        return { ...a, deposit_status: nextStatus }
      }
      const newAssigned: Record<string, Attendee[]> = {}
      for (const [k, v] of Object.entries(prev.assigned)) newAssigned[k] = v.map(flip)
      return {
        ...prev,
        unassigned: prev.unassigned.map(flip),
        not_arrived: prev.not_arrived.map(flip),
        noshow: prev.noshow.map(flip),
        assigned: newAssigned,
      }
    })
    try {
      const res = await fetch('/api/admin/toggle-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id }),
      })
      if (!res.ok) {
        showToast('보증금 상태 변경 실패', 'error')
        await fetchAll()
      } else {
        const d = await res.json().catch(() => ({} as { alimtalk?: { sent?: boolean; pendingEventSettings?: boolean } }))
        if (d?.alimtalk?.pendingEventSettings) {
          showToast('입금 처리됨 · 행사 정보가 비어 있어 확정 알림톡은 보류 (설정 → 발송 탭에서 일괄 발송)', 'success')
        } else if (d?.alimtalk?.sent) {
          showToast('입금 처리됨 · 참석 확정 알림톡 발송됨', 'success')
        }
      }
    } catch {
      showToast('오류 발생', 'error')
      await fetchAll()
    }
  }

  const handleSaveRefundAccount = async (registration_id: string, refund_account: string) => {
    const trimmed = refund_account.trim() || null
    setData((prev) => {
      if (!prev) return prev
      const flip = (a: Attendee) => a.registration_id === registration_id ? { ...a, refund_account: trimmed } : a
      const newAssigned: Record<string, Attendee[]> = {}
      for (const [k, v] of Object.entries(prev.assigned)) newAssigned[k] = v.map(flip)
      return {
        ...prev,
        unassigned: prev.unassigned.map(flip),
        not_arrived: prev.not_arrived.map(flip),
        noshow: prev.noshow.map(flip),
        assigned: newAssigned,
      }
    })
    try {
      const res = await fetch('/api/admin/update-refund-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id, refund_account: trimmed }),
      })
      if (!res.ok) {
        showToast('환불 계좌 저장 실패', 'error')
        await fetchAll()
      } else {
        showToast('환불 계좌가 저장되었습니다', 'success')
      }
    } catch {
      showToast('오류 발생', 'error')
      await fetchAll()
    }
  }

  // 보증금 탭: "취소 알림" 버튼 → 5번(신청 취소 확인) 알림톡 수동 발송. 실제 행 삭제는 운영진이 신청자 탭에서 직접.
  const handleSendCancelAlimtalk = async (registration_id: string, name: string) => {
    if (!window.confirm(`${name}님께 신청 취소 알림톡을 보냅니다.\n(실제 신청 삭제는 신청자 탭에서 따로 하세요.)\n계속할까요?`)) return
    try {
      const res = await fetch('/api/admin/send-cancel-alimtalk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id }),
      })
      const d = await res.json().catch(() => ({} as { message?: string; sent?: boolean }))
      if (res.ok && d?.sent) showToast(d.message || '취소 알림톡 발송 완료', 'success')
      else showToast(d?.message || '발송 실패', res.ok ? 'error' : 'error')
    } catch {
      showToast('발송 중 오류가 발생했습니다', 'error')
    }
  }

  // 상태 변경은 문자 없이 조용히 처리 (사전 불참 통보자도 부담 없이 체크/해제). 문자는 개별 버튼으로 따로.
  const handleUpdateStatus = async (registration_id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id, status: newStatus }),
      })
      if (res.ok) {
        showToast(newStatus === '출석완료' ? '출석 처리됨' : newStatus === '노쇼확정' ? '노쇼 확정됨' : '미출석으로 변경됨', 'success')
        await fetchAll()
      } else {
        const d = await res.json()
        showToast(d.message || '상태 변경 실패', 'error')
      }
    } catch { showToast('오류 발생', 'error') }
  }

  // 개별 문자 수동 발송 — type='checkin'(출석문자 6/7) / 'noshow'(노쇼경고 9·10, 크루 한정)
  const handleSendIndividual = async (registration_id: string, type: 'checkin' | 'noshow', label: string) => {
    if (!window.confirm(`${label}을(를) 발송할까요?`)) return
    try {
      const res = await fetch('/api/admin/send-individual-alimtalk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id, type }),
      })
      const d = await res.json().catch(() => ({} as { message?: string; sent?: boolean }))
      showToast(d?.message || (res.ok ? '발송 완료' : '발송 실패'), res.ok && d?.sent ? 'success' : 'error')
    } catch { showToast('발송 중 오류가 발생했습니다', 'error') }
  }

  // 활성 행사 자동 출석문자 토글 (events.auto_checkin_alimtalk)
  const handleToggleAutoCheckin = async (eventId: string, enabled: boolean) => {
    try {
      const res = await fetch('/api/admin/toggle-auto-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, enabled }),
      })
      const d = await res.json().catch(() => ({} as { message?: string }))
      if (res.ok) {
        setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, auto_checkin_alimtalk: enabled } : e)))
        showToast(d?.message || (enabled ? '자동 출석문자 ON' : '자동 출석문자 OFF'), 'success')
      } else showToast(d?.message || '변경 실패', 'error')
    } catch { showToast('오류 발생', 'error') }
  }

  const handleReset = async () => {
    if (!confirm('모든 팀 배정을 초기화하시겠습니까?')) return
    setResetLoading(true)
    try {
      const res = await fetch('/api/admin/reset-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEventId }),
      })
      const d = await res.json()
      if (res.ok) {
        knownTeamsRef.current.clear()
        showToast('팀 배정이 초기화되었습니다', 'success')
        await fetchAll()
      } else showToast(d.message || '오류 발생', 'error')
    } catch { showToast('오류가 발생했습니다', 'error') }
    finally { setResetLoading(false) }
  }

  // ── Tab 1: 출석체크 ──
  const renderCheckin = () => {
    const pre = data?.pre_registered_count ?? 0
    const arrived = data?.checked_in_count ?? 0
    const noshowTotal = data?.noshow_count ?? 0
    const missing = Math.max(0, pre - arrived - noshowTotal)

    const assignedAll = Object.values(data?.assigned ?? {}).flat()
    const allCheckedIn = [
      ...(data?.unassigned ?? []),
      ...assignedAll.filter((p) => p.status === '출석완료'),
    ]
    const notArrived = [
      ...(data?.not_arrived ?? []),
      ...assignedAll.filter((p) => p.status === '사전신청'),
    ]
    const noshowList = [
      ...(data?.noshow ?? []),
      ...assignedAll.filter((p) => p.status === '노쇼확정'),
    ]

    // 보증금 통계 (게스트만 대상, 노쇼확정 제외)
    const allGuests = [...allCheckedIn, ...notArrived].filter((p) => !p.is_crew)
    const guestPaid = allGuests.filter((p) => p.deposit_status === '입금').length
    const guestRefunded = allGuests.filter((p) => p.deposit_status === '환불').length
    const guestUnpaid = allGuests.filter((p) => p.deposit_status === '미입금' || !p.deposit_status).length

    const q = searchQuery.toLowerCase()
    const filterFn = (p: Attendee) => !q || p.name.toLowerCase().includes(q) || p.school.toLowerCase().includes(q)
    const filteredCheckedIn = sortAttendees(allCheckedIn.filter(filterFn), sortBy)
    const filteredNotArrived = sortAttendees(notArrived.filter(filterFn), sortBy)
    const filteredNoshow = sortAttendees(noshowList.filter(filterFn), sortBy)

    const SORT_OPTIONS: { key: SortKey; label: string }[] = [
      { key: 'none', label: '기본' },
      { key: 'name', label: '가나다' },
      { key: 'school', label: '학교' },
      { key: 'grade', label: '학년' },
      { key: 'gender', label: '성별' },
    ]

    const StatusBtn = ({ label, color, onClick }: { label: string; color: string; onClick: () => void }) => (
      <button onClick={onClick} className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${color}`}>{label}</button>
    )

    // 자동 출석문자 토글 — 현장 체크인(/checkin)은 항상 활성 행사만 처리하므로, 선택 행사가 활성 행사일 때만 의미 있음
    const isActiveEvent = !isCrewMode && !!selectedEventId && selectedEventId === activeEventId
    const autoCheckinOn = events.find((e) => e.id === selectedEventId)?.auto_checkin_alimtalk ?? false

    return (
      <div className="p-4 md:p-6 overflow-y-auto h-full">
        {/* 숫자 카드 */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 mb-3">
          {[
            { label: '오기로 한 인원', value: pre, color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
            { label: '출석', value: arrived, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
            { label: '미출석', value: missing, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
            { label: '노쇼확정', value: noshowTotal, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} border rounded-2xl p-3 md:p-5 text-center`}>
              <div className={`text-2xl md:text-4xl font-bold ${color}`}>{value}</div>
              <div className="text-slate-600 text-[10px] md:text-sm mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* 게스트 보증금 입금 현황 */}
        {allGuests.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4 mb-5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">게스트 보증금</span>
              <span className="text-emerald-700 font-bold text-sm bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">입금 {guestPaid}</span>
              <span className="text-amber-700 font-bold text-sm bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">미입금 {guestUnpaid}</span>
              <span className="text-sky-700 font-bold text-sm bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5">환불 {guestRefunded}</span>
              <span className="text-slate-400 text-xs">/ 총 {allGuests.length}명</span>
            </div>
            <p className="text-slate-400 text-[11px]">뱃지 클릭 시 미입금 → 입금 → 환불 순서로 변경됩니다.</p>
          </div>
        )}

        {/* 검색 + 정렬 */}
        <div className="flex items-center gap-2 md:gap-3 mb-4 flex-wrap">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름 또는 학교 검색..."
            className="bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 w-48 md:w-52 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 shadow-sm"
          />
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-xs mr-1">정렬:</span>
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors font-medium
                  ${sortBy === key ? 'bg-sky-500 text-white shadow-sm' : 'bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 세 열: 미출석 → 출석 → 노쇼 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 미출석 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-slate-800 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              미출석 <span className="text-amber-500 font-normal text-sm">{notArrived.length}명</span>
            </h3>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {filteredNotArrived.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-6">{q ? '검색 결과 없음' : '모두 출석했습니다'}</p>
              )}
              {filteredNotArrived.map((p) => (
                <div key={p.registration_id} className="flex items-center gap-1.5">
                  <div className="flex-1"><PersonCard person={p} showPhone showDeposit onCycleDeposit={handleCycleDeposit} /></div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <StatusBtn label="출석" color="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200" onClick={() => handleUpdateStatus(p.registration_id, '출석완료')} />
                    <StatusBtn label="노쇼" color="bg-red-50 text-red-500 hover:bg-red-100 border border-red-200" onClick={() => handleUpdateStatus(p.registration_id, '노쇼확정')} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 출석완료 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <h3 className="text-slate-800 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                출석완료 <span className="text-emerald-600 font-normal text-sm">{allCheckedIn.length}명</span>
              </h3>
              {/* 자동문자 토글 — 활성 행사에서만 노출 (현장 체크인은 활성 행사만 처리) */}
              {isActiveEvent && (
                <button
                  onClick={() => handleToggleAutoCheckin(selectedEventId, !autoCheckinOn)}
                  title="현장 체크인(/checkin) 시 출석문자(6/7번) 자동 발송 여부"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors
                    ${autoCheckinOn ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${autoCheckinOn ? 'bg-white' : 'bg-slate-400'}`} />
                  자동문자 {autoCheckinOn ? 'ON' : 'OFF'}
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {filteredCheckedIn.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-6">{q ? '검색 결과 없음' : '아직 출석자가 없습니다'}</p>
              )}
              {filteredCheckedIn.map((p) => (
                <div key={p.registration_id} className="flex items-center gap-1.5">
                  <div className="flex-1"><PersonCard person={p} showDeposit onCycleDeposit={handleCycleDeposit} /></div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <StatusBtn label="출석문자" color="bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200" onClick={() => handleSendIndividual(p.registration_id, 'checkin', '출석 문자')} />
                    <StatusBtn label="미출석" color="bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200" onClick={() => handleUpdateStatus(p.registration_id, '사전신청')} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 노쇼확정 */}
          <div className="bg-white border-2 border-red-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-slate-800 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              노쇼확정 <span className="text-red-500 font-normal text-sm">{noshowList.length}명</span>
            </h3>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {filteredNoshow.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-6">{q ? '검색 결과 없음' : '노쇼 확정자 없음'}</p>
              )}
              {filteredNoshow.map((p) => (
                <div key={p.registration_id} className="flex items-center gap-1.5">
                  <div className="flex-1"><PersonCard person={p} showPhone showDeposit onCycleDeposit={handleCycleDeposit} /></div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {/* 노쇼 경고는 크루 한정 (게스트는 보증금 미환불 페널티) */}
                    {p.is_crew && (
                      <StatusBtn label="노쇼경고" color="bg-red-50 text-red-500 hover:bg-red-100 border border-red-200" onClick={() => handleSendIndividual(p.registration_id, 'noshow', '노쇼 경고 알림톡')} />
                    )}
                    <StatusBtn label="해제" color="bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200" onClick={() => handleUpdateStatus(p.registration_id, '사전신청')} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Tab 2: 팀 배정 ──
  const [teamPanelOpen, setTeamPanelOpen] = useState(false)
  const [teamSize, setTeamSize] = useState(4)
  const [teamSearch, setTeamSearch] = useState('')
  const [teamSort, setTeamSort] = useState<SortKey>('name')

  const renderTeam = () => {
    const unassigned = data?.unassigned ?? []
    const assigned = data?.assigned ?? {}
    const notArrived = data?.not_arrived ?? []
    const teamNames = Object.keys(assigned).sort((a, b) => {
      const na = parseInt(a); const nb = parseInt(b)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return a.localeCompare(b)
    })
    const allNums = teamNames.map((n) => parseInt(n)).filter((n) => !isNaN(n))
    const nextNum = allNums.length > 0 ? Math.max(...allNums) + 1 : 1

    const sortByName = (a: Attendee, b: Attendee) => a.name.localeCompare(b.name, 'ko')
    // 미배정 패널 정렬 — teamSort 버튼으로 선택. 동률이면 가나다순.
    const teamSortFn = (a: Attendee, b: Attendee): number => {
      if (teamSort === 'crew') return a.is_member === b.is_member ? sortByName(a, b) : a.is_member ? -1 : 1
      if (teamSort === 'school') return (a.school || '').localeCompare(b.school || '', 'ko') || sortByName(a, b)
      if (teamSort === 'grade') return (a.grade || '').localeCompare(b.grade || '', 'ko') || sortByName(a, b)
      if (teamSort === 'gender') return (a.gender || '').localeCompare(b.gender || '', 'ko') || sortByName(a, b)
      return sortByName(a, b) // 'name' 등 기본
    }
    const TEAM_SORT_OPTIONS: { key: SortKey; label: string }[] = [
      { key: 'name', label: '가나다' },
      { key: 'school', label: '학교' },
      { key: 'grade', label: '학년' },
      { key: 'gender', label: '성별' },
      { key: 'crew', label: '포도' },
    ]
    const unassignedSorted = [...unassigned].sort(teamSortFn)
    const notArrivedSorted = [...notArrived].sort(teamSortFn)

    // 검색: 미배정 + 미출석 + 팀 배정자 모두 대상. 이름/연락처 부분 일치.
    const q = teamSearch.trim().toLowerCase()
    const allPeople: { person: Attendee; fromTeam: string | null }[] = [
      ...unassigned.map((p) => ({ person: p, fromTeam: null as string | null })),
      ...notArrived.map((p) => ({ person: p, fromTeam: FROM_NOT_ARRIVED as string | null })),
      ...teamNames.flatMap((t) => (assigned[t] || []).map((p) => ({ person: p, fromTeam: t as string | null }))),
    ]
    const searchResults = q
      ? allPeople
          .filter(({ person }) =>
            person.name.toLowerCase().includes(q) ||
            (person.phone || '').toLowerCase().includes(q),
          )
          .sort((a, b) => teamSortFn(a.person, b.person))
      : []

    // 공통 미배정 패널 내용 (※ 컴포넌트가 아닌 JSX 표현식. 컴포넌트로 만들면 매 렌더마다
    //   재마운트되어 검색 input의 포커스가 즉시 유실됨 — 한 글자만 입력되는 버그 원인.)
    const unassignedContent = (
      <>
        {selected && (
          <div className="px-3 py-2 bg-sky-50 border-b border-sky-200 text-xs text-sky-600 font-medium text-center">
            &quot;{selected.person.name}&quot; 선택됨 — 팀을 탭하여 배정
          </div>
        )}
        <div className="px-3 pt-2 pb-1.5 border-b border-slate-100">
          <div className="relative">
            <input
              type="text"
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              placeholder="이름·연락처 검색 (팀 배정자 포함)"
              className="w-full pl-7 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-400 focus:bg-white text-slate-800 placeholder:text-slate-400"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">🔍</span>
            {teamSearch && (
              <button
                type="button"
                onClick={() => setTeamSearch('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 text-sm leading-none"
                aria-label="검색어 지우기"
              >
                ✕
              </button>
            )}
          </div>
          {/* 정렬 버튼 (검색 밑) */}
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            <span className="text-slate-400 text-[10px] mr-0.5">정렬</span>
            {TEAM_SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTeamSort(key)}
                className={`px-2 py-0.5 text-[10px] rounded-md transition-colors font-medium
                  ${teamSort === key ? 'bg-sky-500 text-white shadow-sm' : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto p-2 space-y-1.5 max-h-[25vh] md:max-h-none">
          {q ? (
            <>
              <div className="flex items-center gap-1.5 pb-1">
                <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
                <span className="text-slate-500 text-xs">검색 결과 ({searchResults.length}명)</span>
              </div>
              {searchResults.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">일치하는 사람이 없습니다</p>
              )}
              {searchResults.map(({ person: p, fromTeam }) => (
                <PersonCard key={p.registration_id} person={p} draggable
                  onDragStart={() => { dragRef.current = { person: p, fromTeam } }}
                  onTap={() => handleTapSelect(p, fromTeam)}
                  isSelected={selected?.person.registration_id === p.registration_id}
                />
              ))}
            </>
          ) : (
            <>
              {unassignedSorted.length > 0 && (
                <div className="flex items-center gap-1.5 pb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-slate-500 text-xs">출석완료 ({unassignedSorted.length}명)</span>
                </div>
              )}
              {unassignedSorted.map((p) => (
                <PersonCard key={p.registration_id} person={p} draggable
                  onDragStart={() => { dragRef.current = { person: p, fromTeam: null } }}
                  onTap={() => handleTapSelect(p, null)}
                  isSelected={selected?.person.registration_id === p.registration_id}
                />
              ))}
              {notArrivedSorted.length > 0 && (
                <>
                  <div className="flex items-center gap-1.5 pt-2 pb-1 border-t border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="text-slate-500 text-xs">미출석 ({notArrivedSorted.length}명)</span>
                  </div>
                  {notArrivedSorted.map((p) => (
                    <PersonCard key={p.registration_id} person={p} draggable
                      onDragStart={() => { dragRef.current = { person: p, fromTeam: FROM_NOT_ARRIVED } }}
                      onTap={() => handleTapSelect(p, FROM_NOT_ARRIVED)}
                      isSelected={selected?.person.registration_id === p.registration_id}
                    />
                  ))}
                </>
              )}
              {unassignedSorted.length === 0 && notArrivedSorted.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">배정할 인원이 없습니다</p>
              )}
            </>
          )}
        </div>
        <div className="p-3 border-t border-slate-200 flex gap-2">
          <button
            onClick={handleReset}
            disabled={resetLoading}
            className="flex-1 py-2 bg-slate-50 hover:bg-red-50 disabled:opacity-50 text-slate-500 hover:text-red-500 text-xs font-semibold rounded-xl transition-colors border border-slate-200 hover:border-red-300"
          >
            {resetLoading ? '초기화...' : '초기화'}
          </button>
          <div className="flex-1 flex gap-1">
            <select
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-12 py-2 text-center text-xs font-bold bg-white border border-slate-200 rounded-xl outline-none focus:border-sky-400 text-slate-800 appearance-none cursor-pointer"
            >
              {[2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n}명</option>)}
            </select>
            <button
              onClick={handleAutoMatch}
              disabled={autoMatchLoading || (unassigned.length === 0 && notArrived.length === 0)}
              className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              {autoMatchLoading ? '매칭...' : '자동 매칭'}
            </button>
          </div>
        </div>
      </>
    )

    // 공통 팀 그리드
    const TeamGrid = () => (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {teamNames.map((t) => (
          <TeamCard key={t} teamName={t} members={[...(assigned[t] || [])].sort((a, b) => a.is_member === b.is_member ? a.name.localeCompare(b.name, 'ko') : a.is_member ? -1 : 1)}
            onDrop={handleDrop}
            onDragStartMember={(p, from) => { dragRef.current = { person: p, fromTeam: from } }}
            onRename={handleRenameTeam}
            onDelete={handleDeleteTeam}
            onTapAssign={() => handleTapAssign(t)}
            onTapSelectMember={(p) => handleTapSelect(p, t)}
            selectedId={selected?.person.registration_id}
          />
        ))}
        {teamNames.length < 100 && (
          <div
            className={`bg-white/60 border-2 border-dashed rounded-xl p-3 min-h-[120px] flex items-center justify-center text-sm transition-colors
              ${selected ? 'border-sky-400 text-sky-500 bg-sky-50/50' : 'border-slate-300 text-slate-400 hover:border-sky-300 hover:text-sky-500'}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnNewTeam}
            onClick={() => { if (selected) { const allNums2 = [...Object.keys(data?.assigned ?? {}), ...knownTeamsRef.current].map((n) => parseInt(n)).filter((n) => !isNaN(n)); const next2 = allNums2.length > 0 ? Math.max(...allNums2) + 1 : 1; const newName = `${next2}팀`; knownTeamsRef.current.add(newName); handleTapAssign(newName) } }}
          >
            + {nextNum}팀
          </div>
        )}
      </div>
    )

    return (
      <>
        {/* 모바일: 위아래 분할 */}
        <div className="md:hidden flex flex-col h-full overflow-hidden">
          {/* 상단 미배정 패널 (접기/펴기) */}
          <div
            className="border-b border-slate-200 bg-white shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(null)}
            onClick={(e) => { if (!(e.target as HTMLElement).closest('[data-person], button')) handleTapAssign(null) }}
          >
            <button
              onClick={() => setTeamPanelOpen(!teamPanelOpen)}
              className="w-full px-4 py-2.5 flex items-center justify-between bg-slate-50 border-b border-slate-200"
            >
              <span className="text-slate-800 font-semibold text-sm">
                {q ? <>검색 결과 <span className="text-sky-500 font-bold">{searchResults.length}명</span></> : <>미배정 출석자 <span className="text-sky-500 font-bold">{unassigned.length + notArrived.length}명</span></>}
              </span>
              <span className="text-slate-400 text-xs">{teamPanelOpen || q ? '접기 ▲' : '펼치기 ▼'}</span>
            </button>
            {(teamPanelOpen || q) && unassignedContent}
          </div>

          {/* 하단 팀 그리드 */}
          <div className="flex-1 overflow-y-auto p-3">
            <TeamGrid />
          </div>
        </div>

        {/* 데스크톱/태블릿: 좌우 분할 */}
        <div className="hidden md:flex h-full overflow-hidden">
          {/* 좌측 패널 */}
          <div
            className="w-64 flex-shrink-0 border-r border-slate-200 flex flex-col bg-white"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(null)}
            onClick={(e) => { if (!(e.target as HTMLElement).closest('[data-person], button')) handleTapAssign(null) }}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-slate-800 font-semibold text-sm">미배정 출석자</span>
              <span className="text-sky-500 text-xs font-bold">{unassigned.length}명</span>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              {unassignedContent}
            </div>
          </div>

          {/* 팀 그리드 */}
          <div className="flex-1 overflow-y-auto p-4">
            <TeamGrid />
          </div>
        </div>
      </>
    )
  }

  const [chartTarget, setChartTarget] = useState<'all' | 'crew' | 'guest'>('all')
  const [segment, setSegment] = useState<{ title: string; dimLabel: string; people: SegPerson[] } | null>(null)
  const [reports, setReports] = useState<any[]>([])
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const fetchReports = async (eid?: string) => {
    const id = eid || selectedEventId
    if (!id || id === 'crew-all') return
    const res = await fetch(`/api/admin/ai-report?eventId=${id}`)
    if (res.ok) {
      const data = await res.json()
      setReports(data.reports ?? [])
    }
  }

  const handleDeleteReport = async (id: string) => {
    if (!confirm('이 보고서를 삭제하시겠습니까?')) return
    const res = await fetch('/api/admin/ai-report', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      showToast('보고서 삭제됨', 'success')
      setReports((prev) => prev.filter((r: any) => r.id !== id))
      if (selectedReport?.id === id) setSelectedReport(null)
    } else showToast('삭제 실패', 'error')
  }

  // ── Tab 3: 전체 분석 ──
  const renderAnalysis = () => {
    const s1 = fullStats?.section1
    const s2 = fullStats?.section2 as any
    const s3 = fullStats?.section3 as any
    const crewMode = !!(s2?._crew_mode)

    // 차트 세그먼트 클릭 → 해당 인원 명단 팝업 (학교별·학년순 정렬)
    const segPeople: SegPerson[] = (s1 as any)?.people ?? []
    const gradeRank = (g: string) => {
      const order = ['1학년', '2학년', '3학년', '4학년', '졸업유예']
      const i = order.indexOf(g)
      return i < 0 ? 99 : i
    }
    const openSeg = (dim: string, dimLabel: string, target: 'all' | 'crew' | 'guest' | 'saeng', value: string) => {
      let subset = segPeople
      if (target === 'crew') subset = segPeople.filter((p) => p.is_crew)
      else if (target === 'guest') subset = segPeople.filter((p) => !p.is_crew)
      else if (target === 'saeng') subset = segPeople.filter((p) => !p.is_member)
      const matched = subset
        .filter((p) => (((p as any)[dim] || '기타') === value))
        .sort((a, b) =>
          (a.school || '').localeCompare(b.school || '', 'ko') ||
          gradeRank(a.grade) - gradeRank(b.grade) ||
          (a.name || '').localeCompare(b.name || '', 'ko')
        )
      setSegment({ title: `${value} · ${matched.length}명`, dimLabel, people: matched })
    }

    return (
      <div className="p-4 md:p-6 overflow-y-auto h-full space-y-10">
        {/* 섹션 1: 분포 차트 */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-1">{crewMode ? '크루 분석' : '행사 참여자 분석'}</h2>
          <p className="text-slate-400 text-sm mb-5">{crewMode ? '좌: 전체 크루 / 우: 비포도(일반)' : '포도 제외'}</p>
          {s1 ? (<>
            {/* 모바일: 대상 선택 + 차트 1개 */}
            {!crewMode && (
              <div className="md:hidden flex items-center gap-1 mb-4">
                {([['all', '전체'], ['crew', '크루'], ['guest', '게스트']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setChartTarget(key)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${chartTarget === key ? 'bg-sky-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200'}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-6">
              {(crewMode ? [
                { label: '학교별 분포', dim: 'school', all: s1.all.school, crew: s1.saengmyung?.school, guest: null, type: 'bar' },
                { label: '학년별 분포', dim: 'grade', all: s1.all.grade, crew: s1.saengmyung?.grade, guest: null, type: 'bar' },
                { label: '알게 된 경로', dim: 'path', all: s1.all.path, crew: s1.saengmyung?.path, guest: null, type: 'bar' },
                { label: '성별 분포', dim: 'gender', all: s1.all.gender, crew: s1.saengmyung?.gender, guest: null, type: 'pie' },
              ] : [
                { label: '학교별 분포', dim: 'school', all: s1.all.school, crew: (s1 as any).crew?.school, guest: (s1 as any).guest?.school, type: 'bar' },
                { label: '학년별 분포', dim: 'grade', all: s1.all.grade, crew: (s1 as any).crew?.grade, guest: (s1 as any).guest?.grade, type: 'bar' },
                { label: '알게 된 경로', dim: 'path', all: s1.all.path, crew: (s1 as any).crew?.path, guest: (s1 as any).guest?.path, type: 'bar' },
                { label: '성별 분포', dim: 'gender', all: s1.all.gender, crew: (s1 as any).crew?.gender, guest: (s1 as any).guest?.gender, type: 'pie' },
              ]).map(({ label, dim, all, crew, guest, type }: any) => {
                const mobileData = chartTarget === 'crew' ? crew : chartTarget === 'guest' ? guest : all
                const mobileColor = chartTarget === 'crew' ? '#0ea5e9' : chartTarget === 'guest' ? '#3b82f6' : '#0ea5e9'
                const mobileTarget: 'all' | 'crew' | 'guest' | 'saeng' = crewMode ? 'all' : chartTarget
                return (
                <div key={label}>
                  <h3 className="text-slate-700 font-medium mb-3">{label} <span className="text-slate-300 text-xs font-normal">· 클릭하면 명단</span></h3>

                  {/* 모바일: 선택된 대상 1개만 */}
                  <div className="md:hidden">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                      {type === 'pie'
                        ? <MiniPieChart data={mobileData ?? []} onPick={(v) => openSeg(dim, label, mobileTarget, v)} />
                        : <MiniBarChart data={mobileData ?? []} color={mobileColor} onPick={(v) => openSeg(dim, label, mobileTarget, v)} />}
                    </div>
                  </div>

                  {/* 데스크톱: 전체 펼침 */}
                  <div className={`hidden md:grid ${crewMode ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                      <p className="text-slate-400 text-xs mb-2">{crewMode ? '전체 크루' : '전체'}</p>
                      {type === 'pie'
                        ? <MiniPieChart data={all} onPick={(v) => openSeg(dim, label, 'all', v)} />
                        : <MiniBarChart data={all} onPick={(v) => openSeg(dim, label, 'all', v)} />}
                    </div>
                    {crewMode ? (
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <p className="text-slate-400 text-xs mb-2">비포도(일반)</p>
                        {type === 'pie'
                          ? <MiniPieChart data={crew} onPick={(v) => openSeg(dim, label, 'saeng', v)} />
                          : <MiniBarChart data={crew} color="#34d399" onPick={(v) => openSeg(dim, label, 'saeng', v)} />}
                      </div>
                    ) : (<>
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <p className="text-sky-400 text-xs mb-2">크루</p>
                        {type === 'pie'
                          ? <MiniPieChart data={crew ?? []} onPick={(v) => openSeg(dim, label, 'crew', v)} />
                          : <MiniBarChart data={crew ?? []} color="#0ea5e9" onPick={(v) => openSeg(dim, label, 'crew', v)} />}
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <p className="text-blue-400 text-xs mb-2">게스트</p>
                        {type === 'pie'
                          ? <MiniPieChart data={guest ?? []} onPick={(v) => openSeg(dim, label, 'guest', v)} />
                          : <MiniBarChart data={guest ?? []} color="#3b82f6" onPick={(v) => openSeg(dim, label, 'guest', v)} />}
                      </div>
                    </>)}
                  </div>
                </div>
                )
              })}
            </div>
          </>) : <p className="text-slate-400">데이터 없음</p>}
        </section>

        {/* 섹션 2: 숫자 카드 */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-5">{crewMode ? '크루 현황' : '행사 참여 현황'}</h2>
          {s2 ? (
            crewMode ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {[
                  { label: '전체 크루', value: `${s2.total_registrations}명`, color: 'text-slate-800' },
                  { label: '포도(정회원)', value: `${s2.checked_in_count}명`, color: 'text-sky-600' },
                  { label: '일반(비포도)', value: `${s2.total_crews}명`, color: 'text-emerald-600' },
                  { label: '남성 (전체)', value: `${s2.guest_attended}명`, color: 'text-blue-600' },
                  { label: '여성 (전체)', value: `${s2.guest_attendance_rate}명`, color: 'text-pink-500' },
                  { label: '남성 (비포도)', value: `${s2.crew_from_event}명`, color: 'text-blue-600' },
                  { label: '여성 (비포도)', value: `${s2.guests_from_event}명`, color: 'text-pink-500' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
                    <p className="text-slate-500 text-xs md:text-sm">{label}</p>
                    <p className={`text-2xl md:text-3xl font-bold mt-1 ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            ) : (() => {
              const totalPct = s2.total_registrations > 0 ? Math.round((s2.checked_in_count / s2.total_registrations) * 100) : 0
              const crewPct = s2.total_crews > 0 ? Math.round((s2.crew_checked_in / s2.total_crews) * 100) : 0
              const firstTotal = s2.first_time_crew + s2.first_time_guest
              const firstCheckedIn = s2.first_time_crew_checked_in + s2.first_time_guest_checked_in
              const firstPct = firstTotal > 0 ? Math.round((firstCheckedIn / firstTotal) * 100) : 0
              return (
                <div className="space-y-4">
                  {/* 모바일 */}
                  <div className="md:hidden space-y-3">
                    {/* 총 신청/참여 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                      <p className="text-slate-500 text-sm mb-2">전체 현황</p>
                      <div className="flex justify-center items-baseline gap-3">
                        <div>
                          <p className="text-3xl font-black text-slate-800">{s2.total_registrations}명</p>
                          <p className="text-slate-400 text-xs">신청</p>
                        </div>
                        <span className="text-slate-300 text-xl">→</span>
                        <div>
                          <p className="text-3xl font-black text-emerald-600">{s2.checked_in_count}명</p>
                          <p className="text-emerald-400 text-xs">참여 ({totalPct}%)</p>
                        </div>
                      </div>
                      {s2.podo_count > 0 && <p className="text-slate-400 text-[10px] mt-3">포도 포함 {s2.total_registrations + s2.podo_count}명 → {s2.checked_in_count + (s2.podo_checked_in ?? 0)}명 (포도 {s2.podo_count})</p>}
                    </div>

                    {/* 크루 */}
                    <div className="bg-white border-2 border-sky-200 rounded-2xl p-5 shadow-sm text-center">
                      <p className="text-sky-500 text-sm mb-2">크루</p>
                      <div className="flex justify-center items-baseline gap-3">
                        <div>
                          <p className="text-3xl font-black text-sky-600">{s2.total_crews}명</p>
                          <p className="text-slate-400 text-xs">신청</p>
                        </div>
                        <span className="text-slate-300 text-xl">→</span>
                        <div>
                          <p className="text-3xl font-black text-sky-600">{s2.crew_checked_in}명</p>
                          <p className="text-sky-400 text-xs">참여 ({crewPct}%)</p>
                        </div>
                      </div>
                    </div>

                    {/* 게스트 */}
                    <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-sm text-center">
                      <p className="text-blue-500 text-sm mb-2">게스트</p>
                      <div className="flex justify-center items-baseline gap-3">
                        <div>
                          <p className="text-3xl font-black text-blue-600">{s2.total_guests}명</p>
                          <p className="text-slate-400 text-xs">신청</p>
                        </div>
                        <span className="text-slate-300 text-xl">→</span>
                        <div>
                          <p className="text-3xl font-black text-blue-600">{s2.guest_attended}명</p>
                          <p className="text-blue-400 text-xs">참여 ({s2.guest_attendance_rate}%)</p>
                        </div>
                      </div>
                      {((s2.guest_deposit_paid ?? 0) + (s2.guest_deposit_pending ?? 0) + (s2.guest_deposit_refunded ?? 0)) > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-center gap-2 text-xs flex-wrap">
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-full px-2 py-0.5">입금 {s2.guest_deposit_paid ?? 0}</span>
                          <span className="bg-amber-50 border border-amber-200 text-amber-700 font-bold rounded-full px-2 py-0.5">미입금 {s2.guest_deposit_pending ?? 0}</span>
                          <span className="bg-sky-50 border border-sky-200 text-sky-700 font-bold rounded-full px-2 py-0.5">환불 {s2.guest_deposit_refunded ?? 0}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 데스크톱: 좌우 분할 */}
                  <div className="hidden md:grid grid-cols-2 gap-3">
                    <div className="space-y-3">
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                        <p className="text-slate-500 text-sm">총 신청</p>
                        <p className="text-3xl md:text-4xl font-black text-slate-800 mt-1">{s2.total_registrations}명</p>
                        {s2.podo_count > 0 && <p className="text-slate-400 text-xs mt-1">포도 포함 {s2.total_registrations + s2.podo_count}명 (포도 {s2.podo_count})</p>}
                      </div>
                      <div className="bg-white border-2 border-sky-200 rounded-2xl p-4 shadow-sm text-center">
                        <p className="text-sky-500 text-xs font-semibold">크루 신청</p>
                        <p className="text-2xl font-black text-sky-600 mt-1">{s2.total_crews}명</p>
                      </div>
                      <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-sm text-center">
                        <p className="text-blue-500 text-xs font-semibold">게스트 신청</p>
                        <p className="text-2xl font-black text-blue-600 mt-1">{s2.total_guests}명</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                        <p className="text-slate-500 text-sm">총 참여</p>
                        <p className="text-3xl md:text-4xl font-black text-emerald-600 mt-1">{s2.checked_in_count}명 <span className="text-lg font-bold">({totalPct}%)</span></p>
                        {s2.podo_count > 0 && <p className="text-slate-400 text-xs mt-1">포도 포함 {s2.checked_in_count + (s2.podo_checked_in ?? 0)}명 (포도 {s2.podo_checked_in ?? 0})</p>}
                      </div>
                      <div className="bg-white border-2 border-sky-200 rounded-2xl p-4 shadow-sm text-center">
                        <p className="text-sky-500 text-xs font-semibold">크루 참여</p>
                        <p className="text-2xl font-black text-sky-600 mt-1">{s2.crew_checked_in}명 <span className="text-sm font-medium">({crewPct}%)</span></p>
                      </div>
                      <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-sm text-center">
                        <p className="text-blue-500 text-xs font-semibold">게스트 참여</p>
                        <p className="text-2xl font-black text-blue-600 mt-1">{s2.guest_attended}명 <span className="text-sm font-medium">({s2.guest_attendance_rate}%)</span></p>
                        {((s2.guest_deposit_paid ?? 0) + (s2.guest_deposit_pending ?? 0) + (s2.guest_deposit_refunded ?? 0)) > 0 && (
                          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] flex-wrap">
                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-full px-1.5 py-0.5">입금 {s2.guest_deposit_paid ?? 0}</span>
                            <span className="bg-amber-50 border border-amber-200 text-amber-700 font-bold rounded-full px-1.5 py-0.5">미입금 {s2.guest_deposit_pending ?? 0}</span>
                            <span className="bg-sky-50 border border-sky-200 text-sky-700 font-bold rounded-full px-1.5 py-0.5">환불 {s2.guest_deposit_refunded ?? 0}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 누적 크루 현황 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
                    <h3 className="text-slate-700 font-semibold text-sm mb-3">누적 크루 현황 (포도 제외)</h3>
                    {/* 모바일 */}
                    <div className="md:hidden grid grid-cols-4 gap-1.5 text-center">
                      <div className="bg-slate-50 rounded-lg px-1 py-2">
                        <p className="text-slate-400 text-[8px]">전 행사 누적</p>
                        <p className="text-base font-black text-slate-700">{s2.prev_accumulated ?? 0}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg px-1 py-2 border border-orange-200">
                        <p className="text-orange-400 text-[8px]">직접 신청</p>
                        <p className="text-base font-black text-orange-600">{s2.between_events_crew ?? 0}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg px-1 py-2 border border-amber-200">
                        <p className="text-amber-400 text-[8px]">크루 전환</p>
                        <p className="text-base font-black text-amber-600">{s2.crew_conversion_count}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg px-1 py-2 border border-emerald-200">
                        <p className="text-emerald-400 text-[8px]">총 누적</p>
                        <p className="text-base font-black text-emerald-600">{s2.total_accumulated ?? 0}</p>
                      </div>
                    </div>
                    {/* 데스크톱 */}
                    <div className="hidden md:flex items-center justify-center gap-2 text-center">
                      <div className="bg-slate-50 rounded-xl px-4 py-3">
                        <p className="text-slate-400 text-[10px]">전 행사까지 누적</p>
                        <p className="text-xl font-black text-slate-700">{s2.prev_accumulated ?? 0}명</p>
                      </div>
                      <span className="text-slate-300 font-bold text-lg">+</span>
                      <div className="bg-orange-50 rounded-xl px-4 py-3 border border-orange-200">
                        <p className="text-orange-400 text-[10px]">기간 직접 신청</p>
                        <p className="text-xl font-black text-orange-600">{s2.between_events_crew ?? 0}명</p>
                      </div>
                      <span className="text-slate-300 font-bold text-lg">+</span>
                      <div className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
                        <p className="text-amber-400 text-[10px]">현 행사 크루 전환</p>
                        <p className="text-xl font-black text-amber-600">{s2.crew_conversion_count}명</p>
                      </div>
                      <span className="text-slate-300 font-bold text-lg">=</span>
                      <div className="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-200">
                        <p className="text-emerald-400 text-[10px]">총 누적</p>
                        <p className="text-xl font-black text-emerald-600">{s2.total_accumulated ?? 0}명</p>
                      </div>
                    </div>
                  </div>

                  {/* 첫 참여 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-slate-700 font-semibold text-sm mb-3">첫 참여 현황</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-slate-400 text-xs">전체</p>
                        <p className="text-2xl font-black text-cyan-600 mt-1">{firstTotal}명</p>
                        <p className="text-slate-400 text-xs mt-1">참여 {firstCheckedIn}명 ({firstPct}%)</p>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <p className="text-slate-400 text-xs">크루</p>
                        <p className="text-2xl font-black text-sky-600 mt-1">{s2.first_time_crew}명</p>
                        <p className="text-slate-400 text-xs mt-1">참여 {s2.first_time_crew_checked_in}명</p>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <p className="text-slate-400 text-xs">게스트</p>
                        <p className="text-2xl font-black text-blue-600 mt-1">{s2.first_time_guest}명</p>
                        <p className="text-slate-400 text-xs mt-1">참여 {s2.first_time_guest_checked_in}명</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()
          ) : <p className="text-slate-400">데이터 없음</p>}
        </section>

        {/* 섹션 3 */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-5">{crewMode ? '관심 프로젝트 분포' : '피드백 분석'}</h2>
          {s3 ? (
            <>
              {!crewMode && (
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                  {[
                    { label: '총 응답 수', value: s3.total_responses, color: 'text-slate-800' },
                    { label: '재참여 희망', value: s3.would_return_count, color: 'text-emerald-600' },
                    { label: '가입 관심', value: s3.join_interest_count, color: 'text-sky-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
                      <p className="text-slate-500 text-xs md:text-sm">{label}</p>
                      <p className={`text-2xl md:text-3xl font-bold mt-1 ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              )}
              {s3.good_tags.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
                  <h3 className="text-slate-700 font-medium mb-3">{crewMode ? '관심 프로젝트' : '좋았던 점 태그'}</h3>
                  <MiniBarChart data={s3.good_tags.map((t: TagItem) => ({ name: t.tag, count: t.count }))} color={crewMode ? '#0ea5e9' : '#34d399'} />
                </div>
              )}
              {s3.bad_tags.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
                  <h3 className="text-slate-700 font-medium mb-3">아쉬운 점 태그</h3>
                  <MiniBarChart data={s3.bad_tags.map((t: TagItem) => ({ name: t.tag, count: t.count }))} color="#f87171" />
                </div>
              )}
              {s3.responses && s3.responses.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-slate-700 font-medium mb-4">피드백 원문 ({s3.responses.length}개)</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {s3.responses.map((r: any, i: number) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200">
                        {r.good_points && (
                          <div>
                            <span className="text-emerald-600 text-xs font-medium">좋았던 점</span>
                            <p className="text-slate-700 text-sm mt-0.5">{r.good_points}</p>
                          </div>
                        )}
                        {r.bad_points && (
                          <div>
                            <span className="text-red-500 text-xs font-medium">아쉬운 점</span>
                            <p className="text-slate-700 text-sm mt-0.5">{r.bad_points}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : <p className="text-slate-400">{crewMode ? '데이터 없음' : '피드백 데이터 없음'}</p>}
        </section>

        {/* 보고서 */}
        {!crewMode && (
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-5">보고서</h2>
            {reports.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                <p className="text-slate-400 text-sm">저장된 보고서가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((r: any) => (
                  <div key={r.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2 cursor-pointer hover:opacity-70" onClick={() => window.open(`/admin/report?id=${r.id}`, '_blank')}>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.mode === 'podo' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-600'}`}>
                          {r.mode === 'podo' ? '포도' : '일반'}
                        </span>
                        <span className="text-slate-800 font-semibold text-sm">{r.title}</span>
                        <span className="text-slate-400 text-xs ml-1">{new Date(r.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <button onClick={() => handleDeleteReport(r.id)} className="text-slate-300 hover:text-red-500 transition-colors text-xs">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 차트 세그먼트 클릭 → 명단 팝업 */}
        {segment && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setSegment(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200 shrink-0">
                  <div>
                    <h2 className="text-base font-black text-slate-800">{segment.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{segment.dimLabel} · 학교·학년순</p>
                  </div>
                  <button onClick={() => setSegment(null)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
                </div>
                <div className="overflow-y-auto flex-1 px-2 py-2">
                  {segment.people.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-400">해당 인원이 없습니다</div>
                  ) : (
                    segment.people.map((p, i) => {
                      const prev = segment.people[i - 1]
                      const showSchoolHeader = !prev || prev.school !== p.school
                      const statusColor = p.status === '출석완료'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : p.status === '노쇼확정'
                        ? 'bg-red-50 text-red-500 border-red-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                      return (
                        <div key={`${p.phone ?? ''}-${i}`}>
                          {showSchoolHeader && (
                            <p className="px-3 pt-3 pb-1 text-[11px] font-bold text-sky-500">{p.school || '학교 미입력'}</p>
                          )}
                          <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-sm font-bold text-slate-800">{p.name || '이름 미입력'}</span>
                                {p.is_member && <span className="text-xs">🍇</span>}
                                <span className={`text-[11px] ${genderColor(p.gender)}`}>{p.gender}</span>
                                <span className="text-[10px] text-slate-400">{p.grade}{p.major ? ` · ${p.major}` : ''}</span>
                              </div>
                              {p.phone && <div className="text-[11px] text-slate-500">{p.phone}</div>}
                            </div>
                            {p.status && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${statusColor}`}>{p.status}</span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  const handleTogglePodo = async (m: any) => {
    const newVal = !m.is_member
    try {
      const res = await fetch('/api/admin/toggle-podo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crew_id: m.id, is_member: newVal }),
      })
      if (res.ok) {
        showToast(`${m.name} → ${newVal ? '포도' : '일반'}`, 'success')
        setMembers((prev) => prev.map((p: any) => p.id === m.id ? { ...p, is_member: newVal } : p))
      } else {
        const d = await res.json()
        showToast(d.message || '변경 실패', 'error')
      }
    } catch { showToast('오류 발생', 'error') }
  }

  const handleDeleteMember = async (m: any) => {
    const label = m.name || '알 수 없음'
    const desc = m.is_crew
      ? `"${label}" 님의 행사 신청을 삭제하시겠습니까?\n(크루 정보는 유지됩니다)`
      : `"${label}" 님을 삭제하시겠습니까?\n(게스트 정보도 함께 삭제됩니다)`
    if (!confirm(desc)) return
    try {
      const res = await fetch('/api/admin/delete-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: m.registration_id,
          is_crew: m.is_crew,
          guest_id: m.guest_id ?? null,
        }),
      })
      if (res.ok) {
        showToast(`${label} 삭제 완료`, 'success')
        setMembers((prev) => prev.filter((p: any) => p.registration_id !== m.registration_id))
      } else {
        const d = await res.json()
        showToast(d.message || '삭제 실패', 'error')
      }
    } catch { showToast('삭제 중 오류', 'error') }
  }

  // ── Tab 4: 신청자 ──
  const renderMembers = () => {
    if (membersLoading) return <div className="flex items-center justify-center h-full"><p className="text-slate-500">로딩 중...</p></div>

    const q = memberSearch.toLowerCase()
    let filtered = q
      ? members.filter((m) => (m.name || '').toLowerCase().includes(q) || (m.phone || '').includes(q) || (m.school || '').toLowerCase().includes(q) || (m.major || '').toLowerCase().includes(q))
      : members

    if (memberSort !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        if (memberSort === 'name') return (a.name || '').localeCompare(b.name || '', 'ko')
        if (memberSort === 'school') return (a.school || '').localeCompare(b.school || '', 'ko')
        if (memberSort === 'grade') return (a.grade || '').localeCompare(b.grade || '', 'ko')
        if (memberSort === 'gender') return (a.gender || '').localeCompare(b.gender || '', 'ko')
        if (memberSort === 'crew') return (a.is_crew === b.is_crew ? 0 : a.is_crew ? -1 : 1)
        return 0
      })
    }

    // Stats
    const total = members.length
    const crewCount = members.filter((m: any) => m.is_crew).length
    const guestCount = members.filter((m: any) => !m.is_crew).length
    const memberCount = members.filter((m) => m.is_member).length
    const schoolCount = new Set(members.map((m) => m.school)).size
    const firstTimeCount = members.filter((m: any) => m.is_first_time).length

    const MEMBER_SORT_OPTIONS: { key: SortKey; label: string }[] = [
      { key: 'none', label: '최신순' },
      { key: 'name', label: '가나다' },
      { key: 'school', label: '학교' },
      { key: 'crew', label: '크루' },
      { key: 'grade', label: '학년' },
      { key: 'gender', label: '성별' },
    ]

    return (
      <div className="p-3 md:p-6 overflow-y-auto h-full">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
          {(membersMode === 'event' ? [
            { label: '총 신청자', value: total, color: 'text-slate-800' },
            { label: '게스트/크루', value: `${guestCount}/${crewCount}`, color: 'text-sky-600' },
            { label: '일반/포도', value: `${total - memberCount}/${memberCount}`, color: 'text-emerald-600' },
            { label: '남/여 (비포도)', value: (() => { const nonPodo = members.filter((m: any) => !m.is_member); const m = nonPodo.filter((x: any) => x.gender === '남성').length; const f = nonPodo.filter((x: any) => x.gender === '여성').length; return `${m}/${f}` })(), color: 'text-blue-600' },
          ] : [
            { label: '총 크루', value: total, color: 'text-slate-800' },
            { label: '학교 수', value: schoolCount, color: 'text-sky-600' },
            { label: '일반/포도', value: `${total - memberCount}/${memberCount}`, color: 'text-emerald-600' },
            { label: '남/여 (비포도)', value: (() => { const nonPodo = members.filter((m: any) => !m.is_member); const m = nonPodo.filter((x: any) => x.gender === '남성').length; const f = nonPodo.filter((x: any) => x.gender === '여성').length; return `${m}/${f}` })(), color: 'text-blue-600' },
          ]).map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4 text-center shadow-sm">
              <div className={`text-xl md:text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-slate-500 text-[10px] md:text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* 모드 토글 + 정렬(모바일) + 검색(데스크톱) */}
        <div className="flex items-center gap-2 md:gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-200 rounded-xl p-0.5">
            <button onClick={() => { setMembersMode('event'); fetchMembers('event') }}
              className={`px-2 md:px-3 py-1.5 text-[10px] md:text-xs rounded-lg font-medium transition-colors ${membersMode === 'event' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
              행사 신청자
            </button>
            <button onClick={() => { setMembersMode('all'); fetchMembers('all') }}
              className={`px-2 md:px-3 py-1.5 text-[10px] md:text-xs rounded-lg font-medium transition-colors ${membersMode === 'all' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
              누적 크루
            </button>
          </div>
          <div className="flex items-center gap-1">
            {MEMBER_SORT_OPTIONS.map(({ key, label }) => (
              <button key={key} onClick={() => setMemberSort(key)}
                className={`px-2 md:px-2.5 py-1 md:py-1.5 text-[10px] md:text-xs rounded-lg transition-colors font-medium ${memberSort === key ? 'bg-sky-500 text-white shadow-sm' : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'}`}>
                {label}
              </button>
            ))}
          </div>
          <input
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            placeholder="이름, 학교 검색..."
            className="hidden md:block bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-1.5 w-52 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 shadow-sm"
          />
          {membersMode === 'event' && !isCrewMode && selectedEventId && (
            <button
              onClick={() => setAddCrewOpen(true)}
              className="ml-auto bg-sky-500 hover:bg-sky-600 text-white text-xs px-2.5 md:px-3 py-1.5 rounded-xl font-bold transition-colors shadow-sm"
            >
              + 크루 추가
            </button>
          )}
        </div>

        {/* 모바일: 카드형 리스트 (클릭 시 상세 펼침) */}
        <div className="md:hidden space-y-2">
          {filtered.map((m: any) => {
            const mid = m.registration_id || m.id
            const isExpanded = expandedMemberId === mid
            return (
              <div key={mid}
                className={`bg-white border rounded-2xl shadow-sm transition-all ${isExpanded ? 'border-sky-300' : 'border-slate-200'}`}
                onClick={() => setExpandedMemberId(isExpanded ? null : mid)}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 font-bold text-sm w-12 shrink-0">{m.name}</span>
                      <span className="w-4 shrink-0 text-center">
                        {m.is_member ? <span className="text-xs">🍇</span> : m.is_first_time ? <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" /> : null}
                      </span>
                      {membersMode === 'event' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 w-10 text-center"
                          style={{ background: m.is_crew ? '#f0f9ff' : '#f1f5f9', color: m.is_crew ? '#0ea5e9' : '#94a3b8' }}>
                          {m.is_crew ? '크루' : '게스트'}
                        </span>
                      )}
                      {membersMode === 'event' && m.reg_status && (
                        <span className={`text-[10px] font-bold shrink-0 w-10 text-center ${m.reg_status === '출석완료' ? 'text-emerald-500' : m.reg_status === '노쇼확정' ? 'text-red-500' : 'text-amber-500'}`}>
                          {m.reg_status === '출석완료' ? '출석' : m.reg_status === '노쇼확정' ? '노쇼' : '미출석'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px]">{new Date(m.registered_at || m.created_at).toLocaleDateString('ko-KR')}</span>
                      <span className="text-slate-300 text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {m.school && <span>{m.school}</span>}
                    {m.grade && <><span className="text-slate-300">·</span><span>{m.grade}</span></>}
                    {m.gender && <><span className="text-slate-300">·</span><span className={genderColor(m.gender)}>{m.gender}</span></>}
                  </div>
                </div>

                {/* 상세 정보 */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      {m.phone && <div><span className="text-slate-400">연락처</span><br/><a href={`tel:${m.phone}`} className="text-sky-500 font-medium">{m.phone}</a></div>}
                      {m.age && <div><span className="text-slate-400">나이</span><br/><span className="text-slate-700">{m.age}세</span></div>}
                      {m.school && <div><span className="text-slate-400">학교</span><br/><span className="text-slate-700">{m.school}</span></div>}
                      {m.grade && <div><span className="text-slate-400">학년</span><br/><span className="text-slate-700">{m.grade}</span></div>}
                      {m.major && <div><span className="text-slate-400">전공</span><br/><span className="text-slate-700">{m.major}</span></div>}
                      {m.path && <div><span className="text-slate-400">경로</span><br/><span className="text-slate-700">{m.path}</span></div>}
                      {m.project && <div><span className="text-slate-400">관심 프로젝트</span><br/><span className="text-slate-700">{m.project}</span></div>}
                      {m.motivation && <div className="col-span-2"><span className="text-slate-400">지원 동기</span><br/><span className="text-slate-700">{m.motivation}</span></div>}
                      {membersMode === 'event' && m.team_name && <div><span className="text-slate-400">팀</span><br/><span className="text-sky-600 font-medium">{m.team_name}</span></div>}
                    </div>
                    {membersMode === 'event' && (
                      <button onClick={() => handleDeleteMember(m)} className="w-full mt-2 py-1.5 text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium">
                        삭제
                      </button>
                    )}
                    {membersMode === 'all' && (
                      <button onClick={() => handleTogglePodo(m)} className={`w-full mt-2 py-1.5 text-xs font-medium rounded-lg border transition-colors ${m.is_member ? 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100' : 'text-sky-600 bg-sky-50 border-sky-200 hover:bg-sky-100'}`}>
                        {m.is_member ? '🍇 포도 해제' : '포도로 변경'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-10">{q ? '검색 결과 없음' : '신청자가 없습니다'}</p>
          )}
        </div>

        {/* 데스크톱/태블릿: 테이블 */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-3 py-3 text-left font-semibold">#</th>
                  <th className="px-3 py-3 text-left font-semibold">이름</th>
                  <th className="px-3 py-3 text-left font-semibold">연락처</th>
                  <th className="px-3 py-3 text-left font-semibold">나이</th>
                  <th className="px-3 py-3 text-left font-semibold">성별</th>
                  <th className="px-3 py-3 text-left font-semibold">학교</th>
                  <th className="px-3 py-3 text-left font-semibold">전공</th>
                  <th className="px-3 py-3 text-left font-semibold">학년</th>
                  <th className="px-3 py-3 text-left font-semibold">경로</th>
                  <th className="px-3 py-3 text-left font-semibold">관심</th>
                  <th className="px-3 py-3 text-left font-semibold">포도</th>
                  {membersMode === 'event' && <th className="px-3 py-3 text-left font-semibold">출석</th>}
                  {membersMode === 'event' && <th className="px-3 py-3 text-left font-semibold">유형</th>}
                  {membersMode === 'event' && <th className="px-3 py-3 text-left font-semibold">팀</th>}
                  <th className="px-3 py-3 text-left font-semibold">신청일</th>
                  {membersMode === 'event' && <th className="px-3 py-3 text-center font-semibold w-10">삭제</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((m: any, i: number) => (
                  <tr key={m.registration_id || m.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="px-3 py-3 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-3 text-slate-800 font-medium whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">{m.name}{m.is_first_time && !m.is_member && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <a href={`tel:${m.phone}`} className="text-sky-500 hover:text-sky-600">{m.phone}</a>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{m.age}</td>
                    <td className={`px-3 py-3 font-medium ${genderColor(m.gender)}`}>{m.gender}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{m.school}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{m.major}</td>
                    <td className="px-3 py-3 text-slate-600">{m.grade}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs whitespace-nowrap">{m.path}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs whitespace-nowrap">{m.project}</td>
                    <td className="px-3 py-3">
                      {membersMode === 'all' ? (
                        <button onClick={() => handleTogglePodo(m)} className="hover:opacity-70 transition-opacity" title={m.is_member ? '포도 해제' : '포도로 변경'}>
                          {m.is_member ? <span>🍇</span> : <span className="text-slate-300 text-xs">—</span>}
                        </button>
                      ) : (
                        m.is_member ? <span>🍇</span> : <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    {membersMode === 'event' && (
                      <td className="px-3 py-3">
                        {m.reg_status === '출석완료'
                          ? <span className="text-emerald-500 text-xs font-medium">출석</span>
                          : <span className="text-amber-500 text-xs font-medium">미출석</span>}
                      </td>
                    )}
                    {membersMode === 'event' && (
                      <td className="px-3 py-3">
                        {m.is_crew
                          ? <span className="text-sky-500 text-xs">크루</span>
                          : <span className="text-slate-400 text-xs">게스트</span>}
                      </td>
                    )}
                    {membersMode === 'event' && (
                      <td className="px-3 py-3 text-slate-500 text-xs">{m.team_name || '—'}</td>
                    )}
                    <td className="px-3 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(m.registered_at || m.created_at).toLocaleDateString('ko-KR')}</td>
                    {membersMode === 'event' && (
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => handleDeleteMember(m)} className="text-slate-300 hover:text-red-500 transition-colors text-sm">✕</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-10">{q ? '검색 결과 없음' : '신청자가 없습니다'}</p>
          )}
        </div>
        <p className="text-slate-400 text-xs mt-3 text-right">전체 {filtered.length}명{membersMode === 'event' && <> · <span className="text-emerald-500 font-medium">첫 참여 {filtered.filter((m: any) => m.is_first_time && !m.is_member).length}명</span></>}</p>
      </div>
    )
  }

  // ── Tab 5: 보증금 ──
  const renderDeposit = () => {
    const assignedAll = Object.values(data?.assigned ?? {}).flat()
    const allRegs = [
      ...(data?.unassigned ?? []),
      ...(data?.not_arrived ?? []),
      ...(data?.noshow ?? []),
      ...assignedAll,
    ]
    // 게스트만 + 중복 제거
    const seen = new Set<string>()
    const guests = allRegs.filter((p) => {
      if (p.is_crew) return false
      if (seen.has(p.registration_id)) return false
      seen.add(p.registration_id)
      return true
    })

    const q = depositSearch.toLowerCase()
    const filtered = q
      ? guests.filter((g) => g.name.toLowerCase().includes(q) || (g.refund_account ?? '').toLowerCase().includes(q) || g.phone.includes(q))
      : guests

    const sorted = [...filtered].sort((a, b) => {
      const order = { '미입금': 0, '입금': 1, '환불': 2 } as Record<string, number>
      const oa = order[a.deposit_status] ?? 0
      const ob = order[b.deposit_status] ?? 0
      if (oa !== ob) return oa - ob
      return a.name.localeCompare(b.name, 'ko')
    })

    const counts = {
      unpaid: guests.filter((g) => g.deposit_status === '미입금' || !g.deposit_status).length,
      paid: guests.filter((g) => g.deposit_status === '입금').length,
      refunded: guests.filter((g) => g.deposit_status === '환불').length,
    }

    return (
      <div className="p-4 md:p-6 overflow-y-auto h-full">
        <div className="grid grid-cols-4 gap-2 md:gap-3 mb-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4 text-center">
            <div className="text-2xl md:text-3xl font-black text-slate-700">{guests.length}</div>
            <div className="text-slate-500 text-[10px] md:text-sm mt-1 font-medium">총 게스트</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 md:p-4 text-center">
            <div className="text-2xl md:text-3xl font-black text-amber-700">{counts.unpaid}</div>
            <div className="text-amber-700 text-[10px] md:text-sm mt-1 font-medium">미입금</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 md:p-4 text-center">
            <div className="text-2xl md:text-3xl font-black text-emerald-700">{counts.paid}</div>
            <div className="text-emerald-700 text-[10px] md:text-sm mt-1 font-medium">입금</div>
          </div>
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 md:p-4 text-center">
            <div className="text-2xl md:text-3xl font-black text-sky-700">{counts.refunded}</div>
            <div className="text-sky-700 text-[10px] md:text-sm mt-1 font-medium">환불</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4 mb-4">
          <input
            value={depositSearch}
            onChange={(e) => setDepositSearch(e.target.value)}
            placeholder="이름·연락처·계좌번호 검색"
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
          />
          <p className="text-slate-400 text-[11px] mt-2">상태 뱃지 클릭: 미입금 → 입금 → 환불 순환. 계좌가 없으면 「수정」 버튼으로 직접 입력.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
          {sorted.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-10">{q ? '검색 결과 없음' : '게스트가 없습니다'}</p>
          )}
          {sorted.map((g) => (
            <DepositRow
              key={g.registration_id}
              guest={g}
              onCycle={() => handleCycleDeposit(g.registration_id)}
              onSaveAccount={(val) => handleSaveRefundAccount(g.registration_id, val)}
              onSendCancel={() => handleSendCancelAlimtalk(g.registration_id, g.name)}
            />
          ))}
        </div>
      </div>
    )
  }

  // ───────────── Render ─────────────
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'checkin', label: '출석', icon: '✓' },
    { id: 'team', label: '팀 배정', icon: '⊞' },
    { id: 'analysis', label: '분석', icon: '◎' },
    { id: 'members', label: '신청자', icon: '♟' },
    { id: 'deposit', label: '보증금', icon: '₩' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
      {/* 헤더 — 짙은 보라색 */}
      <header className="bg-sky-700 px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <h1 className="text-sm md:text-lg font-bold text-white shrink-0">PROGEN</h1>
          {cohorts.length > 1 && (
            <select
              value={cohortFilter}
              onChange={(e) => handleCohortChange(e.target.value)}
              className="bg-sky-800 border border-sky-500 text-white text-xs md:text-sm rounded-lg px-2 py-1.5 outline-none focus:border-sky-300 cursor-pointer shrink-0"
              title="기수 필터"
            >
              <option value="">현재 기수</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="all">전체 기수</option>
            </select>
          )}
          {events.length > 0 && (
            <select
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className="bg-sky-600 border border-sky-500 text-white text-xs md:text-sm rounded-lg px-2 md:px-3 py-1.5 outline-none focus:border-sky-300 cursor-pointer min-w-0 flex-1 md:flex-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({new Date(ev.event_date).toLocaleDateString('ko-KR')})
                </option>
              ))}
              <option value="crew-all">PROGEN 1기 크루</option>
            </select>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <a href="/admin/program" className="hidden md:block text-sky-200 hover:text-white text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-lg border border-sky-500 hover:border-sky-300 transition-colors">
            수료관리
          </a>
          <button onClick={() => fetchAll()} className="text-sky-200 hover:text-white text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-lg border border-sky-500 hover:border-sky-300 transition-colors">
            새로고침
          </button>
          {!isCrewMode && selectedEventId && (
            <button onClick={() => setSettingsOpen(true)} className="text-sky-200 hover:text-white text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-lg border border-sky-500 hover:border-sky-300 transition-colors">
              설정
            </button>
          )}
          <button onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); router.push('/admin') }}
            className="hidden md:block text-sky-200 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-sky-500 hover:border-sky-300 transition-colors">
            로그아웃
          </button>
        </div>
      </header>

      {/* 탭바 (모바일+태블릿: 상단) */}
      <div className="lg:hidden flex bg-white border-b border-slate-200 shrink-0">
        {(isCrewMode ? tabs.filter((t) => t.id === 'analysis' || t.id === 'members') : tabs).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 본문 + 탭 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 콘텐츠 */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'checkin' && renderCheckin()}
          {activeTab === 'team' && renderTeam()}
          {activeTab === 'analysis' && renderAnalysis()}
          {activeTab === 'members' && renderMembers()}
          {activeTab === 'deposit' && renderDeposit()}
        </div>

        {/* 우측 책갈피 탭 (데스크톱���) */}
        <div className="hidden lg:flex flex-shrink-0 flex-col justify-center gap-0 absolute right-0 top-1/2 -translate-y-1/2 z-20">
          {(isCrewMode ? tabs.filter((t) => t.id === 'analysis' || t.id === 'members') : tabs).map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ writingMode: 'vertical-rl' }}
              className={`py-5 px-2.5 text-sm font-bold transition-all duration-150 shadow-md
                ${i === 0 ? 'rounded-tl-xl' : ''} ${i === tabs.length - 1 ? 'rounded-bl-xl' : ''}
                ${activeTab === tab.id
                  ? 'bg-sky-600 text-white -translate-x-1 z-10'
                  : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-200 border-r-0'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {!isCrewMode && selectedEventId && (
        <EventAlimtalkSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} eventId={selectedEventId} />
      )}

      {!isCrewMode && selectedEventId && addCrewOpen && (
        <AddCrewModal
          eventId={selectedEventId}
          existingCrewIds={new Set(members.filter((m: any) => m.is_crew).map((m: any) => m.id))}
          onClose={() => setAddCrewOpen(false)}
          onAdded={() => { setAddCrewOpen(false); fetchMembers() }}
        />
      )}
    </div>
  )
}

function AddCrewModal({
  eventId,
  existingCrewIds,
  onClose,
  onAdded,
}: {
  eventId: string
  existingCrewIds: Set<string>
  onClose: () => void
  onAdded: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState<CrewMember[]>([])
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/members-list?mode=all')
        const json = await res.json()
        setList((json.members ?? []) as CrewMember[])
      } catch {
        showToast('크루 목록을 불러올 수 없습니다', 'error')
      } finally {
        setLoading(false)
      }
    })()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const available = list
    .filter((c) => !existingCrewIds.has(c.id))
    .filter((c) => {
      if (!q.trim()) return true
      const s = q.toLowerCase()
      return (c.name || '').toLowerCase().includes(s)
        || (c.phone || '').includes(s)
        || (c.school || '').toLowerCase().includes(s)
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'))

  const addOne = async (c: CrewMember) => {
    if (!window.confirm(`${c.name}님을 이 행사에 사전신청으로 추가합니다. 행사 정보가 다 채워졌으면 참석 확정 알림톡도 자동 발송됩니다. 계속할까요?`)) return
    setAdding(c.id)
    try {
      const res = await fetch('/api/admin/add-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, crewId: c.id }),
      })
      const d = await res.json()
      if (res.ok) {
        const note = d.alimtalk === 'sent' ? ' (확정 알림톡 발송됨)'
          : d.alimtalk === 'pending' ? ' (행사 정보 미입력 → 알림톡 보류)'
          : ''
        showToast(`${c.name}님 추가 완료${note}`, 'success')
        onAdded()
      } else {
        showToast(d.message || '추가 실패', 'error')
      }
    } catch {
      showToast('추가 중 오류가 발생했습니다', 'error')
    } finally {
      setAdding(null)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-black text-slate-800">크루 추가</h2>
              <p className="text-xs text-slate-400 mt-0.5">크루 명단에서 직접 사전신청에 추가</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
          </div>

          <div className="px-5 py-3 border-b border-slate-200 shrink-0">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="이름, 연락처, 학교 검색..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-sky-400"
            />
          </div>

          <div className="overflow-y-auto flex-1 px-2 py-2">
            {loading ? (
              <div className="py-10 text-center text-sm text-slate-400">불러오는 중...</div>
            ) : available.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                {q ? '검색 결과 없음' : '추가 가능한 크루가 없습니다 (전원 이미 신청됨)'}
              </div>
            ) : (
              available.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-800">{c.name}</span>
                      {c.is_member && <span className="text-xs">🍇</span>}
                      <span className="text-[10px] text-slate-400">{c.school} {c.grade}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{c.phone}</div>
                  </div>
                  <button
                    onClick={() => addOne(c)}
                    disabled={adding !== null}
                    className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white text-xs font-bold px-2.5 py-1 rounded-lg transition-colors shrink-0"
                  >
                    {adding === c.id ? '추가 중...' : '추가'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}

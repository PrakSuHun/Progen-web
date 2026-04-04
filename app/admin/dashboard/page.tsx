'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { showToast } from '@/components/Toast'

// ───────────── Types ─────────────
type Tab = 'checkin' | 'team' | 'analysis' | 'members'
type SortKey = 'none' | 'name' | 'school' | 'grade' | 'gender'

interface Attendee {
  registration_id: string
  name: string
  phone: string
  school: string
  grade: string
  age: string
  gender: string
  is_member: boolean
  noshow_count: number
  is_crew: boolean
  status: string
  team_name: string | null
}

interface DashboardData {
  pre_registered_count: number
  checked_in_count: number
  unassigned: Attendee[]
  assigned: Record<string, Attendee[]>
  not_arrived: Attendee[]
}

interface EventItem { id: string; title: string; event_date: string }

interface CrewMember {
  id: string; name: string; phone: string; school: string; grade: string
  age: string; major: string; path: string; project: string; gender: string
  motivation: string; role: string; status: string; is_member: boolean
  noshow_count: number; created_at: string
}

interface DistItem { name: string; count: number }
interface TagItem { tag: string; count: number }

interface FullStats {
  section1: {
    all: { school: DistItem[]; grade: DistItem[]; path: DistItem[]; gender: DistItem[] }
    saengmyung: { school: DistItem[]; grade: DistItem[]; path: DistItem[]; gender: DistItem[] }
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
const PIE_COLORS = ['#8b5cf6', '#34d399', '#f472b6', '#60a5fa', '#fbbf24']
const FROM_NOT_ARRIVED = '__NOT_ARRIVED__'

function genderColor(gender: string) {
  if (gender === '남성' || gender === '남') return 'text-blue-600'
  if (gender === '여성' || gender === '여') return 'text-pink-500'
  return 'text-gray-400'
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
function MiniBarChart({ data, color = '#8b5cf6' }: { data: DistItem[]; color?: string }) {
  if (!data.length) return <p className="text-gray-400 text-sm py-4 text-center">데이터 없음</p>
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
        <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function MiniPieChart({ data }: { data: DistItem[] }) {
  if (!data.length) return <p className="text-gray-400 text-sm py-4 text-center">데이터 없음</p>
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

function PersonCard({ person, showPhone = false, dimmed = false, draggable: isDraggable = false, onDragStart }: {
  person: Attendee
  showPhone?: boolean
  dimmed?: boolean
  draggable?: boolean
  onDragStart?: () => void
}) {
  const isTarget = person.noshow_count >= 2
  const isNotArrived = person.status === '사전신청'
  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      className={`px-3 py-2 rounded-lg text-sm select-none transition-opacity w-full
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
        ${dimmed ? 'opacity-50' : ''}
        ${isTarget
          ? 'bg-red-50 border border-red-300'
          : isNotArrived
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-white border border-gray-200 shadow-sm'
        }`}
    >
      <div className="flex items-center gap-1 font-medium text-gray-900">
        <span>{person.name}</span>
        {person.is_member && <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />}
        {isNotArrived && (
          <span className="text-amber-600 text-xs font-normal">미출석</span>
        )}
        {person.team_name && (
          <span className="ml-auto text-violet-500 text-xs font-normal">{person.team_name}</span>
        )}
        {isTarget && !person.team_name && (
          <span className="ml-auto text-red-500 text-xs font-normal">박탈대상</span>
        )}
      </div>
      <div className="text-xs mt-0.5 flex items-center gap-1 flex-wrap">
        <span className="text-gray-500">{person.school}</span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-500">{person.grade}</span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-500">{person.age}세</span>
        <span className="text-gray-300">·</span>
        <span className={genderColor(person.gender)}>{person.gender}</span>
      </div>
      {showPhone && person.phone && (
        <a
          href={`tel:${person.phone}`}
          className="text-xs text-violet-500 hover:text-violet-600 mt-0.5 block"
          onClick={(e) => e.stopPropagation()}
        >
          {person.phone}
        </a>
      )}
    </div>
  )
}

function TeamCard({ teamName, members, onDrop, onDragStartMember, onRename, onDelete }: {
  teamName: string
  members: Attendee[]
  onDrop: (t: string) => void
  onDragStartMember: (p: Attendee, from: string) => void
  onRename: (old: string, next: string) => void
  onDelete: (t: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState(teamName)
  const [over, setOver] = useState(false)
  const podoOnly = members.length > 0 && members.every((m) => m.is_member)

  const confirmRename = () => {
    const t = inputVal.trim()
    if (t && t !== teamName) onRename(teamName, t)
    setEditing(false)
  }

  return (
    <div
      className={`relative bg-white border-2 rounded-xl p-3 min-h-[120px] transition-colors shadow-sm
        ${over ? 'border-violet-400 bg-violet-50' : 'border-gray-200'}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { setOver(false); onDrop(teamName) }}
    >
      {podoOnly && <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-violet-500" />}
      <button
        onClick={() => onDelete(teamName)}
        className="absolute top-1.5 right-2 text-gray-300 hover:text-red-400 transition-colors text-xs leading-none"
        title="팀 삭제"
      >✕</button>
      <div className="mb-2">
        {editing ? (
          <input autoFocus value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={confirmRename}
            onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
            className="bg-gray-50 text-gray-900 text-sm font-semibold px-2 py-0.5 rounded w-full outline-none border border-violet-400"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-gray-900 text-sm font-semibold hover:text-violet-500 transition-colors">
            {teamName}
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {members.map((m) => (
          <div key={m.registration_id} draggable onDragStart={() => onDragStartMember(m, teamName)} className="cursor-grab">
            <PersonCard person={m} />
          </div>
        ))}
        {Array.from({ length: Math.max(0, 4 - members.length) }).map((_, i) => (
          <div key={i} className="h-8 rounded-lg border border-dashed border-gray-200 bg-gray-50/50" />
        ))}
      </div>
      <div className="mt-2 text-right text-xs text-gray-400">{members.length} / 4</div>
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

  // Event selector
  const [events, setEvents] = useState<EventItem[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')

  // Members tab
  const [members, setMembers] = useState<CrewMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [memberSort, setMemberSort] = useState<SortKey>('none')

  useEffect(() => {
    fetch('/api/admin/events').then(async (res) => {
      if (res.ok) {
        const json = await res.json()
        const list: EventItem[] = (json.data ?? json).map((e: any) => ({ id: e.id, title: e.title, event_date: e.event_date }))
        setEvents(list)
        if (list.length > 0) {
          setSelectedEventId(list[0].id)
          fetchAll(list[0].id)
        } else {
          fetchAll()
        }
      } else {
        fetchAll()
      }
    })
  }, [])

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

  const handleEventChange = (newEventId: string) => {
    setSelectedEventId(newEventId)
    fetchAll(newEventId)
    setMembers([])
  }

  const [membersMode, setMembersMode] = useState<'event' | 'all'>('event')

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
  }, [activeTab, selectedEventId])

  const assignTeam = (registration_id: string, team_name: string | null) =>
    fetch('/api/admin/assign-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_id, team_name }),
    })

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
        body: JSON.stringify({ clientMaxTeam, eventId: selectedEventId }),
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
    const missing = Math.max(0, pre - arrived)

    const assignedAll = Object.values(data?.assigned ?? {}).flat()
    const allCheckedIn = [
      ...(data?.unassigned ?? []),
      ...assignedAll.filter((p) => p.status === '출석완료'),
    ]
    const notArrived = [
      ...(data?.not_arrived ?? []),
      ...assignedAll.filter((p) => p.status === '사전신청'),
    ]

    const q = searchQuery.toLowerCase()
    const filteredCheckedIn = sortAttendees(
      q ? allCheckedIn.filter((p) => p.name.toLowerCase().includes(q) || p.school.toLowerCase().includes(q)) : allCheckedIn,
      sortBy
    )
    const filteredNotArrived = sortAttendees(
      q ? notArrived.filter((p) => p.name.toLowerCase().includes(q) || p.school.toLowerCase().includes(q)) : notArrived,
      sortBy
    )

    const SORT_OPTIONS: { key: SortKey; label: string }[] = [
      { key: 'none', label: '기본' },
      { key: 'name', label: '가나다' },
      { key: 'school', label: '학교' },
      { key: 'grade', label: '학년' },
      { key: 'gender', label: '성별' },
    ]

    return (
      <div className="p-4 md:p-6 overflow-y-auto h-full">
        {/* 숫자 카드 */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5">
          {[
            { label: '오기로 한 인원', value: pre, color: 'text-gray-900', bg: 'bg-white' },
            { label: '현재 온 인원', value: arrived, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: '미출석', value: missing, color: 'text-red-500', bg: 'bg-red-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} border border-gray-100 rounded-2xl p-4 md:p-5 text-center shadow-sm`}>
              <div className={`text-3xl md:text-4xl font-bold ${color}`}>{value}</div>
              <div className="text-gray-500 text-xs md:text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* 검색 + 정렬 */}
        <div className="flex items-center gap-2 md:gap-3 mb-4 flex-wrap">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름 또는 학교 검색..."
            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl px-3 py-2 w-48 md:w-52 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 placeholder:text-gray-400"
          />
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-xs mr-1">정렬:</span>
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors
                  ${sortBy === key ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 두 열 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-gray-900 font-semibold mb-3">
              출석완료 <span className="text-emerald-500 font-normal text-sm">{allCheckedIn.length}명</span>
            </h3>
            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {filteredCheckedIn.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-6">
                  {q ? '검색 결과 없음' : '아직 출석자가 없습니다'}
                </p>
              )}
              {filteredCheckedIn.map((p) => (
                <PersonCard key={p.registration_id} person={p} />
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-gray-900 font-semibold mb-3">
              미출석 <span className="text-red-400 font-normal text-sm">{notArrived.length}명</span>
            </h3>
            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {filteredNotArrived.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-6">
                  {q ? '검색 결과 없음' : '모두 출석했습니다'}
                </p>
              )}
              {filteredNotArrived.map((p) => (
                <PersonCard key={p.registration_id} person={p} showPhone dimmed />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Tab 2: 팀 배정 ──
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

    return (
      <div className="flex h-full overflow-hidden">
        {/* 좌측 패널 */}
        <div
          className="w-56 md:w-64 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(null)}
        >
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-gray-900 font-semibold text-sm">미배정 출석자</span>
            <span className="text-gray-400 text-xs">{unassigned.length}명</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {unassigned.length > 0 && (
              <div className="flex items-center gap-1.5 pb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-gray-400 text-xs">출석완료 ({unassigned.length}명)</span>
              </div>
            )}
            {unassigned.map((p) => (
              <PersonCard key={p.registration_id} person={p} draggable
                onDragStart={() => { dragRef.current = { person: p, fromTeam: null } }}
              />
            ))}
            {notArrived.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 pt-2 pb-1 border-t border-gray-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="text-gray-400 text-xs">미출석 ({notArrived.length}명)</span>
                </div>
                {notArrived.map((p) => (
                  <PersonCard key={p.registration_id} person={p} draggable
                    onDragStart={() => { dragRef.current = { person: p, fromTeam: FROM_NOT_ARRIVED } }}
                  />
                ))}
              </>
            )}
            {unassigned.length === 0 && notArrived.length === 0 && (
              <p className="text-gray-400 text-sm text-center pt-8">배정할 인원이 없습니다</p>
            )}
          </div>
          <div className="p-3 border-t border-gray-200 space-y-2">
            <button
              onClick={handleReset}
              disabled={resetLoading}
              className="w-full py-2 bg-white hover:bg-red-50 disabled:opacity-50 text-gray-500 hover:text-red-500 text-sm font-semibold rounded-xl transition-colors border border-gray-200 hover:border-red-300"
            >
              {resetLoading ? '초기화 중...' : '팀 배정 초기화'}
            </button>
            <button
              onClick={handleAutoMatch}
              disabled={autoMatchLoading || unassigned.length === 0}
              className="w-full py-2 bg-violet-500 hover:bg-violet-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {autoMatchLoading ? '매칭 중...' : '자동 매칭'}
            </button>
          </div>
        </div>

        {/* 팀 그리드 */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {teamNames.map((t) => (
              <TeamCard key={t} teamName={t} members={assigned[t] || []}
                onDrop={handleDrop}
                onDragStartMember={(p, from) => { dragRef.current = { person: p, fromTeam: from } }}
                onRename={handleRenameTeam}
                onDelete={handleDeleteTeam}
              />
            ))}
            {teamNames.length < 30 && (
              <div
                className="bg-white/60 border-2 border-dashed border-gray-200 rounded-xl p-3 min-h-[120px] flex items-center justify-center text-gray-400 text-sm hover:border-violet-300 hover:text-violet-400 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropOnNewTeam}
              >
                + {nextNum}팀
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Tab 3: 전체 분석 ──
  const renderAnalysis = () => {
    const s1 = fullStats?.section1
    const s2 = fullStats?.section2
    const s3 = fullStats?.section3

    return (
      <div className="p-4 md:p-6 overflow-y-auto h-full space-y-10">
        {/* 섹션 1 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-1">행사 참여자 분석</h2>
          <p className="text-gray-400 text-sm mb-5">좌: 전체 참여자 / 우: 일반만</p>
          {s1 ? (
            <div className="space-y-6">
              {[
                { label: '학교별 분포', all: s1.all.school, sm: s1.saengmyung.school, type: 'bar' },
                { label: '학년별 분포', all: s1.all.grade, sm: s1.saengmyung.grade, type: 'bar' },
                { label: '알게 된 경로', all: s1.all.path, sm: s1.saengmyung.path, type: 'bar' },
                { label: '성별 분포', all: s1.all.gender, sm: s1.saengmyung.gender, type: 'pie' },
              ].map(({ label, all, sm, type }) => (
                <div key={label}>
                  <h3 className="text-gray-700 font-medium mb-3">{label}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-gray-400 text-xs mb-2">전체</p>
                      {type === 'pie' ? <MiniPieChart data={all} /> : <MiniBarChart data={all} />}
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-gray-400 text-xs mb-2">일반만</p>
                      {type === 'pie' ? <MiniPieChart data={sm} /> : <MiniBarChart data={sm} color="#34d399" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400">데이터 없음</p>}
        </section>

        {/* 섹션 2 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">행사 참여 현황</h2>
          {s2 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {[
                { label: '전체 신청', value: `${s2.total_registrations}명`, color: 'text-gray-900' },
                { label: '출석완료', value: `${s2.checked_in_count}명`, color: 'text-emerald-600' },
                { label: '크루 참여', value: `${s2.total_crews}명`, color: 'text-violet-600' },
                { label: '게스트 참여', value: `${s2.total_guests}명`, color: 'text-blue-600' },
                { label: '게스트 출석', value: `${s2.guest_attended}명`, color: 'text-blue-600' },
                { label: '게스트 참석률', value: `${s2.guest_attendance_rate}%`, color: 'text-blue-600' },
                { label: '이 행사 계기 크루 가입', value: `${s2.crew_from_event}명`, color: 'text-violet-600' },
                { label: '이 행사 신규 게스트', value: `${s2.guests_from_event}명`, color: 'text-cyan-600' },
                { label: '게스트→크루 전환', value: `${s2.crew_conversion_count}명 (${s2.crew_conversion_rate}%)`, color: 'text-amber-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm">
                  <p className="text-gray-500 text-xs md:text-sm">{label}</p>
                  <p className={`text-2xl md:text-3xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400">데이터 없음</p>}
        </section>

        {/* 섹션 3 */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">피드백 분석</h2>
          {s3 ? (
            <>
              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                {[
                  { label: '총 응답 수', value: s3.total_responses, color: 'text-gray-900' },
                  { label: '재참여 희망', value: s3.would_return_count, color: 'text-emerald-600' },
                  { label: '가입 관심', value: s3.join_interest_count, color: 'text-violet-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm">
                    <p className="text-gray-500 text-xs md:text-sm">{label}</p>
                    <p className={`text-2xl md:text-3xl font-bold mt-1 ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              {s3.good_tags.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-sm">
                  <h3 className="text-gray-700 font-medium mb-3">좋았던 점 태그</h3>
                  <MiniBarChart data={s3.good_tags.map((t) => ({ name: t.tag, count: t.count }))} color="#34d399" />
                </div>
              )}
              {s3.bad_tags.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-sm">
                  <h3 className="text-gray-700 font-medium mb-3">아쉬운 점 태그</h3>
                  <MiniBarChart data={s3.bad_tags.map((t) => ({ name: t.tag, count: t.count }))} color="#f87171" />
                </div>
              )}
              {s3.responses.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-gray-700 font-medium mb-4">피드백 원문 ({s3.responses.length}개)</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {s3.responses.map((r, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                        {r.good_points && (
                          <div>
                            <span className="text-emerald-600 text-xs font-medium">좋았던 점</span>
                            <p className="text-gray-700 text-sm mt-0.5">{r.good_points}</p>
                          </div>
                        )}
                        {r.bad_points && (
                          <div>
                            <span className="text-red-500 text-xs font-medium">아쉬운 점</span>
                            <p className="text-gray-700 text-sm mt-0.5">{r.bad_points}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : <p className="text-gray-400">피드백 데이터 없음</p>}
        </section>
      </div>
    )
  }

  // ── Tab 4: 신청자 ──
  const renderMembers = () => {
    if (membersLoading) return <div className="flex items-center justify-center h-full"><p className="text-gray-500">로딩 중...</p></div>

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
        return 0
      })
    }

    // Stats
    const total = members.length
    const schools = new Set(members.map((m) => m.school)).size
    const memberCount = members.filter((m) => m.is_member).length

    const MEMBER_SORT_OPTIONS: { key: SortKey; label: string }[] = [
      { key: 'none', label: '최신순' },
      { key: 'name', label: '가나다' },
      { key: 'school', label: '학교' },
      { key: 'grade', label: '학년' },
      { key: 'gender', label: '성별' },
    ]

    return (
      <div className="p-3 md:p-6 overflow-y-auto h-full">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
          {[
            { label: '총 신청자', value: total, color: 'text-gray-900' },
            { label: '학교 수', value: schools, color: 'text-violet-600' },
            { label: '일반(비포도)', value: total - memberCount, color: 'text-emerald-600' },
            { label: '남/여 (비포도)', value: (() => { const nonPodo = members.filter((m: any) => !m.is_member); const m = nonPodo.filter((x: any) => x.gender === '남성').length; const f = nonPodo.filter((x: any) => x.gender === '여성').length; return `${m}/${f}` })(), color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-3 md:p-4 text-center shadow-sm">
              <div className={`text-xl md:text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-gray-400 text-[10px] md:text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* 모드 토글 + 검색 + 정렬 */}
        <div className="flex items-center gap-2 md:gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-0.5">
            <button onClick={() => { setMembersMode('event'); fetchMembers('event') }}
              className={`px-2 md:px-3 py-1.5 text-[10px] md:text-xs rounded-lg font-medium transition-colors ${membersMode === 'event' ? 'bg-violet-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              행사 신청자
            </button>
            <button onClick={() => { setMembersMode('all'); fetchMembers('all') }}
              className={`px-2 md:px-3 py-1.5 text-[10px] md:text-xs rounded-lg font-medium transition-colors ${membersMode === 'all' ? 'bg-violet-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              누적 크루
            </button>
          </div>
          <input
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            placeholder="이름, 학교 검색..."
            className="bg-white border border-gray-200 text-gray-900 text-xs rounded-xl px-2.5 py-1.5 w-36 md:w-52 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 placeholder:text-gray-400"
          />
          <div className="hidden md:flex items-center gap-1">
            <span className="text-gray-400 text-xs mr-1">정렬:</span>
            {MEMBER_SORT_OPTIONS.map(({ key, label }) => (
              <button key={key} onClick={() => setMemberSort(key)}
                className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors ${memberSort === key ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => fetchMembers()} className="ml-auto text-gray-400 hover:text-gray-700 text-xs px-2 md:px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            새로고침
          </button>
        </div>

        {/* 모바일: 카드형 리스트 */}
        <div className="md:hidden space-y-2">
          {filtered.map((m: any) => (
            <div key={m.registration_id || m.id} className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-bold text-sm">{m.name}</span>
                  {m.is_member && <span className="text-xs">🍇</span>}
                  {membersMode === 'event' && m.reg_status && (
                    <span className={`text-[10px] font-bold ${m.reg_status === '출석완료' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {m.reg_status === '출석완료' ? '출석' : '미출석'}
                    </span>
                  )}
                </div>
                <span className="text-gray-400 text-[10px]">{new Date(m.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {m.school && <span>{m.school}</span>}
                {m.grade && <><span className="text-gray-300">·</span><span>{m.grade}</span></>}
                {m.gender && <><span className="text-gray-300">·</span><span className={genderColor(m.gender)}>{m.gender}</span></>}
              </div>
              {m.phone && (
                <a href={`tel:${m.phone}`} className="text-violet-500 text-xs mt-1 block">{m.phone}</a>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-10">{q ? '검색 결과 없음' : '신청자가 없습니다'}</p>
          )}
        </div>

        {/* 데스크톱/태블릿: 테이블 */}
        <div className="hidden md:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((m: any, i: number) => (
                  <tr key={m.registration_id || m.id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="px-3 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-3 text-gray-900 font-medium whitespace-nowrap">{m.name}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <a href={`tel:${m.phone}`} className="text-violet-500 hover:text-violet-600">{m.phone}</a>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{m.age}</td>
                    <td className={`px-3 py-3 font-medium ${genderColor(m.gender)}`}>{m.gender}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{m.school}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{m.major}</td>
                    <td className="px-3 py-3 text-gray-600">{m.grade}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">{m.path}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">{m.project}</td>
                    <td className="px-3 py-3">{m.is_member ? <span>🍇</span> : <span className="text-gray-300 text-xs">—</span>}</td>
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
                          ? <span className="text-violet-500 text-xs">크루</span>
                          : <span className="text-gray-400 text-xs">게스트</span>}
                      </td>
                    )}
                    {membersMode === 'event' && (
                      <td className="px-3 py-3 text-gray-500 text-xs">{m.team_name || '—'}</td>
                    )}
                    <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(m.created_at).toLocaleDateString('ko-KR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-10">{q ? '검색 결과 없음' : '신청자가 없습니다'}</p>
          )}
        </div>
        <p className="text-gray-400 text-xs mt-3 text-right">총 {filtered.length}명 표시 / 전체 {members.length}명</p>
      </div>
    )
  }

  // ───────────── Render ─────────────
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'checkin', label: '출석', icon: '✓' },
    { id: 'team', label: '팀 배정', icon: '⊞' },
    { id: 'analysis', label: '분석', icon: '◎' },
    { id: 'members', label: '신청자', icon: '♟' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <h1 className="text-sm md:text-lg font-bold text-gray-900 shrink-0">PROGEN</h1>
          {events.length > 0 && (
            <select
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs md:text-sm rounded-xl px-2 md:px-3 py-1.5 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 cursor-pointer min-w-0 flex-1 md:flex-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({new Date(ev.event_date).toLocaleDateString('ko-KR')})
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => fetchAll()} className="text-gray-400 hover:text-gray-700 text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            새로고침
          </button>
          <button onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); router.push('/admin') }}
            className="hidden md:block text-gray-400 hover:text-gray-700 text-sm px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            로그아웃
          </button>
        </div>
      </header>

      {/* 탭바 (모바일+태블릿: 상단 / 데스크톱: 우측 책갈피) */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
              activeTab === tab.id ? 'text-violet-500 border-b-2 border-violet-500' : 'text-gray-400'
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
        </div>

        {/* 우측 책갈피 탭 (데스크톱만) */}
        <div className="hidden lg:flex flex-shrink-0 flex-col justify-center gap-0 absolute right-0 top-1/2 -translate-y-1/2 z-20">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ writingMode: 'vertical-rl' }}
              className={`py-5 px-2.5 text-sm font-bold transition-all duration-150 shadow-md
                ${i === 0 ? 'rounded-tl-xl' : ''} ${i === tabs.length - 1 ? 'rounded-bl-xl' : ''}
                ${activeTab === tab.id
                  ? 'bg-violet-500 text-white -translate-x-1 z-10'
                  : 'bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 border border-gray-200 border-r-0'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

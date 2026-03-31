'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { showToast } from '@/components/Toast'

// ───────────── Types ─────────────
type Tab = 'checkin' | 'team' | 'analysis'
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

interface DistItem { name: string; count: number }
interface TagItem { tag: string; count: number }

interface FullStats {
  section1: {
    all: { school: DistItem[]; grade: DistItem[]; path: DistItem[]; gender: DistItem[] }
    saengmyung: { school: DistItem[]; grade: DistItem[]; path: DistItem[]; gender: DistItem[] }
  }
  section2: {
    total_guests: number
    guest_attended: number
    guest_attendance_rate: number
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

function genderColor(gender: string) {
  if (gender === '남성' || gender === '남') return 'text-blue-400'
  if (gender === '여성' || gender === '여') return 'text-pink-400'
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
function MiniBarChart({ data, color = '#8b5cf6' }: { data: DistItem[]; color?: string }) {
  if (!data.length) return <p className="text-slate-500 text-sm py-4 text-center">데이터 없음</p>
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }} />
        <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function MiniPieChart({ data }: { data: DistItem[] }) {
  if (!data.length) return <p className="text-slate-500 text-sm py-4 text-center">데이터 없음</p>
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
        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8 }} />
        <Legend
          formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
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
  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      className={`px-3 py-2 rounded-lg text-sm select-none transition-opacity w-full
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
        ${dimmed ? 'opacity-40' : ''}
        ${isTarget ? 'bg-red-900 border border-red-600' : 'bg-slate-700 border border-slate-600'}`}
    >
      <div className="flex items-center gap-1 font-medium text-white">
        <span>{person.name}</span>
        {person.is_member && <span>🍇</span>}
        {person.team_name && (
          <span className="ml-auto text-purple-400 text-xs font-normal">{person.team_name}</span>
        )}
        {isTarget && !person.team_name && (
          <span className="ml-auto text-red-400 text-xs font-normal">박탈대상</span>
        )}
      </div>
      <div className="text-xs mt-0.5 flex items-center gap-1 flex-wrap">
        <span className="text-slate-400">{person.school}</span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-400">{person.grade}</span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-400">{person.age}세</span>
        <span className="text-slate-500">·</span>
        <span className={genderColor(person.gender)}>{person.gender}</span>
      </div>
      {showPhone && person.phone && (
        <a
          href={`tel:${person.phone}`}
          className="text-xs text-blue-400 hover:text-blue-300 mt-0.5 block"
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
      className={`relative bg-slate-800 border-2 rounded-xl p-3 min-h-[120px] transition-colors
        ${over ? 'border-purple-500 bg-slate-700' : 'border-slate-600'}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { setOver(false); onDrop(teamName) }}
    >
      {podoOnly && <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-purple-500" />}
      <button
        onClick={() => onDelete(teamName)}
        className="absolute top-1.5 right-2 text-slate-500 hover:text-red-400 transition-colors text-xs leading-none"
        title="팀 삭제"
      >✕</button>
      <div className="mb-2">
        {editing ? (
          <input autoFocus value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={confirmRename}
            onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
            className="bg-slate-700 text-white text-sm font-semibold px-2 py-0.5 rounded w-full outline-none border border-purple-500"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-white text-sm font-semibold hover:text-purple-400 transition-colors">
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
          <div key={i} className="h-8 rounded-lg border border-dashed border-slate-600 bg-slate-700/30" />
        ))}
      </div>
      <div className="mt-2 text-right text-xs text-slate-500">{members.length} / 4</div>
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

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      // Compact team numbers first (removes gaps, starts from 1팀)
      await fetch('/api/admin/compact-teams', { method: 'POST' })

      const [dashRes, statsRes] = await Promise.all([
        fetch('/api/admin/dashboard-data'),
        fetch('/api/admin/full-stats'),
      ])
      if (dashRes.status === 401) { router.push('/admin'); return }
      if (dashRes.ok) {
        const newData: DashboardData = await dashRes.json()
        // Rebuild knownTeams from fresh (compacted) data
        knownTeamsRef.current = new Set(Object.keys(newData.assigned))
        // Restore empty team cards that exist in session but not in DB
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
      const newAssigned: Record<string, Attendee[]> = {}
      for (const k of Object.keys(prev.assigned)) newAssigned[k] = [...prev.assigned[k]]

      if (fromTeam === null) {
        newUnassigned = newUnassigned.filter((a) => a.registration_id !== person.registration_id)
      } else {
        newAssigned[fromTeam] = (newAssigned[fromTeam] || []).filter((a) => a.registration_id !== person.registration_id)
      }

      if (targetTeam === null) {
        newUnassigned = [person, ...newUnassigned]
      } else {
        if (!newAssigned[targetTeam]) newAssigned[targetTeam] = []
        if (newAssigned[targetTeam].length >= 4) {
          showToast('팀이 가득 찼습니다 (최대 4명)', 'error')
          return prev
        }
        newAssigned[targetTeam] = [...newAssigned[targetTeam], person]
      }
      return { ...prev, unassigned: newUnassigned, assigned: newAssigned }
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
        body: JSON.stringify({ clientMaxTeam }),
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

    // 로컬 상태 즉시 업데이트 (멤버 → 미배정, 팀 카드 제거)
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

    // DB 업데이트: 멤버들 미배정 처리 후 팀 번호 재정렬
    await Promise.all(members.map((m) => assignTeam(m.registration_id, null)))
    await fetch('/api/admin/compact-teams', { method: 'POST' })
    await fetchAll()
  }

  const handleReset = async () => {
    if (!confirm('모든 팀 배정을 초기화하시겠습니까?')) return
    setResetLoading(true)
    try {
      const res = await fetch('/api/admin/reset-teams', { method: 'POST' })
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

    const allCheckedIn = [...(data?.unassigned ?? []), ...Object.values(data?.assigned ?? {}).flat()]
    const notArrived = data?.not_arrived ?? []

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
      <div className="p-6 overflow-y-auto h-full">
        {/* 숫자 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: '오기로 한 인원', value: pre, color: 'text-white' },
            { label: '현재 온 인원', value: arrived, color: 'text-green-400' },
            { label: '미출석', value: missing, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-800 rounded-xl p-5 text-center">
              <div className={`text-4xl font-bold ${color}`}>{value}</div>
              <div className="text-slate-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* 검색 + 정렬 */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름 또는 학교 검색..."
            className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 w-52 outline-none focus:border-purple-500 placeholder:text-slate-500"
          />
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-xs mr-1">정렬:</span>
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors
                  ${sortBy === key ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 두 열 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">
              출석완료 <span className="text-green-400 font-normal text-sm">{allCheckedIn.length}명</span>
            </h3>
            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {filteredCheckedIn.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-6">
                  {q ? '검색 결과 없음' : '아직 출석자가 없습니다'}
                </p>
              )}
              {filteredCheckedIn.map((p) => (
                <PersonCard key={p.registration_id} person={p} />
              ))}
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">
              미출석 <span className="text-red-400 font-normal text-sm">{notArrived.length}명</span>
            </h3>
            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {filteredNotArrived.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-6">
                  {q ? '검색 결과 없음' : '모두 출석했습니다 🎉'}
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
          className="w-64 flex-shrink-0 border-r border-slate-700 flex flex-col"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(null)}
        >
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">미배정 출석자</span>
            <span className="text-slate-400 text-xs">{unassigned.length}명</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {unassigned.map((p) => (
              <PersonCard key={p.registration_id} person={p} draggable
                onDragStart={() => { dragRef.current = { person: p, fromTeam: null } }}
              />
            ))}
            {notArrived.length > 0 && (
              <>
                <div className="text-slate-500 text-xs pt-2 pb-1 border-t border-slate-700">미출석 ({notArrived.length}명)</div>
                {notArrived.map((p) => <PersonCard key={p.registration_id} person={p} dimmed />)}
              </>
            )}
            {unassigned.length === 0 && notArrived.length === 0 && (
              <p className="text-slate-500 text-sm text-center pt-8">출석자가 없습니다</p>
            )}
          </div>
          <div className="p-3 border-t border-slate-700 space-y-2">
            <button
              onClick={handleReset}
              disabled={resetLoading}
              className="w-full py-2 bg-slate-700 hover:bg-red-900 disabled:opacity-50 text-slate-300 hover:text-red-300 text-sm font-semibold rounded-lg transition-colors border border-slate-600 hover:border-red-700"
            >
              {resetLoading ? '초기화 중...' : '팀 배정 초기화'}
            </button>
            <button
              onClick={handleAutoMatch}
              disabled={autoMatchLoading || unassigned.length === 0}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {autoMatchLoading ? '매칭 중...' : '자동 매칭'}
            </button>
          </div>
        </div>

        {/* 팀 그리드 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
                className="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-xl p-3 min-h-[120px] flex items-center justify-center text-slate-500 text-sm hover:border-slate-400 transition-colors"
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
      <div className="p-6 overflow-y-auto h-full space-y-10">
        {/* 섹션 1 */}
        <section>
          <h2 className="text-xl font-bold text-white mb-1">오늘 행사 분석</h2>
          <p className="text-slate-500 text-sm mb-5">좌: 전체 출석자 / 우: 일반만</p>
          {s1 ? (
            <div className="space-y-6">
              {[
                { label: '학교별 분포', all: s1.all.school, sm: s1.saengmyung.school, type: 'bar' },
                { label: '학년별 분포', all: s1.all.grade, sm: s1.saengmyung.grade, type: 'bar' },
                { label: '알게 된 경로', all: s1.all.path, sm: s1.saengmyung.path, type: 'bar' },
                { label: '성별 분포', all: s1.all.gender, sm: s1.saengmyung.gender, type: 'pie' },
              ].map(({ label, all, sm, type }) => (
                <div key={label}>
                  <h3 className="text-slate-300 font-medium mb-3">{label}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 rounded-xl p-4">
                      <p className="text-slate-500 text-xs mb-2">전체</p>
                      {type === 'pie' ? <MiniPieChart data={all} /> : <MiniBarChart data={all} />}
                    </div>
                    <div className="bg-slate-800 rounded-xl p-4">
                      <p className="text-slate-500 text-xs mb-2">일반만</p>
                      {type === 'pie' ? <MiniPieChart data={sm} /> : <MiniBarChart data={sm} color="#34d399" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-500">데이터 없음</p>}
        </section>

        {/* 섹션 2 */}
        <section>
          <h2 className="text-xl font-bold text-white mb-5">게스트 & 크루 전환</h2>
          {s2 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: '총 게스트 신청', value: `${s2.total_guests}명`, color: 'text-white' },
                { label: '게스트 참석률', value: `${s2.guest_attendance_rate}%`, color: 'text-green-400' },
                { label: '게스트 출석 인원', value: `${s2.guest_attended}명`, color: 'text-white' },
                { label: '크루 전환 수', value: `${s2.crew_conversion_count}명`, color: 'text-purple-400' },
                { label: '크루 전환율', value: `${s2.crew_conversion_rate}%`, color: 'text-purple-400' },
                { label: '누적 크루(일반)', value: `${s2.total_saengmyung}명`, color: 'text-white' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-800 rounded-xl p-5">
                  <p className="text-slate-400 text-sm">{label}</p>
                  <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-500">데이터 없음</p>}
        </section>

        {/* 섹션 3 */}
        <section>
          <h2 className="text-xl font-bold text-white mb-5">피드백 분석</h2>
          {s3 ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: '총 응답 수', value: s3.total_responses, color: 'text-white' },
                  { label: '재참여 희망', value: s3.would_return_count, color: 'text-green-400' },
                  { label: '가입 관심', value: s3.join_interest_count, color: 'text-purple-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-800 rounded-xl p-5">
                    <p className="text-slate-400 text-sm">{label}</p>
                    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              {s3.good_tags.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-5 mb-4">
                  <h3 className="text-slate-300 font-medium mb-3">좋았던 점 태그</h3>
                  <MiniBarChart data={s3.good_tags.map((t) => ({ name: t.tag, count: t.count }))} color="#34d399" />
                </div>
              )}
              {s3.bad_tags.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-5 mb-4">
                  <h3 className="text-slate-300 font-medium mb-3">아쉬운 점 태그</h3>
                  <MiniBarChart data={s3.bad_tags.map((t) => ({ name: t.tag, count: t.count }))} color="#f87171" />
                </div>
              )}
              {s3.responses.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-5">
                  <h3 className="text-slate-300 font-medium mb-4">피드백 원문 ({s3.responses.length}개)</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {s3.responses.map((r, i) => (
                      <div key={i} className="bg-slate-700 rounded-lg p-4 space-y-2">
                        {r.good_points && (
                          <div>
                            <span className="text-green-400 text-xs font-medium">좋았던 점</span>
                            <p className="text-slate-200 text-sm mt-0.5">{r.good_points}</p>
                          </div>
                        )}
                        {r.bad_points && (
                          <div>
                            <span className="text-red-400 text-xs font-medium">아쉬운 점</span>
                            <p className="text-slate-200 text-sm mt-0.5">{r.bad_points}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : <p className="text-slate-500">피드백 데이터 없음</p>}
        </section>
      </div>
    )
  }

  // ───────────── Render ─────────────
  const tabs: { id: Tab; label: string }[] = [
    { id: 'checkin', label: '출석체크' },
    { id: 'team', label: '팀 배정' },
    { id: 'analysis', label: '전체 분석' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <h1 className="text-lg font-bold text-white">운영 대시보드</h1>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-400 transition-colors">
            새로고침
          </button>
          <button onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); router.push('/admin') }}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-400 transition-colors">
            로그아웃
          </button>
        </div>
      </header>

      {/* 본문 + 탭 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 콘텐츠 */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'checkin' && renderCheckin()}
          {activeTab === 'team' && renderTeam()}
          {activeTab === 'analysis' && renderAnalysis()}
        </div>

        {/* 우측 책갈피 탭 */}
        <div className="flex-shrink-0 flex flex-col justify-center gap-0 absolute right-0 top-1/2 -translate-y-1/2 z-20">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ writingMode: 'vertical-rl' }}
              className={`py-5 px-2.5 text-sm font-bold transition-all duration-150 shadow-lg
                ${i === 0 ? 'rounded-tl-xl' : ''} ${i === tabs.length - 1 ? 'rounded-bl-xl' : ''}
                ${activeTab === tab.id
                  ? 'bg-purple-600 text-white -translate-x-1 z-10'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
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

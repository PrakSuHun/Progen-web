'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'

interface Attendee {
  registration_id: string
  name: string
  school: string
  grade: string
  age: string
  gender: string
  is_member: boolean
  noshow_count: number
  is_crew: boolean
}

interface DashboardData {
  pre_registered_count: number
  checked_in_count: number
  unassigned: Attendee[]
  assigned: Record<string, Attendee[]>
  not_arrived: Attendee[]
}

function PersonCard({
  person,
  dimmed = false,
  draggable: isDraggable = false,
  onDragStart,
}: {
  person: Attendee
  dimmed?: boolean
  draggable?: boolean
  onDragStart?: () => void
}) {
  const isNoshowTarget = person.noshow_count >= 2
  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      className={`px-3 py-2 rounded-lg text-sm select-none transition-opacity ${
        isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
      } ${dimmed ? 'opacity-40' : ''} ${
        isNoshowTarget
          ? 'bg-red-900 border border-red-600'
          : 'bg-slate-700 border border-slate-600'
      }`}
    >
      <div className="flex items-center gap-1 font-medium text-white">
        <span>{person.name}</span>
        {person.is_member && <span className="text-base">🍇</span>}
        {isNoshowTarget && (
          <span className="ml-auto text-red-400 text-xs font-normal">박탈대상</span>
        )}
      </div>
      <div className="text-slate-400 text-xs mt-0.5">
        {person.school} · {person.grade} · {person.age}세 · {person.gender}
      </div>
    </div>
  )
}

function TeamCard({
  teamName: initialName,
  members,
  onDrop,
  onRemoveMember,
  onDragStartMember,
  onRename,
}: {
  teamName: string
  members: Attendee[]
  onDrop: (teamName: string) => void
  onRemoveMember: (person: Attendee, teamName: string) => void
  onDragStartMember: (person: Attendee, fromTeam: string) => void
  onRename: (oldName: string, newName: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState(initialName)
  const [dragOver, setDragOver] = useState(false)

  // 포도 단독 or 포도끼리만 → 보라색 점
  const podoList = members.filter((m) => m.is_member)
  const showPurpleDot = podoList.length > 0 && podoList.length === members.length

  const handleRename = () => {
    const trimmed = inputVal.trim()
    if (trimmed && trimmed !== initialName) onRename(initialName, trimmed)
    setEditing(false)
  }

  return (
    <div
      className={`relative bg-slate-800 border-2 rounded-xl p-3 min-h-[120px] transition-colors ${
        dragOver ? 'border-purple-500 bg-slate-700' : 'border-slate-600'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => { setDragOver(false); onDrop(initialName) }}
    >
      {/* 보라색 점 */}
      {showPurpleDot && (
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500" />
      )}

      {/* 팀명 */}
      <div className="mb-2">
        {editing ? (
          <input
            autoFocus
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="bg-slate-700 text-white text-sm font-semibold px-2 py-0.5 rounded w-full outline-none border border-purple-500"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-white text-sm font-semibold hover:text-purple-400 transition-colors"
          >
            {initialName}
          </button>
        )}
      </div>

      {/* 멤버 슬롯 */}
      <div className="space-y-1.5">
        {members.map((m) => (
          <div
            key={m.registration_id}
            draggable
            onDragStart={() => onDragStartMember(m, initialName)}
            className="cursor-grab active:cursor-grabbing"
          >
            <PersonCard person={m} />
          </div>
        ))}
        {/* 빈 슬롯 표시 */}
        {Array.from({ length: Math.max(0, 4 - members.length) }).map((_, i) => (
          <div
            key={i}
            className="h-8 rounded-lg border border-dashed border-slate-600 bg-slate-700/30"
          />
        ))}
      </div>

      {/* 멤버 수 */}
      <div className="mt-2 text-right text-xs text-slate-500">{members.length} / 4</div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoMatchLoading, setAutoMatchLoading] = useState(false)
  const dragRef = useRef<{ person: Attendee; fromTeam: string | null } | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/dashboard-data')
      if (res.status === 401) { router.push('/admin'); return }
      if (res.ok) setData(await res.json())
    } catch {
      showToast('데이터를 불러올 수 없습니다', 'error')
    } finally {
      setLoading(false)
    }
  }

  const assignTeam = async (registration_id: string, team_name: string | null) => {
    await fetch('/api/admin/assign-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_id, team_name }),
    })
  }

  const handleDrop = (targetTeam: string | null) => {
    if (!dragRef.current || !data) return
    const { person, fromTeam } = dragRef.current
    dragRef.current = null

    if (fromTeam === targetTeam) return

    // Optimistic update
    setData((prev) => {
      if (!prev) return prev
      let newUnassigned = [...prev.unassigned]
      const newAssigned = { ...prev.assigned }
      Object.keys(newAssigned).forEach((k) => { newAssigned[k] = [...newAssigned[k]] })

      // 원래 위치에서 제거
      if (fromTeam === null) {
        newUnassigned = newUnassigned.filter((a) => a.registration_id !== person.registration_id)
      } else {
        newAssigned[fromTeam] = (newAssigned[fromTeam] || []).filter(
          (a) => a.registration_id !== person.registration_id
        )
        if (newAssigned[fromTeam].length === 0) delete newAssigned[fromTeam]
      }

      // 새 위치에 추가
      if (targetTeam === null) {
        newUnassigned = [person, ...newUnassigned]
      } else {
        if (!newAssigned[targetTeam]) newAssigned[targetTeam] = []
        if (newAssigned[targetTeam].length < 4) {
          newAssigned[targetTeam] = [...newAssigned[targetTeam], person]
        } else {
          showToast('팀이 가득 찼습니다 (최대 4명)', 'error')
          return prev
        }
      }

      return { ...prev, unassigned: newUnassigned, assigned: newAssigned }
    })

    assignTeam(person.registration_id, targetTeam)
  }

  const handleDropOnNewTeam = () => {
    if (!dragRef.current || !data) return
    const existingNums = Object.keys(data.assigned)
      .map((n) => parseInt(n))
      .filter(Boolean)
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1
    handleDrop(`${nextNum}팀`)
  }

  const handleRenameTeam = (oldName: string, newName: string) => {
    if (!data) return
    if (data.assigned[newName]) {
      showToast('이미 존재하는 팀명입니다', 'error')
      return
    }
    setData((prev) => {
      if (!prev) return prev
      const newAssigned = { ...prev.assigned }
      newAssigned[newName] = newAssigned[oldName]
      delete newAssigned[oldName]
      return { ...prev, assigned: newAssigned }
    })
    // DB: update all members of oldName team
    const members = data.assigned[oldName] || []
    members.forEach((m) => assignTeam(m.registration_id, newName))
  }

  const handleAutoMatch = async () => {
    setAutoMatchLoading(true)
    try {
      const res = await fetch('/api/admin/auto-match', { method: 'POST' })
      if (res.ok) {
        showToast('자동 매칭 완료!', 'success')
        await fetchData()
      } else {
        const d = await res.json()
        showToast(d.message || '오류 발생', 'error')
      }
    } catch {
      showToast('오류가 발생했습니다', 'error')
    } finally {
      setAutoMatchLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">로딩 중...</p>
      </div>
    )
  }

  const preCount = data?.pre_registered_count ?? 0
  const checkedCount = data?.checked_in_count ?? 0
  const missingCount = Math.max(0, preCount - checkedCount)
  const unassigned = data?.unassigned ?? []
  const assigned = data?.assigned ?? {}
  const notArrived = data?.not_arrived ?? []
  const teamNames = Object.keys(assigned).sort((a, b) => parseInt(a) - parseInt(b))

  // 다음 새 팀 번호
  const nextTeamNum =
    teamNames.length > 0
      ? Math.max(...teamNames.map((n) => parseInt(n)).filter(Boolean)) + 1
      : 1

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* 헤더 */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">운영 대시보드</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-400 transition-colors"
          >
            새로고침
          </button>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-400 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 현황바 */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-slate-800 border-b border-slate-700">
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{preCount}</div>
          <div className="text-slate-400 text-sm mt-0.5">오기로 한 인원</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">{checkedCount}</div>
          <div className="text-slate-400 text-sm mt-0.5">현재 온 인원</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-400">{missingCount}</div>
          <div className="text-slate-400 text-sm mt-0.5">미출석</div>
        </div>
      </div>

      {/* 팀 매칭 보드 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 패널: 미배정 + 미출석 */}
        <div
          className="w-72 flex-shrink-0 bg-slate-850 border-r border-slate-700 flex flex-col"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(null)}
        >
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">미배정 출석자</span>
            <span className="text-slate-400 text-xs">{unassigned.length}명</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {unassigned.map((p) => (
              <PersonCard
                key={p.registration_id}
                person={p}
                draggable
                onDragStart={() => { dragRef.current = { person: p, fromTeam: null } }}
              />
            ))}
            {notArrived.length > 0 && (
              <>
                <div className="text-slate-500 text-xs pt-2 pb-1 border-t border-slate-700">
                  미출석 ({notArrived.length}명)
                </div>
                {notArrived.map((p) => (
                  <PersonCard key={p.registration_id} person={p} dimmed />
                ))}
              </>
            )}
            {unassigned.length === 0 && notArrived.length === 0 && (
              <p className="text-slate-500 text-sm text-center pt-8">아직 출석자가 없습니다</p>
            )}
          </div>

          {/* 자동 매칭 버튼 */}
          <div className="p-3 border-t border-slate-700">
            <button
              onClick={handleAutoMatch}
              disabled={autoMatchLoading || unassigned.length === 0}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {autoMatchLoading ? '매칭 중...' : '자동 매칭'}
            </button>
          </div>
        </div>

        {/* 우측 패널: 팀 슬롯 그리드 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {/* 배정된 팀들 */}
            {teamNames.map((teamName) => (
              <TeamCard
                key={teamName}
                teamName={teamName}
                members={assigned[teamName] || []}
                onDrop={handleDrop}
                onRemoveMember={(person, team) => handleDrop(null)}
                onDragStartMember={(person, fromTeam) => {
                  dragRef.current = { person, fromTeam }
                }}
                onRename={handleRenameTeam}
              />
            ))}

            {/* 새 팀 드롭존 (최대 30팀) */}
            {teamNames.length < 30 && (
              <div
                className="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-xl p-3 min-h-[120px] flex items-center justify-center text-slate-500 text-sm hover:border-slate-400 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropOnNewTeam}
              >
                + {nextTeamNum}팀
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 */}
      <footer className="bg-slate-800 border-t border-slate-700 px-6 py-3 flex justify-end">
        <button
          onClick={() => router.push('/admin/dashboard/full')}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
        >
          전체 분석 보기 →
        </button>
      </footer>
    </div>
  )
}

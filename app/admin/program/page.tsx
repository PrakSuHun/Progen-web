'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'
import { Modal, ConfirmModal } from '@/components/Modal'

// ───────────── Types ─────────────
type Tab = 'roster' | 'attendance' | 'deliverables' | 'teams'

interface Cohort { id: number; number: number; name: string; is_current: boolean }
interface Program { id: number; cohort_id: number; title: string; max_absences: number; weekly_cap: number; require_deliverables: boolean }
interface Team { id: number; name: string }
interface Session { id: number; week_no: number | null; label: string; session_date: string | null; deadline: string | null; type: string; counts_for_attendance: boolean; event_id: string | null; sort_order: number }
interface Spec { id: number; project_id: number; name: string; deadline: string | null; sort_order: number }
interface Project { id: number; name: string; sort_order: number; specs?: Spec[] }

interface RosterRow {
  enrollment_id: number; crew_id: number; name: string; school: string | null; grade: string | null
  gender: string | null; is_member: boolean; noshow_count: number
  team_id: number | null; team_name: string | null; is_leader: boolean; status: string; present_weeks: number
  absencesUsed: number; remainingAbsenceBudget: number; attendanceOk: boolean; deliverablesOk: boolean
  status_badge?: string
  // computeEligibility는 status 키로 배지를 줌
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any
}

// ───────────── 1기 기본 일정 시드 데이터 ─────────────
const SEED_SESSIONS = [
  { week_no: null, label: 'OT · 발대식', session_date: '2026-05-30', type: 'ot', counts_for_attendance: false },
  { week_no: 1, label: 'W1 · AI 캐릭터 굿즈 클래스', session_date: '2026-06-27', type: 'class', counts_for_attendance: true },
  { week_no: 2, label: 'W2 · 팀모임 (캐릭터 기획)', session_date: null, type: 'team-meeting', counts_for_attendance: true },
  { week_no: 3, label: 'W3 · 팀모임 (시안·PT 준비)', session_date: null, type: 'team-meeting', counts_for_attendance: true },
  { week_no: 4, label: 'W4 · 경쟁 PT (캐릭터)', session_date: '2026-07-18', type: 'pt', counts_for_attendance: true },
  { week_no: 5, label: 'W5 · 팀모임 (강의 기획)', session_date: null, type: 'team-meeting', counts_for_attendance: true },
  { week_no: 6, label: 'W6 · 여름방학 AI 영상 수익화 클래스', session_date: '2026-08-01', type: 'class', counts_for_attendance: true },
  { week_no: 7, label: 'W7 · 팀모임 (강의영상)', session_date: null, type: 'team-meeting', counts_for_attendance: true },
  { week_no: 8, label: 'W8 · 팀모임 (강의영상)', session_date: null, type: 'team-meeting', counts_for_attendance: true },
  { week_no: 9, label: 'W9 · 중촌동 브랜드 매칭데이', session_date: '2026-08-21', type: 'milestone', counts_for_attendance: true },
  { week_no: 10, label: 'W10 · 웹사이트 제작 교육', session_date: '2026-08-28', type: 'class', counts_for_attendance: true },
  { week_no: 11, label: 'W11 · 팀모임 (웹사이트)', session_date: null, type: 'team-meeting', counts_for_attendance: true },
  { week_no: 12, label: 'W12 · 팀모임 (웹사이트)', session_date: null, type: 'team-meeting', counts_for_attendance: true },
  { week_no: 13, label: 'W13 · 최종 경쟁 PT', session_date: '2026-09-18', type: 'pt', counts_for_attendance: true },
  { week_no: null, label: '수료식', session_date: '2026-11-07', type: 'ceremony', counts_for_attendance: false },
]
const SEED_PROJECTS = [
  { name: 'AI 캐릭터 굿즈', specs: [{ name: '기획안', deadline: '2026-07-05' }, { name: '굿즈 시안', deadline: '2026-07-12' }] },
  { name: 'AI툴 활용 강의영상', specs: [{ name: '강의 기획안', deadline: '2026-07-31' }, { name: '강의영상', deadline: '2026-08-19' }] },
  { name: '중촌동 브랜드 웹사이트', specs: [{ name: '완성된 웹사이트', deadline: '2026-09-19' }] },
]

// ───────────── Helpers ─────────────
function badgeClass(status: string) {
  if (status === '수료가능') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === '수료취소') return 'bg-red-50 text-red-700 border-red-200'
  return 'bg-amber-50 text-amber-700 border-amber-200' // 주의
}
function enrollStatusClass(status: string) {
  if (status === '수료') return 'bg-emerald-100 text-emerald-700'
  if (status === '탈락' || status === '중도포기') return 'bg-red-100 text-red-700'
  return 'bg-sky-100 text-sky-700' // 수강중
}
function api(url: string, method: string, body?: unknown) {
  return fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
}
// 팀명 앞 숫자 추출 ('1팀(Axis)'→1, '10팀(...)'→10). 미배정/숫자없음은 맨 뒤.
function teamNum(name: string | null | undefined): number {
  const m = (name || '').match(/\d+/)
  return m ? parseInt(m[0], 10) : 9999
}

export default function ProgramAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [roster, setRoster] = useState<RosterRow[]>([])
  const [attendance, setAttendance] = useState<{ sessions: Session[]; people: any[]; cells: any[] }>({ sessions: [], people: [], cells: [] })
  const [deliverables, setDeliverables] = useState<{ teams: Team[]; projects: Project[]; specs: Spec[]; deliverables: any[] }>({ teams: [], projects: [], specs: [], deliverables: [] })
  const [tab, setTab] = useState<Tab>('roster')

  // 모달
  const [showAddCrew, setShowAddCrew] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [confirm, setConfirm] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)

  function handle401(res: Response) {
    if (res.status === 401) { router.push('/admin'); return true }
    return false
  }

  async function loadCohorts() {
    const res = await fetch('/api/admin/cohorts')
    if (handle401(res)) return null
    const json = await res.json()
    setCohorts(json.data ?? [])
    const cid = json.currentCohortId ?? json.data?.[0]?.id ?? null
    return cid
  }

  async function loadProgram(cohortId: number) {
    const res = await fetch(`/api/admin/program?cohort_id=${cohortId}`)
    if (handle401(res)) return
    const json = await res.json()
    setProgram(json.program)
    setTeams(json.teams ?? [])
    setSessions(json.sessions ?? [])
    setProjects(json.projects ?? [])
    if (json.program) await loadAll(json.program.id)
    else { setRoster([]); setAttendance({ sessions: [], people: [], cells: [] }); setDeliverables({ teams: [], projects: [], specs: [], deliverables: [] }) }
  }

  async function loadRoster(programId: number) {
    const res = await fetch(`/api/admin/program/roster?program_id=${programId}`)
    if (handle401(res)) return
    const json = await res.json()
    setRoster(json.roster ?? [])
  }
  async function loadAttendance(programId: number) {
    const res = await fetch(`/api/admin/program/attendance?program_id=${programId}`)
    if (handle401(res)) return
    setAttendance(await res.json())
  }
  async function loadDeliverables(programId: number) {
    const res = await fetch(`/api/admin/program/deliverables?program_id=${programId}`)
    if (handle401(res)) return
    setDeliverables(await res.json())
  }
  async function loadAll(programId: number) {
    await Promise.all([loadRoster(programId), loadAttendance(programId), loadDeliverables(programId)])
  }

  useEffect(() => {
    (async () => {
      const cid = await loadCohorts()
      if (cid) { setSelectedCohortId(cid); await loadProgram(cid) }
      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function changeCohort(cid: number) {
    setSelectedCohortId(cid)
    setLoading(true)
    await loadProgram(cid)
    setLoading(false)
  }

  // ── 1기 기본 일정·프로젝트 시드 ──
  async function seedSchedule() {
    if (!program) return
    try {
      for (let i = 0; i < SEED_SESSIONS.length; i++) {
        const s = SEED_SESSIONS[i]
        await api('/api/admin/program/sessions', 'POST', { program_id: program.id, ...s, sort_order: i })
      }
      for (let i = 0; i < SEED_PROJECTS.length; i++) {
        const p = SEED_PROJECTS[i]
        await api('/api/admin/program/projects', 'POST', { program_id: program.id, name: p.name, sort_order: i, specs: p.specs })
      }
      showToast('1기 기본 일정·프로젝트를 생성했습니다', 'success')
      await loadProgram(program.cohort_id)
    } catch {
      showToast('생성 중 오류가 발생했습니다', 'error')
    }
  }

  const rosterStats = useMemo(() => {
    const s = { total: roster.length, ok: 0, warn: 0, cancel: 0 }
    for (const r of roster) {
      if (r.eligibilityStatus === '수료가능') s.ok++
      else if (r.eligibilityStatus === '수료취소') s.cancel++
      else s.warn++
    }
    return s
  }, [roster])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#888]">불러오는 중…</div>
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      {/* 헤더 */}
      <div className="bg-sky-600 text-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-4 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-black mr-2">프로그램 · 수료 관리</h1>
          <select
            value={selectedCohortId ?? ''}
            onChange={(e) => changeCohort(Number(e.target.value))}
            className="bg-sky-700 border border-sky-500 text-white rounded-lg px-3 py-1.5 text-sm"
          >
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.is_current ? ' (현재)' : ''}</option>
            ))}
          </select>
          {program && (
            <button
              onClick={() => setShowSettings(true)}
              className="text-sm bg-sky-700/60 hover:bg-sky-700 rounded-lg px-3 py-1.5 border border-sky-500"
              title="수료 룰 설정"
            >
              {program.title} · 결석 {program.max_absences}회까지 · 결과물 {program.require_deliverables ? '필수' : '참고'}
            </button>
          )}
          <div className="ml-auto flex items-center gap-2 text-sm">
            <a href="/admin/dashboard" className="bg-sky-700/60 hover:bg-sky-700 rounded-lg px-3 py-1.5 border border-sky-500">행사 대시보드</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6">
        {!program ? (
          <div className="bg-white rounded-2xl border border-[#eee] p-10 text-center text-[#888]">
            이 기수에는 프로그램이 없습니다. (기수 생성 시 자동 생성됩니다)
          </div>
        ) : (
          <>
            {/* 탭 */}
            <div className="flex gap-1 mb-5 border-b border-[#eee]">
              {([['roster', '참가자 명단'], ['attendance', '출석 매트릭스'], ['deliverables', '결과물'], ['teams', '팀 관리']] as [Tab, string][]).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${tab === t ? 'border-sky-500 text-sky-600' : 'border-transparent text-[#888] hover:text-black'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {(sessions.length === 0 || projects.length === 0) && (
              <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <span className="text-sm text-amber-800">아직 회차/프로젝트가 없습니다. 1기 13주 일정과 프로젝트 3종을 한 번에 생성할 수 있어요.</span>
                <button onClick={seedSchedule} className="text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3 py-1.5 whitespace-nowrap">1기 기본 일정 생성</button>
              </div>
            )}

            {tab === 'roster' && <RosterTab roster={roster} stats={rosterStats} onAdd={() => setShowAddCrew(true)} program={program}
              onStatus={async (id, status) => { await api('/api/admin/program/enrollment-status', 'POST', { enrollment_id: id, status }); await loadRoster(program.id) }}
              onRemove={(id, name) => setConfirm({ title: '등록 해제', message: `${name} 님을 프로그램에서 제외할까요? 출석·증빙 기록도 함께 삭제됩니다.`, onConfirm: async () => { await api('/api/admin/program/enroll', 'DELETE', { enrollment_id: id }); setConfirm(null); await loadRoster(program.id) } })}
              teams={teams}
              onAssign={async (id, teamId) => { await api('/api/admin/program/assign-team', 'POST', { enrollment_id: id, team_id: teamId }); await loadRoster(program.id) }}
            />}

            {tab === 'attendance' && <AttendanceTab data={attendance} program={program} teams={teams}
              onToggle={async (enrollment_id, session_id, present) => { await api('/api/admin/program/attendance-toggle', 'POST', { enrollment_id, session_id, present }); await Promise.all([loadAttendance(program.id), loadRoster(program.id)]) }}
            />}

            {tab === 'deliverables' && <DeliverablesTab data={deliverables}
              onToggle={async (team_id, spec_id, submitted) => { await api('/api/admin/program/deliverable-toggle', 'POST', { team_id, spec_id, submitted }); await Promise.all([loadDeliverables(program.id), loadRoster(program.id)]) }}
            />}

            {tab === 'teams' && <TeamsTab teams={teams} roster={roster} program={program}
              reload={async () => { await loadProgram(program.cohort_id) }}
              onAssign={async (id, teamId) => { await api('/api/admin/program/assign-team', 'POST', { enrollment_id: id, team_id: teamId }); await Promise.all([loadProgram(program.cohort_id)]) }}
              setConfirm={setConfirm}
            />}
          </>
        )}
      </div>

      {showAddCrew && program && (
        <AddCrewModal
          enrolledCrewIds={new Set(roster.map((r) => r.crew_id))}
          onClose={() => setShowAddCrew(false)}
          onEnroll={async (crewId) => { const res = await api('/api/admin/program/enroll', 'POST', { program_id: program.id, crew_id: crewId }); if (res.status === 409) { showToast('이미 등록된 크루입니다', 'info') } else if (res.ok) { showToast('등록되었습니다', 'success'); await loadRoster(program.id) } }}
        />
      )}

      {showSettings && program && (
        <SettingsModal program={program} onClose={() => setShowSettings(false)}
          onSave={async (patch) => { await api('/api/admin/program', 'PATCH', { program_id: program.id, ...patch }); setShowSettings(false); showToast('설정이 저장되었습니다', 'success'); await loadProgram(program.cohort_id) }}
        />
      )}

      {confirm && (
        <ConfirmModal isOpen title={confirm.title} message={confirm.message}
          onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} confirmText="확인" cancelText="취소" />
      )}
    </div>
  )
}

// ───────────── 참가자 명단 탭 ─────────────
function RosterTab({ roster, stats, onAdd, onStatus, onRemove, teams, onAssign }: {
  roster: RosterRow[]; stats: { total: number; ok: number; warn: number; cancel: number }
  onAdd: () => void; program: Program
  onStatus: (id: number, status: string) => void
  onRemove: (id: number, name: string) => void
  teams: Team[]
  onAssign: (id: number, teamId: number | null) => void
}) {
  const [q, setQ] = useState('')
  const filtered = roster.filter((r) => !q || r.name.includes(q) || (r.school ?? '').includes(q))

  // 팀별 그룹핑: 팀 번호순 → 미배정 맨 끝
  const orderedTeams = [...teams].sort((a, b) => teamNum(a.name) - teamNum(b.name))
  // 팀 내부 정렬: 팀장 먼저 → 이름순
  const sortMembers = (rows: RosterRow[]) =>
    [...rows].sort((a, b) => (b.is_leader ? 1 : 0) - (a.is_leader ? 1 : 0) || a.name.localeCompare(b.name, 'ko'))
  const groups: { key: string; label: string; leader: string | null; rows: RosterRow[] }[] = []
  for (const t of orderedTeams) {
    const rows = filtered.filter((r) => r.team_id === t.id)
    if (rows.length > 0) {
      const leader = roster.find((r) => r.team_id === t.id && r.is_leader)?.name ?? null
      groups.push({ key: `team-${t.id}`, label: t.name, leader, rows: sortMembers(rows) })
    }
  }
  const unassigned = filtered.filter((r) => !r.team_id)
  if (unassigned.length > 0) groups.push({ key: 'unassigned', label: '미배정', leader: null, rows: sortMembers(unassigned) })

  const renderRow = (r: RosterRow) => (
    <tr key={r.enrollment_id} className="border-b border-[#f3f3f3] last:border-0">
      <td className="px-4 py-3 font-bold whitespace-nowrap">
        {r.is_member && <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5 align-middle" title="포도" />}
        {r.name}
        {r.is_leader && <span className="ml-1.5 inline-block align-middle text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-200 rounded px-1.5 py-0.5">팀장</span>}
      </td>
      <td className="px-4 py-3 text-[#666] whitespace-nowrap">{r.school ?? '-'} {r.grade ?? ''}</td>
      <td className="px-4 py-3">
        <select value={r.team_id ?? ''} onChange={(e) => onAssign(r.enrollment_id, e.target.value ? Number(e.target.value) : null)}
          className="border border-[#ddd] rounded-md px-2 py-1 text-xs">
          <option value="">미배정</option>
          {[...teams].sort((a, b) => teamNum(a.name) - teamNum(b.name)).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </td>
      <td className="px-4 py-3 text-center">{r.present_weeks}</td>
      <td className="px-4 py-3 text-center">
        <span className={r.remainingAbsenceBudget <= 1 ? 'text-red-600 font-bold' : 'text-[#666]'}>{r.remainingAbsenceBudget}</span>
      </td>
      <td className="px-4 py-3 text-center">{r.deliverablesOk ? '✓' : <span className="text-[#ccc]">—</span>}</td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-block text-xs font-bold border rounded-full px-2.5 py-1 ${badgeClass(r.eligibilityStatus)}`}>{r.eligibilityStatus}</span>
      </td>
      <td className="px-4 py-3">
        <select value={r.status} onChange={(e) => onStatus(r.enrollment_id, e.target.value)}
          className={`rounded-md px-2 py-1 text-xs font-bold ${enrollStatusClass(r.status)}`}>
          {['수강중', '중도포기', '수료', '탈락'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={() => onRemove(r.enrollment_id, r.name)} className="text-[#bbb] hover:text-red-500 text-xs">제외</button>
      </td>
    </tr>
  )

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-2 text-sm">
          <span className="bg-white border border-[#eee] rounded-lg px-3 py-1.5">총 <b>{stats.total}</b></span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-1.5">수료가능 <b>{stats.ok}</b></span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-3 py-1.5">주의 <b>{stats.warn}</b></span>
          <span className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-1.5">수료취소 <b>{stats.cancel}</b></span>
        </div>
        <div className="ml-auto flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름·학교 검색"
            className="border border-[#ddd] rounded-lg px-3 py-1.5 text-sm w-44" />
          <button onClick={onAdd} className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-lg px-3 py-1.5">+ 크루 추가</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#eee] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#888] border-b border-[#eee]">
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">학교/학년</th>
              <th className="px-4 py-3">팀</th>
              <th className="px-4 py-3 text-center">출석(주)</th>
              <th className="px-4 py-3 text-center">남은 결석</th>
              <th className="px-4 py-3 text-center">결과물</th>
              <th className="px-4 py-3 text-center">수료 판정</th>
              <th className="px-4 py-3">등록 상태</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          {filtered.length === 0 && (
            <tbody>
              <tr><td colSpan={9} className="px-4 py-10 text-center text-[#aaa]">등록된 참가자가 없습니다.</td></tr>
            </tbody>
          )}
          {groups.map((g) => (
            <tbody key={g.key}>
              <tr className="bg-[#f6f9fc] border-y border-[#e8eef4]">
                <td colSpan={9} className="px-4 py-2 text-xs font-black text-sky-700">
                  {g.label} <span className="text-[#aaa] font-normal">· {g.rows.length}명{g.leader ? ` · 팀장 ${g.leader}` : ''}</span>
                </td>
              </tr>
              {g.rows.map(renderRow)}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  )
}

// ───────────── 출석 매트릭스 탭 ─────────────
function AttendanceTab({ data, program, teams, onToggle }: {
  data: { sessions: Session[]; people: any[]; cells: any[] }; program: Program; teams: Team[]
  onToggle: (enrollment_id: number, session_id: number, present: boolean) => void
}) {
  const cellMap = useMemo(() => {
    const m = new Map<string, any>()
    for (const c of data.cells) m.set(`${c.enrollment_id}:${c.session_id}`, c)
    return m
  }, [data.cells])

  const colCount = data.sessions.length + 2 // 참가자 + 세션들 + 남은결석

  if (data.sessions.length === 0) return <div className="bg-white rounded-2xl border border-[#eee] p-10 text-center text-[#aaa]">회차가 없습니다. 상단에서 일정을 먼저 생성하세요.</div>
  if (data.people.length === 0) return <div className="bg-white rounded-2xl border border-[#eee] p-10 text-center text-[#aaa]">등록된 참가자가 없습니다.</div>

  // 팀별 그룹핑(1팀→10팀 → 미배정)
  const orderedTeams = [...teams].sort((a, b) => teamNum(a.name) - teamNum(b.name))
  const groups: { key: string; label: string; rows: any[] }[] = []
  for (const t of orderedTeams) {
    const rows = data.people.filter((p) => p.team_id === t.id).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    if (rows.length > 0) groups.push({ key: `t${t.id}`, label: t.name, rows })
  }
  const unassigned = data.people.filter((p) => !p.team_id).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  if (unassigned.length > 0) groups.push({ key: 'un', label: '미배정', rows: unassigned })

  // 오늘(KST) 이전에 열린 회차만 결석 모수에 포함 — 아직 날짜가 안 온(예정)·날짜 미정 회차는 제외
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })

  const renderRow = (p: any) => {
    // 주당 1회 cap: 집계 세션을 주차(week) 단위로 묶어 present week 수 계산
    const presentWeeks = new Set<number>()
    const weekSet = new Set<number>()
    let nonWeek = 0
    for (const s of data.sessions) {
      if (!s.counts_for_attendance) continue
      if (s.session_date == null || s.session_date > today) continue // 예정·날짜미정 제외
      if (s.week_no != null) weekSet.add(s.week_no); else nonWeek++
      const c = cellMap.get(`${p.enrollment_id}:${s.id}`)
      if (c?.present) presentWeeks.add(s.week_no != null ? s.week_no : -s.id)
    }
    const total = weekSet.size + nonWeek
    const remaining = Math.max(0, program.max_absences - Math.max(0, total - presentWeeks.size))
    return (
      <tr key={p.enrollment_id} className="border-b border-[#f3f3f3] last:border-0">
        <td className="sticky left-0 bg-white px-4 py-2 font-bold whitespace-nowrap border-r border-[#eee] z-10">
          {p.is_member && <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5 align-middle" />}
          {p.name}
        </td>
        {data.sessions.map((s) => {
          const c = cellMap.get(`${p.enrollment_id}:${s.id}`)
          const present = !!c?.present
          return (
            <td key={s.id} className="px-1 py-1 text-center">
              <button
                onClick={() => onToggle(p.enrollment_id, s.id, !present)}
                title={c?.source === 'checkin' ? '현장 체크인 자동' : '수동'}
                className={`w-8 h-8 rounded-md text-sm font-bold transition-colors ${present ? (c?.source === 'checkin' ? 'bg-sky-500 text-white' : 'bg-emerald-500 text-white') : 'bg-[#f3f3f3] text-[#ddd] hover:bg-[#e9e9e9]'}`}
              >{present ? '✓' : ''}</button>
            </td>
          )
        })}
        <td className="px-3 py-2 text-center border-l border-[#eee]">
          <span className={remaining <= 1 ? 'text-red-600 font-bold' : 'text-[#666]'}>{remaining}</span>
        </td>
      </tr>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#eee] overflow-x-auto">
      <table className="text-sm border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white px-4 py-3 text-left text-[#888] border-b border-r border-[#eee] z-10">참가자</th>
            {data.sessions.map((s) => (
              <th key={s.id} className={`px-2 py-2 text-center border-b border-[#eee] min-w-[64px] ${s.counts_for_attendance ? '' : 'bg-[#fafafa] text-[#bbb]'}`}>
                <div className="text-[11px] font-bold whitespace-nowrap">{s.week_no != null ? `W${s.week_no}` : s.type === 'ot' ? 'OT' : '수료식'}</div>
                <div className="text-[10px] text-[#aaa] whitespace-nowrap">{s.session_date ? s.session_date.slice(5) : '자율'}</div>
                {!s.counts_for_attendance && <div className="text-[9px] text-[#ccc]">미집계</div>}
              </th>
            ))}
            <th className="px-3 py-2 text-center border-b border-l border-[#eee] text-[#888]">남은<br />결석</th>
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g.key}>
            <tr className="bg-[#f6f9fc] border-y border-[#e8eef4]">
              <td colSpan={colCount} className="sticky left-0 px-4 py-1.5 text-xs font-black text-sky-700 z-10">
                {g.label} <span className="text-[#aaa] font-normal">· {g.rows.length}명</span>
              </td>
            </tr>
            {g.rows.map(renderRow)}
          </tbody>
        ))}
      </table>
      <div className="px-4 py-3 text-xs text-[#aaa] flex gap-4 border-t border-[#eee]">
        <span><span className="inline-block w-3 h-3 rounded bg-emerald-500 align-middle mr-1" />수동</span>
        <span><span className="inline-block w-3 h-3 rounded bg-sky-500 align-middle mr-1" />현장 체크인 자동</span>
        <span>· 같은 주 여러 번 출석해도 1회만 인정</span>
      </div>
    </div>
  )
}
// ───────────── 결과물 탭 ─────────────
function DeliverablesTab({ data, onToggle }: {
  data: { teams: Team[]; projects: Project[]; specs: Spec[]; deliverables: any[] }
  onToggle: (team_id: number, spec_id: number, submitted: boolean) => void
}) {
  const delMap = useMemo(() => {
    const m = new Map<string, any>()
    for (const d of data.deliverables) m.set(`${d.team_id}:${d.spec_id}`, d)
    return m
  }, [data.deliverables])
  const specsByProject = useMemo(() => {
    const m = new Map<number, Spec[]>()
    for (const s of data.specs) { const a = m.get(s.project_id) ?? []; a.push(s); m.set(s.project_id, a) }
    return m
  }, [data.specs])

  if (data.projects.length === 0) return <div className="bg-white rounded-2xl border border-[#eee] p-10 text-center text-[#aaa]">프로젝트가 없습니다. 상단에서 기본 프로젝트를 생성하세요.</div>
  if (data.teams.length === 0) return <div className="bg-white rounded-2xl border border-[#eee] p-10 text-center text-[#aaa]">팀이 없습니다. ‘팀 관리’ 탭에서 팀을 먼저 만드세요.</div>

  function onTime(spec: Spec, d: any) {
    if (!d?.submitted) return null
    if (!spec.deadline || !d.submitted_at) return true
    return d.submitted_at.slice(0, 10) <= spec.deadline
  }

  const orderedTeams = [...data.teams].sort((a, b) => teamNum(a.name) - teamNum(b.name))

  return (
    <div className="bg-white rounded-2xl border border-[#eee] overflow-x-auto">
      <table className="text-sm border-collapse">
        <thead>
          <tr>
            <th rowSpan={2} className="sticky left-0 bg-white px-4 py-2 text-left text-[#888] border-b border-r border-[#eee] z-10">팀</th>
            {data.projects.map((p) => (
              <th key={p.id} colSpan={(specsByProject.get(p.id) ?? []).length || 1} className="px-3 py-2 text-center border-b border-l border-[#eee] text-[#666] font-bold">{p.name}</th>
            ))}
          </tr>
          <tr>
            {data.projects.flatMap((p) => (specsByProject.get(p.id) ?? []).map((s) => (
              <th key={s.id} className="px-3 py-2 text-center border-b border-[#eee] text-[11px] text-[#888] whitespace-nowrap">
                {s.name}<div className="text-[10px] text-[#bbb]">~{s.deadline?.slice(5) ?? '미정'}</div>
              </th>
            )))}
          </tr>
        </thead>
        <tbody>
          {orderedTeams.map((t) => (
            <tr key={t.id} className="border-b border-[#f3f3f3] last:border-0">
              <td className="sticky left-0 bg-white px-4 py-2 font-bold whitespace-nowrap border-r border-[#eee] z-10">{t.name}</td>
              {data.projects.flatMap((p) => (specsByProject.get(p.id) ?? []).map((s) => {
                const d = delMap.get(`${t.id}:${s.id}`)
                const ot = onTime(s, d)
                return (
                  <td key={s.id} className="px-2 py-1 text-center">
                    <button onClick={() => onToggle(t.id, s.id, !d?.submitted)}
                      className={`w-9 h-8 rounded-md text-xs font-bold ${d?.submitted ? (ot ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white') : 'bg-[#f3f3f3] text-[#ddd] hover:bg-[#e9e9e9]'}`}
                      title={d?.submitted ? (ot ? '기한내 제출' : '지연 제출') : '미제출'}
                    >{d?.submitted ? (ot ? '✓' : '!') : ''}</button>
                  </td>
                )
              }))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 text-xs text-[#aaa] flex gap-4 border-t border-[#eee]">
        <span><span className="inline-block w-3 h-3 rounded bg-emerald-500 align-middle mr-1" />기한내</span>
        <span><span className="inline-block w-3 h-3 rounded bg-amber-500 align-middle mr-1" />지연</span>
      </div>
    </div>
  )
}

// ───────────── 팀 관리 탭 ─────────────
function TeamsTab({ teams, roster, program, reload, onAssign, setConfirm }: {
  teams: Team[]; roster: RosterRow[]; program: Program
  reload: () => Promise<void>
  onAssign: (id: number, teamId: number | null) => void
  setConfirm: (c: { title: string; message: string; onConfirm: () => void } | null) => void
}) {
  const [newName, setNewName] = useState('')
  const unassigned = roster.filter((r) => !r.team_id)

  async function addTeam() {
    if (!newName.trim()) return
    const res = await api('/api/admin/program/teams', 'POST', { program_id: program.id, name: newName.trim() })
    if (res.status === 409) showToast('이미 존재하는 팀명입니다', 'info')
    else if (res.ok) { setNewName(''); showToast('팀이 생성되었습니다', 'success'); await reload() }
  }
  async function rename(team: Team) {
    const name = window.prompt('새 팀명', team.name)
    if (!name || name === team.name) return
    const res = await api('/api/admin/program/teams', 'PATCH', { team_id: team.id, name })
    if (res.ok) { showToast('팀명이 변경되었습니다', 'success'); await reload() }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-5">
      <div className="space-y-4">
        {teams.length === 0 && <div className="bg-white rounded-2xl border border-[#eee] p-8 text-center text-[#aaa]">팀이 없습니다. 오른쪽에서 추가하세요.</div>}
        {[...teams].sort((a, b) => teamNum(a.name) - teamNum(b.name)).map((t) => {
          const members = roster.filter((r) => r.team_id === t.id)
            .sort((a, b) => (b.is_leader ? 1 : 0) - (a.is_leader ? 1 : 0) || a.name.localeCompare(b.name, 'ko'))
          const leaderName = members.find((m) => m.is_leader)?.name ?? null
          return (
            <div key={t.id} className="bg-white rounded-2xl border border-[#eee] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black">{t.name} <span className="text-[#aaa] text-sm font-normal">({members.length}명{leaderName ? ` · 팀장 ${leaderName}` : ''})</span></h3>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => rename(t)} className="text-[#888] hover:text-black">이름변경</button>
                  <button onClick={() => setConfirm({ title: '팀 삭제', message: `${t.name}을(를) 삭제할까요? 소속 인원은 미배정이 됩니다.`, onConfirm: async () => { await api('/api/admin/program/teams', 'DELETE', { team_id: t.id }); setConfirm(null); await reload() } })} className="text-[#bbb] hover:text-red-500">삭제</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {members.length === 0 && <span className="text-xs text-[#ccc]">배정된 인원 없음</span>}
                {members.map((m) => (
                  <span key={m.enrollment_id} className={`inline-flex items-center gap-1.5 rounded-full pl-3 pr-1.5 py-1 text-sm ${m.is_leader ? 'bg-sky-50 border border-sky-200' : 'bg-[#f6f6f6]'}`}>
                    {m.is_member && <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500" />}
                    {m.name}
                    {m.is_leader && <span className="text-[10px] font-bold text-sky-600">팀장</span>}
                    <button onClick={() => onAssign(m.enrollment_id, null)} className="text-[#bbb] hover:text-red-500 text-xs w-4">✕</button>
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-[#eee] p-4">
          <h3 className="font-black mb-2 text-sm">팀 추가</h3>
          <div className="flex gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTeam()} placeholder="예: 1팀" className="border border-[#ddd] rounded-lg px-3 py-1.5 text-sm flex-1" />
            <button onClick={addTeam} className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-lg px-3">추가</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#eee] p-4">
          <h3 className="font-black mb-2 text-sm">미배정 ({unassigned.length})</h3>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {unassigned.length === 0 && <span className="text-xs text-[#ccc]">없음</span>}
            {unassigned.map((m) => (
              <div key={m.enrollment_id} className="flex items-center justify-between gap-2 text-sm">
                <span>{m.is_member && <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5 align-middle" />}{m.name}</span>
                <select onChange={(e) => e.target.value && onAssign(m.enrollment_id, Number(e.target.value))} defaultValue="" className="border border-[#ddd] rounded-md px-2 py-1 text-xs">
                  <option value="">팀 선택</option>
                  {[...teams].sort((a, b) => teamNum(a.name) - teamNum(b.name)).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ───────────── 크루 추가 모달 ─────────────
function AddCrewModal({ enrolledCrewIds, onClose, onEnroll }: {
  enrolledCrewIds: Set<number>; onClose: () => void; onEnroll: (crewId: number) => void
}) {
  const [all, setAll] = useState<any[]>([])
  const [q, setQ] = useState('')
  useEffect(() => {
    fetch('/api/admin/members-list?mode=all').then((r) => r.json()).then((j) => {
      const list = (j.members ?? []).filter((m: any) => !enrolledCrewIds.has(m.id))
      list.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', 'ko'))
      setAll(list)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const filtered = all.filter((m) => !q || (m.name || '').includes(q) || (m.school || '').includes(q))
  return (
    <Modal isOpen title="크루 추가" onClose={onClose}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름·학교 검색" className="w-full border border-[#ddd] rounded-lg px-3 py-2 text-sm mb-3" />
      <div className="max-h-80 overflow-y-auto divide-y divide-[#f3f3f3]">
        {filtered.length === 0 && <div className="py-8 text-center text-[#aaa] text-sm">추가할 크루가 없습니다.</div>}
        {filtered.map((m) => (
          <div key={m.id} className="flex items-center justify-between py-2.5">
            <div className="text-sm">
              <span className="font-bold">{m.is_member && <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5 align-middle" />}{m.name}</span>
              <span className="text-[#999] ml-2">{m.school} {m.grade}</span>
            </div>
            <button onClick={() => onEnroll(m.id)} className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-lg px-3 py-1.5">등록</button>
          </div>
        ))}
      </div>
    </Modal>
  )
}

// ───────────── 룰 설정 모달 ─────────────
function SettingsModal({ program, onClose, onSave }: {
  program: Program; onClose: () => void; onSave: (patch: any) => void
}) {
  const [maxAbsences, setMaxAbsences] = useState(program.max_absences)
  const [requireDeliverables, setRequireDeliverables] = useState(program.require_deliverables)
  const [title, setTitle] = useState(program.title)
  return (
    <Modal isOpen title="수료 룰 설정" onClose={onClose}
      footer={<div className="flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 text-sm text-[#888]">취소</button><button onClick={() => onSave({ title, max_absences: maxAbsences, require_deliverables: requireDeliverables })} className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-lg px-4 py-2">저장</button></div>}>
      <div className="space-y-4 text-sm">
        <label className="block">
          <span className="text-[#666] font-bold">프로그램명</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-[#ddd] rounded-lg px-3 py-2 mt-1" />
        </label>
        <label className="block">
          <span className="text-[#666] font-bold">허용 결석 횟수 (초과 시 수료취소)</span>
          <input type="number" min={0} value={maxAbsences} onChange={(e) => setMaxAbsences(Number(e.target.value))} className="w-full border border-[#ddd] rounded-lg px-3 py-2 mt-1" />
          <span className="text-xs text-[#aaa]">기본 4 — 13주 중 9주 이상 출석 시 수료 가능</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={requireDeliverables} onChange={(e) => setRequireDeliverables(e.target.checked)} />
          <span className="text-[#666] font-bold">팀 결과물 기한내 제출을 수료 조건에 포함</span>
        </label>
      </div>
    </Modal>
  )
}

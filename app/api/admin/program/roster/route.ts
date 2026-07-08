import { createAdminClient } from '@/lib/supabase-admin'
import { computeEligibility } from '@/lib/program-eligibility'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 프로그램 참가자 명단 + 계산된 수료 배지
// ?program_id 필수
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const programId = Number(request.nextUrl.searchParams.get('program_id'))
    if (!programId) {
      return NextResponse.json({ message: 'program_id가 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()

    // 룰 설정
    const { data: program } = await supabase
      .from('programs')
      .select('id, max_absences, weekly_cap, require_deliverables')
      .eq('id', programId)
      .maybeSingle()
    if (!program) {
      return NextResponse.json({ message: '프로그램을 찾을 수 없습니다' }, { status: 404 })
    }

    // 출석 모수 세션(주차별, counts_for_attendance=true)
    const { data: sessions } = await supabase
      .from('program_sessions')
      .select('id, week_no, counts_for_attendance, session_date')
      .eq('program_id', programId)
    // 오늘(KST) 이전에 열린 회차만 결석 모수에 포함 — 아직 날짜가 안 온(예정)·날짜 미정 회차는 제외
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
    const countingSessions = (sessions ?? []).filter(
      (s) => s.counts_for_attendance && s.session_date != null && s.session_date <= today
    )
    const countingSessionIds = new Set(countingSessions.map((s) => s.id))
    const weekBySession = new Map<number, number | null>((sessions ?? []).map((s) => [s.id, s.week_no]))
    // 주차 단위 모수: week_no가 있으면 distinct week, 없는(OT 등 비카운트) 세션은 모수 자체에서 제외돼 있음
    const attendanceWeeks = new Set<number>()
    let nonWeekCounting = 0
    for (const s of countingSessions) {
      if (s.week_no != null) attendanceWeeks.add(s.week_no)
      else nonWeekCounting += 1
    }
    const attendanceSessionsTotal = attendanceWeeks.size + nonWeekCounting

    // 등록자 + 크루 정보 + 팀
    const { data: enrollments } = await supabase
      .from('program_enrollments')
      .select('id, crew_id, team_id, status, is_leader, joined_at, crew_members(name, school, grade, age, gender, major, phone, is_member, noshow_count)')
      .eq('program_id', programId)
      .order('id', { ascending: true })

    const { data: teams } = await supabase
      .from('program_teams')
      .select('id, name')
      .eq('program_id', programId)
    const teamNameById = new Map<number, string>((teams ?? []).map((t) => [t.id, t.name]))

    const enrollmentIds = (enrollments ?? []).map((e) => e.id)

    // 출석(인정 세션 한정)
    const attByEnrollment = new Map<number, Set<number>>() // enrollment_id → present week-keys
    if (enrollmentIds.length > 0) {
      const { data: att } = await supabase
        .from('program_attendance')
        .select('enrollment_id, session_id, present')
        .in('enrollment_id', enrollmentIds)
        .eq('present', true)
      for (const a of att ?? []) {
        if (!countingSessionIds.has(a.session_id)) continue
        const wk = weekBySession.get(a.session_id)
        // 주당 1회 cap: week_no 있으면 'w<week>', 없으면 세션 고유키
        const key = wk != null ? wk : -a.session_id
        const set = attByEnrollment.get(a.enrollment_id) ?? new Set<number>()
        set.add(key)
        attByEnrollment.set(a.enrollment_id, set)
      }
    }

    // 팀 결과물 기한내 제출 집계 (require_deliverables 시)
    const teamDeliverables = new Map<number, { total: number; submittedOnTime: number }>()
    if (program.require_deliverables) {
      const { data: specs } = await supabase
        .from('program_deliverable_specs')
        .select('id, deadline, program_projects!inner(program_id)')
        .eq('program_projects.program_id', programId)
      const specDeadline = new Map<number, string | null>((specs ?? []).map((s: any) => [s.id, s.deadline]))
      const totalSpecs = (specs ?? []).length

      const teamIds = (teams ?? []).map((t) => t.id)
      const submittedOnTimeByTeam = new Map<number, number>()
      if (teamIds.length > 0 && totalSpecs > 0) {
        const { data: dels } = await supabase
          .from('program_deliverables')
          .select('team_id, spec_id, submitted, submitted_at')
          .in('team_id', teamIds)
          .eq('submitted', true)
        for (const d of dels ?? []) {
          const dl = specDeadline.get(d.spec_id)
          const onTime = !dl || !d.submitted_at || d.submitted_at.slice(0, 10) <= dl
          if (onTime) submittedOnTimeByTeam.set(d.team_id, (submittedOnTimeByTeam.get(d.team_id) ?? 0) + 1)
        }
      }
      for (const t of teams ?? []) {
        teamDeliverables.set(t.id, { total: totalSpecs, submittedOnTime: submittedOnTimeByTeam.get(t.id) ?? 0 })
      }
    }

    const roster = (enrollments ?? []).map((e: any) => {
      const crew = Array.isArray(e.crew_members) ? e.crew_members[0] : e.crew_members
      const presentWeeks = attByEnrollment.get(e.id)?.size ?? 0
      const td = e.team_id ? teamDeliverables.get(e.team_id) ?? { total: 0, submittedOnTime: 0 } : { total: 0, submittedOnTime: 0 }
      const eligibility = computeEligibility({
        attendanceSessionsTotal,
        presentWeeks,
        maxAbsences: program.max_absences,
        requireDeliverables: program.require_deliverables,
        teamDeliverables: e.team_id ? td : { total: 0, submittedOnTime: 0 },
      })
      return {
        enrollment_id: e.id,
        crew_id: e.crew_id,
        name: crew?.name ?? '(이름없음)',
        school: crew?.school ?? null,
        grade: crew?.grade ?? null,
        age: crew?.age ?? null,
        gender: crew?.gender ?? null,
        major: crew?.major ?? null,
        phone: crew?.phone ?? null,
        is_member: crew?.is_member ?? false,
        noshow_count: crew?.noshow_count ?? 0,
        team_id: e.team_id,
        team_name: e.team_id ? teamNameById.get(e.team_id) ?? null : null,
        is_leader: e.is_leader ?? false,
        status: e.status, // 등록 상태(수강중/중도포기/수료/탈락)
        joined_at: e.joined_at,
        present_weeks: presentWeeks,
        // 수료 판정(계산값) — 등록 status 와 구분해 eligibility* 로 노출
        eligibilityStatus: eligibility.status,
        absencesUsed: eligibility.absencesUsed,
        remainingAbsenceBudget: eligibility.remainingAbsenceBudget,
        attendanceOk: eligibility.attendanceOk,
        deliverablesOk: eligibility.deliverablesOk,
      }
    })

    return NextResponse.json({ attendanceSessionsTotal, roster })
  } catch (error) {
    console.error('program roster error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

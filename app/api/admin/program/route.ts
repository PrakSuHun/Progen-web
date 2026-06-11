import { createAdminClient } from '@/lib/supabase-admin'
import { getCurrentCohortId } from '@/lib/get-active-cohort'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 프로그램 설정 + 세션/팀/프로젝트(산출물) 스냅샷 조회
// ?cohort_id 없으면 현재 기수의 프로그램을 반환
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const supabase = createAdminClient()
    const param = request.nextUrl.searchParams.get('cohort_id')
    const cohortId = param ? Number(param) : await getCurrentCohortId()
    if (!cohortId) {
      return NextResponse.json({ program: null, teams: [], sessions: [], projects: [] })
    }

    const { data: program } = await supabase
      .from('programs')
      .select('id, cohort_id, title, max_absences, weekly_cap, require_deliverables')
      .eq('cohort_id', cohortId)
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!program) {
      return NextResponse.json({ program: null, teams: [], sessions: [], projects: [] })
    }

    const [{ data: teams }, { data: sessions }, { data: projects }, { data: specs }] = await Promise.all([
      supabase.from('program_teams').select('id, name').eq('program_id', program.id).order('id', { ascending: true }),
      supabase
        .from('program_sessions')
        .select('id, week_no, label, session_date, deadline, type, counts_for_attendance, event_id, sort_order')
        .eq('program_id', program.id)
        .order('sort_order', { ascending: true }),
      supabase.from('program_projects').select('id, name, sort_order').eq('program_id', program.id).order('sort_order', { ascending: true }),
      supabase.from('program_deliverable_specs').select('id, project_id, name, deadline, sort_order').order('sort_order', { ascending: true }),
    ])

    const specsByProject = new Map<number, any[]>()
    for (const s of specs ?? []) {
      const arr = specsByProject.get(s.project_id) ?? []
      arr.push({ id: s.id, name: s.name, deadline: s.deadline, sort_order: s.sort_order })
      specsByProject.set(s.project_id, arr)
    }
    const projectsWithSpecs = (projects ?? []).map((p) => ({ ...p, specs: specsByProject.get(p.id) ?? [] }))

    return NextResponse.json({
      program,
      teams: teams ?? [],
      sessions: sessions ?? [],
      projects: projectsWithSpecs,
    })
  } catch (error) {
    console.error('program GET error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

// 수료 룰 설정 변경
export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { program_id, max_absences, weekly_cap, require_deliverables, title } = await request.json()
    if (!program_id) {
      return NextResponse.json({ message: 'program_id가 필요합니다' }, { status: 400 })
    }
    const patch: Record<string, unknown> = {}
    if (max_absences != null) patch.max_absences = max_absences
    if (weekly_cap != null) patch.weekly_cap = weekly_cap
    if (require_deliverables != null) patch.require_deliverables = require_deliverables
    if (title != null) patch.title = title
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ message: '변경할 항목이 없습니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase.from('programs').update(patch).eq('id', program_id)
    if (error) throw error
    return NextResponse.json({ message: '설정이 저장되었습니다' })
  } catch (error) {
    console.error('program PATCH error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

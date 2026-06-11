import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 결과물 그리드 데이터: 팀 × spec(프로젝트>산출물) 제출 현황
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

    const { data: teams } = await supabase
      .from('program_teams')
      .select('id, name')
      .eq('program_id', programId)
      .order('id', { ascending: true })

    const { data: projects } = await supabase
      .from('program_projects')
      .select('id, name, sort_order')
      .eq('program_id', programId)
      .order('sort_order', { ascending: true })

    const { data: specs } = await supabase
      .from('program_deliverable_specs')
      .select('id, project_id, name, deadline, sort_order, program_projects!inner(program_id)')
      .eq('program_projects.program_id', programId)
      .order('sort_order', { ascending: true })

    const teamIds = (teams ?? []).map((t) => t.id)
    let dels: any[] = []
    if (teamIds.length > 0) {
      const { data } = await supabase
        .from('program_deliverables')
        .select('team_id, spec_id, submitted, submitted_at, link')
        .in('team_id', teamIds)
      dels = data ?? []
    }

    const cleanSpecs = (specs ?? []).map((s: any) => ({
      id: s.id, project_id: s.project_id, name: s.name, deadline: s.deadline, sort_order: s.sort_order,
    }))

    return NextResponse.json({
      teams: teams ?? [],
      projects: projects ?? [],
      specs: cleanSpecs,
      deliverables: dels,
    })
  } catch (error) {
    console.error('deliverables GET error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

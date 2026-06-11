import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 출석 매트릭스 데이터: 세션 목록 + 등록자별 present 셀
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

    const { data: sessions } = await supabase
      .from('program_sessions')
      .select('id, week_no, label, session_date, deadline, type, counts_for_attendance, sort_order')
      .eq('program_id', programId)
      .order('sort_order', { ascending: true })

    const { data: enrollments } = await supabase
      .from('program_enrollments')
      .select('id, crew_id, team_id, status, crew_members(name, is_member)')
      .eq('program_id', programId)
      .order('id', { ascending: true })

    const enrollmentIds = (enrollments ?? []).map((e) => e.id)
    let cells: any[] = []
    if (enrollmentIds.length > 0) {
      const { data: att } = await supabase
        .from('program_attendance')
        .select('enrollment_id, session_id, present, source, evidence_url, evidence_note')
        .in('enrollment_id', enrollmentIds)
      cells = att ?? []
    }

    const people = (enrollments ?? []).map((e: any) => {
      const crew = Array.isArray(e.crew_members) ? e.crew_members[0] : e.crew_members
      return {
        enrollment_id: e.id,
        crew_id: e.crew_id,
        team_id: e.team_id,
        status: e.status,
        name: crew?.name ?? '(이름없음)',
        is_member: crew?.is_member ?? false,
      }
    })

    return NextResponse.json({ sessions: sessions ?? [], people, cells })
  } catch (error) {
    console.error('attendance GET error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

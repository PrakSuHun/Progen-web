import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

const SESSION_FIELDS = 'id, week_no, label, session_date, deadline, type, counts_for_attendance, event_id, sort_order'

// 회차 목록
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  const programId = Number(request.nextUrl.searchParams.get('program_id'))
  if (!programId) {
    return NextResponse.json({ message: 'program_id가 필요합니다' }, { status: 400 })
  }
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('program_sessions')
    .select(SESSION_FIELDS)
    .eq('program_id', programId)
    .order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  return NextResponse.json({ data })
}

// 회차 추가
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const b = await request.json()
    if (!b.program_id || !b.label) {
      return NextResponse.json({ message: 'program_id와 label이 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('program_sessions')
      .insert({
        program_id: b.program_id,
        week_no: b.week_no ?? null,
        label: b.label,
        session_date: b.session_date ?? null,
        deadline: b.deadline ?? null,
        type: b.type ?? 'team-meeting',
        counts_for_attendance: b.counts_for_attendance ?? true,
        event_id: b.event_id ?? null,
        sort_order: b.sort_order ?? 0,
      })
      .select(SESSION_FIELDS)
      .single()
    if (error) throw error
    return NextResponse.json({ message: '회차가 추가되었습니다', data })
  } catch (error) {
    console.error('session POST error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

// 회차 수정 (event 연동 토글 포함)
export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const b = await request.json()
    if (!b.id) {
      return NextResponse.json({ message: 'id가 필요합니다' }, { status: 400 })
    }
    const patch: Record<string, unknown> = {}
    for (const k of ['week_no', 'label', 'session_date', 'deadline', 'type', 'counts_for_attendance', 'event_id', 'sort_order']) {
      if (b[k] !== undefined) patch[k] = b[k]
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ message: '변경할 항목이 없습니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('program_sessions')
      .update(patch)
      .eq('id', b.id)
      .select(SESSION_FIELDS)
      .single()
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: '이미 다른 회차에 연동된 행사입니다' }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json({ message: '회차가 수정되었습니다', data })
  } catch (error) {
    console.error('session PATCH error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

// 회차 삭제
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ message: 'id가 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase.from('program_sessions').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ message: '회차가 삭제되었습니다' })
  } catch (error) {
    console.error('session DELETE error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

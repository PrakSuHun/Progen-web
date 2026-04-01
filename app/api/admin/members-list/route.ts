import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  if (!request.cookies.get('admin_session')) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const paramEventId = request.nextUrl.searchParams.get('eventId')
  const mode = request.nextUrl.searchParams.get('mode') // 'event' or 'all'

  // mode=all → 전체 신청자 (행사 무관)
  if (mode === 'all' || !paramEventId) {
    const { data: members, error } = await supabase
      .from('crew_members')
      .select('id, name, phone, school, grade, age, major, path, project, gender, motivation, role, status, is_member, noshow_count, created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ message: error.message }, { status: 500 })
    return NextResponse.json({ members: members ?? [], mode: 'all' })
  }

  // mode=event → 특정 행사 참여자
  const eventId = paramEventId || await getActiveEventId()
  if (!eventId) {
    return NextResponse.json({ message: '행사를 찾을 수 없습니다' }, { status: 500 })
  }

  const { data: registrations, error } = await supabase
    .from('event_registrations')
    .select(`
      id, status, team_name, crew_id, guest_id, created_at,
      crew_members ( id, name, phone, school, grade, age, major, path, project, gender, motivation, role, status, is_member, noshow_count, created_at ),
      guests ( id, name, phone, school, grade, age, major, path, project, gender, motivation, created_at )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ message: error.message }, { status: 500 })

  const participants = (registrations ?? []).map((r: any) => {
    const person = r.crew_members || r.guests
    return {
      registration_id: r.id,
      reg_status: r.status,
      team_name: r.team_name,
      is_crew: !!r.crew_members,
      id: person?.id ?? '',
      name: person?.name ?? '알 수 없음',
      phone: person?.phone ?? '',
      school: person?.school ?? '',
      grade: person?.grade ?? '',
      age: person?.age ?? '',
      major: person?.major ?? '',
      path: person?.path ?? '',
      project: person?.project ?? '',
      gender: person?.gender ?? '',
      motivation: person?.motivation ?? '',
      is_member: r.crew_members?.is_member ?? false,
      noshow_count: r.crew_members?.noshow_count ?? 0,
      created_at: person?.created_at ?? r.created_at,
    }
  })

  return NextResponse.json({ members: participants, mode: 'event' })
}
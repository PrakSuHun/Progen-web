import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  if (!request.cookies.get('admin_session')) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const mode = request.nextUrl.searchParams.get('mode')

  // ── 누적 크루 전체 ──
  if (mode === 'all') {
    const { data, error } = await supabase
      .from('crew_members')
      .select('id, name, phone, school, grade, age, major, path, project, gender, motivation, role, status, is_member, noshow_count, created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ message: error.message }, { status: 500 })

    return NextResponse.json({
      members: (data ?? []).map((m: any) => ({
        ...m,
        is_crew: true,
        reg_status: null,
        team_name: null,
      })),
    })
  }

  // ── 행사 신청자 (event_registrations 기반) ──
  const eventId = request.nextUrl.searchParams.get('eventId') || await getActiveEventId()
  if (!eventId) {
    return NextResponse.json({ message: '행사를 찾을 수 없습니다' }, { status: 500 })
  }

  const { data: regs, error } = await supabase
    .from('event_registrations')
    .select(`
      id, status, team_name, crew_id, guest_id, registered_at,
      crew_members ( id, name, phone, school, grade, age, major, path, project, gender, motivation, is_member, noshow_count, created_at ),
      guests ( id, name, phone, school, grade, age, major, path, gender, created_at )
    `)
    .eq('event_id', eventId)
    .order('registered_at', { ascending: false })

  if (error) return NextResponse.json({ message: error.message }, { status: 500 })

  // 이전 행사 참여 이력 조회: 이 행사 이전에 등록된 적 있는 crew_id / guest_id 수집
  const crewIds = (regs ?? []).filter((r: any) => r.crew_id).map((r: any) => r.crew_id)
  const guestIds = (regs ?? []).filter((r: any) => r.guest_id).map((r: any) => r.guest_id)

  const prevCrewSet = new Set<string>()
  const prevGuestSet = new Set<string>()

  if (crewIds.length > 0) {
    const { data: prevCrewRegs } = await supabase
      .from('event_registrations')
      .select('crew_id')
      .in('crew_id', crewIds)
      .neq('event_id', eventId)
    for (const r of prevCrewRegs ?? []) prevCrewSet.add(r.crew_id)
  }
  if (guestIds.length > 0) {
    const { data: prevGuestRegs } = await supabase
      .from('event_registrations')
      .select('guest_id')
      .in('guest_id', guestIds)
      .neq('event_id', eventId)
    for (const r of prevGuestRegs ?? []) prevGuestSet.add(r.guest_id)
  }

  const members = (regs ?? []).map((r: any) => {
    const person = r.crew_members || r.guests
    const hasPrev = r.crew_id ? prevCrewSet.has(r.crew_id) : r.guest_id ? prevGuestSet.has(r.guest_id) : false
    return {
      id: person?.id ?? r.id,
      registration_id: r.id,
      guest_id: r.guest_id ?? null,
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
      is_crew: !!r.crew_members,
      is_first_time: !hasPrev,
      reg_status: r.status,
      team_name: r.team_name,
      registered_at: r.registered_at,
      created_at: person?.created_at ?? r.registered_at,
    }
  })

  return NextResponse.json({ members })
}
import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const eventId = await getActiveEventId()

    if (!eventId) {
      return NextResponse.json({ message: '현재 활성 행사를 찾을 수 없습니다' }, { status: 500 })
    }

    // Fetch all registrations for active event with person info
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select(`
        id,
        status,
        team_name,
        crew_id,
        guest_id,
        crew_members ( name, phone, school, grade, age, gender, is_member, noshow_count ),
        guests ( name, phone, school, grade, age, gender )
      `)
      .eq('event_id', eventId)

    if (error) throw error

    const toAttendee = (reg: any) => {
      const crew = reg.crew_members
      const guest = reg.guests
      const person = crew || guest
      return {
        registration_id: reg.id,
        status: reg.status,
        team_name: reg.team_name ?? null,
        name: person?.name ?? '알 수 없음',
        phone: person?.phone ?? '',
        school: person?.school ?? '',
        grade: person?.grade ?? '',
        age: person?.age ?? '',
        gender: person?.gender ?? '',
        is_member: crew?.is_member ?? false,
        noshow_count: crew?.noshow_count ?? 0,
        is_crew: !!crew,
      }
    }

    const all = (registrations ?? []).map(toAttendee)
    const preRegistered = all.filter((a) => a.status === '사전신청' || a.status === '출석완료')
    const checkedIn = all.filter((a) => a.status === '출석완료')
    const unassigned = checkedIn.filter((a) => !a.team_name)
    const notArrived = all.filter((a) => a.status === '사전신청' && !a.team_name)

    // Group assigned people by team (출석완료 + 미출석 모두 포함)
    const assigned: Record<string, typeof all> = {}
    for (const a of all.filter((a) => a.team_name)) {
      const t = a.team_name!
      if (!assigned[t]) assigned[t] = []
      assigned[t].push(a)
    }

    return NextResponse.json({
      pre_registered_count: preRegistered.length,
      checked_in_count: checkedIn.length,
      unassigned,
      assigned,
      not_arrived: notArrived,
    })
  } catch (error) {
    console.error('dashboard-data error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

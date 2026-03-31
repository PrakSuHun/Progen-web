import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

async function checkAuth(request: NextRequest) {
  const cookie = request.cookies.get('admin_session')
  return !!cookie
}

export async function GET(request: NextRequest) {
  try {
    if (!(await checkAuth(request))) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    const eventId = await getActiveEventId()

    if (!eventId) {
      return NextResponse.json(
        { message: '현재 활성 행사를 찾을 수 없습니다' },
        { status: 500 }
      )
    }

    const { data: members, error } = await supabase
      .from('crew_members')
      .select(`
        school,
        event_registrations!left(status, event_id)
      `)
      .eq('role', 'participant')
      .eq('event_registrations.event_id', eventId)

    if (error) throw error

    const schoolMap: Record<string, { 신청: number; 출석: number }> = {}
    for (const m of members || []) {
      const school = m.school
      if (!schoolMap[school]) schoolMap[school] = { 신청: 0, 출석: 0 }
      schoolMap[school].신청 += 1
      const reg = Array.isArray(m.event_registrations) ? m.event_registrations[0] : null
      if (reg?.status === '출석완료') schoolMap[school].출석 += 1
    }

    const data = Object.entries(schoolMap)
      .map(([school, counts]) => ({
        school,
        신청: counts.신청,
        출석: counts.출석,
        출석률: counts.신청 > 0 ? Math.round((counts.출석 / counts.신청) * 100) : 0,
      }))
      .sort((a, b) => b.신청 - a.신청)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('School stats error:', error)
    return NextResponse.json(
      { message: '오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  const cookie = request.cookies.get('admin_session')
  return !!cookie
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

    // 신청자 수 (crew_members participant)
    const { count: applicants } = await supabase
      .from('crew_members')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'participant')

    // 사전 신청자 수
    const { count: registered } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    // 출석자 수
    const { count: attended } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', '출석완료')

    return NextResponse.json({
      data: [
        { label: '크루 신청', value: applicants || 0, color: 'bg-sky-500' },
        { label: '행사 사전 신청', value: registered || 0, color: 'bg-indigo-500' },
        { label: '실제 출석', value: attended || 0, color: 'bg-emerald-500' },
      ],
    })
  } catch (error) {
    console.error('Funnel error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

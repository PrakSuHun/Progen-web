import { createAdminClient } from '@/lib/supabase-admin'
import { getLatestEventId } from '@/lib/getLatestEventId'
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
    const eventId = await getLatestEventId(supabase)

    if (!eventId) return NextResponse.json({ data: [] })

    const { data: registrations } = await supabase
      .from('event_registrations')
      .select('created_at, status')
      .eq('event_id', eventId)
      .order('created_at')

    if (!registrations) return NextResponse.json({ data: [] })

    const dateMap: Record<string, { 신청: number; 출석: number }> = {}
    for (const reg of registrations) {
      const date = new Date(reg.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
      if (!dateMap[date]) dateMap[date] = { 신청: 0, 출석: 0 }
      dateMap[date].신청 += 1
      if (reg.status === '출석완료') dateMap[date].출석 += 1
    }

    const data = Object.entries(dateMap).map(([date, counts]) => ({ date, ...counts }))
    return NextResponse.json({ data })
  } catch (error) {
    console.error('By-date error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

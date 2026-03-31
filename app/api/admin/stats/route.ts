import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

// Check admin cookie
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

    // Get total applicants
    const { count: totalApplicants } = await supabase
      .from('crew_members')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'participant')

    // Get attended count
    const { count: totalAttended } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', '출석완료')

    // Get feedback responses
    const { count: feedbackResponses } = await supabase
      .from('feedbacks')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    const attendanceRate =
      totalApplicants && totalApplicants > 0
        ? ((totalAttended || 0) / totalApplicants) * 100
        : 0

    return NextResponse.json({
      total_applicants: totalApplicants || 0,
      total_attended: totalAttended || 0,
      attendance_rate: attendanceRate,
      feedback_responses: feedbackResponses || 0,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { message: '오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

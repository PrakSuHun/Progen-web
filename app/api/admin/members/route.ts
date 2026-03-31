import { createAdminClient } from '@/lib/supabase-admin'
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
    const eventId = process.env.NEXT_PUBLIC_EVENT_ID

    if (!eventId) {
      return NextResponse.json(
        { message: '행사 ID가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    // Get members with attendance info
    const { data, error } = await supabase
      .from('crew_members')
      .select('id, name, phone, school, grade')
      .eq('role', 'participant')

    if (error) throw error

    // Get attendance info
    const { data: attendanceData } = await supabase
      .from('event_registrations')
      .select('crew_id, checked_in_at')
      .eq('event_id', eventId)

    // Merge data
    const membersWithAttendance = data?.map((member) => {
      const attendance = attendanceData?.find(
        (a) => a.crew_id === member.id
      )
      return {
        ...member,
        checked_in_at: attendance?.checked_in_at,
      }
    })

    return NextResponse.json({ data: membersWithAttendance || [] })
  } catch (error) {
    console.error('Members error:', error)
    return NextResponse.json(
      { message: '오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

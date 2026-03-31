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

    // Get school stats
    const { data, error } = await supabase.from('crew_members').select(
      'school, id'
    )

    if (error) throw error

    const schoolStats = data?.reduce(
      (acc, member) => {
        const existing = acc.find((s) => s.school === member.school)
        if (existing) {
          existing.count += 1
        } else {
          acc.push({ school: member.school, count: 1 })
        }
        return acc
      },
      [] as Array<{ school: string; count: number }>
    )

    return NextResponse.json({ data: schoolStats || [] })
  } catch (error) {
    console.error('School stats error:', error)
    return NextResponse.json(
      { message: '오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

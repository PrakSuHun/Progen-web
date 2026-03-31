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

    const supabase = await createAdminClient()

    // Get grade stats
    const { data, error } = await supabase
      .from('crew_members')
      .select('grade, id')
      .eq('role', 'participant')

    if (error) throw error

    const gradeStats = data?.reduce(
      (acc, member) => {
        const existing = acc.find((g) => g.grade === member.grade)
        if (existing) {
          existing.count += 1
        } else {
          acc.push({ grade: member.grade, count: 1 })
        }
        return acc
      },
      [] as Array<{ grade: string; count: number }>
    )

    return NextResponse.json({ data: gradeStats || [] })
  } catch (error) {
    console.error('Grade stats error:', error)
    return NextResponse.json(
      { message: '오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

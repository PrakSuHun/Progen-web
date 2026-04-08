import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  if (!request.cookies.get('admin_session')) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const { crew_id, is_member } = await request.json()
    if (!crew_id || typeof is_member !== 'boolean') {
      return NextResponse.json({ message: 'crew_id와 is_member가 필요합니다' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('crew_members')
      .update({ is_member })
      .eq('id', crew_id)

    if (error) throw error

    return NextResponse.json({ message: is_member ? '포도로 변경됨' : '일반으로 변경됨' })
  } catch (error) {
    console.error('toggle-podo error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

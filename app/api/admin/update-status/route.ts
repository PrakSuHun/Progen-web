import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const { registration_id, status } = await request.json()

    if (!registration_id || !status) {
      return NextResponse.json({ message: 'registration_id와 status가 필요합니다' }, { status: 400 })
    }

    const validStatuses = ['사전신청', '출석완료', '노쇼확정']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: '유효하지 않은 상태입니다' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const updateData: any = { status }
    if (status === '출석완료') {
      updateData.checked_in_at = new Date().toISOString()
    } else {
      updateData.checked_in_at = null
    }

    const { error } = await supabase
      .from('event_registrations')
      .update(updateData)
      .eq('id', registration_id)

    if (error) throw error

    return NextResponse.json({ message: '상태가 변경되었습니다' })
  } catch (error) {
    console.error('update-status error:', error)
    return NextResponse.json({ message: '상태 변경 중 오류가 발생했습니다' }, { status: 500 })
  }
}

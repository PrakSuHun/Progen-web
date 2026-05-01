import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  if (!request.cookies.get('admin_session')) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const { registration_id, deposit_paid } = await request.json()
    if (!registration_id || typeof deposit_paid !== 'boolean') {
      return NextResponse.json({ message: 'registration_id와 deposit_paid가 필요합니다' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('event_registrations')
      .update({
        deposit_paid,
        deposit_paid_at: deposit_paid ? new Date().toISOString() : null,
      })
      .eq('id', registration_id)

    if (error) throw error

    return NextResponse.json({ message: deposit_paid ? '입금 처리됨' : '입금 취소됨' })
  } catch (error) {
    console.error('toggle-deposit error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

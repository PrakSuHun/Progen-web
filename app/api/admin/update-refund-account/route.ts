import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  if (!request.cookies.get('admin_session')) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const { registration_id, refund_account } = await request.json()
    if (!registration_id) {
      return NextResponse.json({ message: 'registration_id가 필요합니다' }, { status: 400 })
    }

    const cleaned = typeof refund_account === 'string' && refund_account.trim().length > 0
      ? refund_account.trim()
      : null

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('event_registrations')
      .update({ refund_account: cleaned })
      .eq('id', registration_id)

    if (error) throw error

    return NextResponse.json({ message: '환불 계좌가 저장되었습니다', refund_account: cleaned })
  } catch (error) {
    console.error('update-refund-account error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

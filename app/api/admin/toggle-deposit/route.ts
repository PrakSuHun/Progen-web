import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

const NEXT_STATUS: Record<string, string> = {
  '미입금': '입금',
  '입금': '환불',
  '환불': '미입금',
}

export async function POST(request: NextRequest) {
  if (!request.cookies.get('admin_session')) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const { registration_id } = await request.json()
    if (!registration_id) {
      return NextResponse.json({ message: 'registration_id가 필요합니다' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: row, error: readError } = await supabase
      .from('event_registrations')
      .select('deposit_status')
      .eq('id', registration_id)
      .single()

    if (readError || !row) {
      return NextResponse.json({ message: '등록 정보를 찾을 수 없습니다' }, { status: 404 })
    }

    const current = row.deposit_status || '미입금'
    const next = NEXT_STATUS[current] ?? '미입금'

    const { error } = await supabase
      .from('event_registrations')
      .update({
        deposit_status: next,
        deposit_paid_at: new Date().toISOString(),
      })
      .eq('id', registration_id)

    if (error) throw error

    return NextResponse.json({ message: `${next}으로 변경됨`, deposit_status: next })
  } catch (error) {
    console.error('cycle-deposit error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

const VALID = ['수강중', '중도포기', '수료', '탈락']

// 등록 상태 변경(수강중/중도포기/수료/탈락). '수료'/'탈락'/'중도포기' 확정 시 decided_at 기록
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { enrollment_id, status, note } = await request.json()
    if (!enrollment_id || !status) {
      return NextResponse.json({ message: 'enrollment_id와 status가 필요합니다' }, { status: 400 })
    }
    if (!VALID.includes(status)) {
      return NextResponse.json({ message: '유효하지 않은 상태입니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const patch: Record<string, unknown> = {
      status,
      decided_at: status === '수강중' ? null : new Date().toISOString(),
    }
    if (note !== undefined) patch.note = note
    const { error } = await supabase.from('program_enrollments').update(patch).eq('id', enrollment_id)
    if (error) throw error
    return NextResponse.json({ message: '상태가 변경되었습니다' })
  } catch (error) {
    console.error('enrollment-status error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

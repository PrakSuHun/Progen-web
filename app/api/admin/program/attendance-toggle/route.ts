import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 출석 셀 수동 토글(upsert). present + 증빙 URL/메모 갱신
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { enrollment_id, session_id, present, evidence_url, evidence_note } = await request.json()
    if (!enrollment_id || !session_id || typeof present !== 'boolean') {
      return NextResponse.json({ message: 'enrollment_id, session_id, present가 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const row: Record<string, unknown> = {
      enrollment_id,
      session_id,
      present,
      source: 'manual',
      recorded_by: 'admin',
      recorded_at: new Date().toISOString(),
    }
    if (evidence_url !== undefined) row.evidence_url = evidence_url
    if (evidence_note !== undefined) row.evidence_note = evidence_note

    const { error } = await supabase
      .from('program_attendance')
      .upsert(row, { onConflict: 'enrollment_id,session_id' })
    if (error) throw error
    return NextResponse.json({ message: present ? '출석 처리되었습니다' : '출석이 해제되었습니다' })
  } catch (error) {
    console.error('attendance-toggle error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

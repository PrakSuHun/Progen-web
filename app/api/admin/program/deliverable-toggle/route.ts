import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 결과물 제출 셀 토글(upsert). submitted + submitted_at + link
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { team_id, spec_id, submitted, submitted_at, link } = await request.json()
    if (!team_id || !spec_id || typeof submitted !== 'boolean') {
      return NextResponse.json({ message: 'team_id, spec_id, submitted가 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const row: Record<string, unknown> = {
      team_id,
      spec_id,
      submitted,
      // 제출 ON 인데 시각 미지정이면 지금 시각으로, OFF면 null
      submitted_at: submitted ? (submitted_at ?? new Date().toISOString()) : null,
      recorded_at: new Date().toISOString(),
    }
    if (link !== undefined) row.link = link

    const { error } = await supabase
      .from('program_deliverables')
      .upsert(row, { onConflict: 'team_id,spec_id' })
    if (error) throw error
    return NextResponse.json({ message: submitted ? '제출 처리되었습니다' : '제출이 해제되었습니다' })
  } catch (error) {
    console.error('deliverable-toggle error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

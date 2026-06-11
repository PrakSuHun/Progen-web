import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 현재 기수 전환 (is_current 단일 보장: 전부 false → 대상만 true)
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { cohort_id } = await request.json()
    if (!cohort_id) {
      return NextResponse.json({ message: 'cohort_id가 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    // 부분 유니크 인덱스(uq_cohorts_single_current) 때문에 먼저 전부 내린 뒤 대상만 올린다
    await supabase.from('cohorts').update({ is_current: false }).eq('is_current', true)
    const { error } = await supabase.from('cohorts').update({ is_current: true }).eq('id', cohort_id)
    if (error) throw error
    return NextResponse.json({ message: '현재 기수가 변경되었습니다' })
  } catch (error) {
    console.error('set-current cohort error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

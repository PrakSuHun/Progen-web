import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 출석 상태 변경 전용. 알림톡은 절대 보내지 않는다(운영진이 사전 불참자도 부담 없이 체크/해제하기 위함).
// 노쇼 경고·출석 문자는 신청자 탭의 개별 발송 버튼(/api/admin/send-individual-alimtalk)으로만 보낸다.
// 단, 노쇼확정 전환/해제 시 크루의 noshow_count는 계속 증감(데이터 정합성 — 문자와 무관).
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

    // 변경 전 상태/대상 (노쇼 카운트 처리에 필요)
    const { data: before } = await supabase
      .from('event_registrations')
      .select('status, crew_id')
      .eq('id', registration_id)
      .maybeSingle()
    const prevStatus = before?.status ?? null

    const updateData: Record<string, unknown> = { status }
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

    // 노쇼 카운트 증감 — 크루 한정 (게스트는 noshow_count 컬럼 없음). 알림톡은 보내지 않음.
    const crewId = before?.crew_id ?? null
    if (crewId != null && prevStatus !== status) {
      const becameNoshow = status === '노쇼확정' && prevStatus !== '노쇼확정'
      const leftNoshow = prevStatus === '노쇼확정' && status !== '노쇼확정'

      if (becameNoshow || leftNoshow) {
        const { data: crew } = await supabase
          .from('crew_members')
          .select('noshow_count')
          .eq('id', crewId)
          .maybeSingle()
        const cur = crew?.noshow_count ?? 0
        const nextCount = becameNoshow ? cur + 1 : Math.max(0, cur - 1)
        await supabase.from('crew_members').update({ noshow_count: nextCount }).eq('id', crewId)
      }
    }

    return NextResponse.json({ message: '상태가 변경되었습니다' })
  } catch (error) {
    console.error('update-status error:', error)
    return NextResponse.json({ message: '상태 변경 중 오류가 발생했습니다' }, { status: 500 })
  }
}

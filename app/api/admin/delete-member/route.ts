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
    const { registration_id, is_crew, guest_id } = await request.json()
    const supabase = createAdminClient()

    if (!registration_id) {
      return NextResponse.json({ message: '삭제 대상을 지정해주세요' }, { status: 400 })
    }

    // 1) event_registrations 삭제 (크루든 게스트든 공통)
    const { error: regError } = await supabase
      .from('event_registrations')
      .delete()
      .eq('id', registration_id)
    if (regError) throw regError

    // 2) 게스트인 경우 guests 테이블에서도 삭제
    if (!is_crew && guest_id) {
      // 다른 행사에도 신청한 게 있는지 확인
      const { data: otherRegs } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('guest_id', guest_id)
        .limit(1)

      // 다른 행사 신청이 없으면 guests 테이블에서도 삭제
      if (!otherRegs || otherRegs.length === 0) {
        await supabase.from('guests').delete().eq('id', guest_id)
      }
    }

    return NextResponse.json({
      message: is_crew ? '행사 신청이 삭제되었습니다' : '게스트 정보가 삭제되었습니다',
    })
  } catch (error) {
    console.error('delete-member error:', error)
    return NextResponse.json({ message: '삭제 중 오류가 발생했습니다' }, { status: 500 })
  }
}

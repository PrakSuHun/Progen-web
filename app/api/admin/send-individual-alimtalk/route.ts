import { createAdminClient } from '@/lib/supabase-admin'
import {
  ALIMTALK, sendAlimtalk, loadEventRow, programLabel,
  varsCheckinWithTeam, varsCheckinNoTeam,
} from '@/lib/solapi'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 신청자 탭의 개별 문자 버튼 전용 수동 발송.
// type='checkin' → 6/7번(출석 완료, 팀 유무로 분기), type='noshow' → 9번(+누적 2회면 10번, 크루 한정).
// 상태 변경(update-status)과 분리되어, 운영진이 원하는 사람에게만 직접 보낼 수 있다.
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const { registration_id, type } = await request.json()
    if (!registration_id || !['checkin', 'noshow'].includes(type)) {
      return NextResponse.json({ message: 'registration_id와 type(checkin|noshow)이 필요합니다' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: reg } = await supabase
      .from('event_registrations')
      .select(`
        id, event_id, team_name, crew_id, guest_id,
        crew_members ( name, phone ),
        guests ( name, phone )
      `)
      .eq('id', registration_id)
      .maybeSingle()

    if (!reg) {
      return NextResponse.json({ message: '신청 정보를 찾을 수 없습니다' }, { status: 404 })
    }

    // Supabase 조인은 배열/객체 둘 다로 추론될 수 있어 안전하게 정규화
    type Person = { name?: string | null; phone?: string | null }
    const pick = (v: unknown): Person | null => (Array.isArray(v) ? (v[0] ?? null) : ((v as Person) ?? null))
    const crew = pick((reg as { crew_members?: unknown }).crew_members)
    const guest = pick((reg as { guests?: unknown }).guests)
    const name = crew?.name ?? guest?.name ?? '회원'
    const phone = crew?.phone ?? guest?.phone ?? null

    if (!phone) {
      return NextResponse.json({ message: '연락처가 없어 발송할 수 없습니다' }, { status: 400 })
    }

    const ev = reg.event_id ? await loadEventRow(reg.event_id) : null
    const target = {
      crewId: reg.crew_id ?? null,
      guestId: reg.guest_id ?? null,
      registrationId: reg.id,
      eventId: reg.event_id ?? null,
    }

    if (type === 'checkin') {
      const r = reg.team_name
        ? await sendAlimtalk(ALIMTALK.CHECKIN_WITH_TEAM, phone, varsCheckinWithTeam(name, ev?.title ?? null, reg.team_name), target)
        : await sendAlimtalk(ALIMTALK.CHECKIN_NO_TEAM, phone, varsCheckinNoTeam(name, ev?.title ?? null), target)
      if (!r.ok) {
        return NextResponse.json({ message: r.error || '발송 실패', sent: false }, { status: 502 })
      }
      return NextResponse.json({ message: '출석 문자 발송 완료', sent: true })
    }

    // type === 'noshow' — 크루 한정 (게스트는 노쇼 경고 템플릿 대상 아님)
    if (!reg.crew_id) {
      return NextResponse.json({ message: '노쇼 경고는 크루에게만 발송됩니다 (게스트는 보증금 미환불로 페널티)', sent: false }, { status: 400 })
    }

    const { data: crewRow } = await supabase
      .from('crew_members')
      .select('noshow_count')
      .eq('id', reg.crew_id)
      .maybeSingle()
    const noshowCount = crewRow?.noshow_count ?? 0

    const r1 = await sendAlimtalk(
      ALIMTALK.NOSHOW_WARNING, phone,
      { '#{이름}': name, '#{프로그램명}': programLabel(ev?.title) },
      target,
    )
    let revoked = false
    if (r1.ok && noshowCount >= 2) {
      const r2 = await sendAlimtalk(ALIMTALK.CREW_REVOKED, phone, { '#{이름}': name }, target)
      revoked = r2.ok
    }
    if (!r1.ok) {
      return NextResponse.json({ message: r1.error || '발송 실패', sent: false }, { status: 502 })
    }
    return NextResponse.json({
      message: revoked ? '노쇼 경고 + 자격 박탈 알림톡 발송 완료' : '노쇼 경고 알림톡 발송 완료',
      sent: true,
      revoked,
    })
  } catch (error) {
    console.error('send-individual-alimtalk error:', error)
    return NextResponse.json({ message: '발송 중 오류가 발생했습니다' }, { status: 500 })
  }
}

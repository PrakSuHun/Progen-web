import { NextRequest, NextResponse } from 'next/server'
import {
  ALIMTALK, sendAlimtalk, loadEventRow, programLabel,
  varsEventRegReceived, varsEventConfirmedGuest, varsEventConfirmedCrew,
  varsEventD1Notice, varsCheckinWithTeam, varsCheckinNoTeam,
  type EventRow,
} from '@/lib/solapi'

// 설정 모달 「알림톡 테스트」 — 선택한 템플릿을 임의 번호로 1건 발송 (수신자명 '테스트', 행사 정보는 선택된 행사 기준)
const TEST_NAME = '테스트'

const BUILDERS: Record<string, (ev: EventRow) => Record<string, string>> = {
  EVENT_REG_RECEIVED: (ev) => varsEventRegReceived(ev, TEST_NAME),
  EVENT_REG_RECEIVED_CREW: (ev) => varsEventRegReceived(ev, TEST_NAME),
  DEPOSIT_RECEIVED: (ev) => ({ '#{이름}': TEST_NAME, '#{프로그램명}': programLabel(ev.title) }),
  EVENT_CONFIRMED: (ev) => varsEventConfirmedGuest(ev, TEST_NAME),
  EVENT_CONFIRMED_CREW: (ev) => varsEventConfirmedCrew(ev, TEST_NAME),
  CREW_CONFIRMED: () => ({ '#{이름}': TEST_NAME }),
  EVENT_D1_NOTICE: (ev) => varsEventD1Notice(ev, TEST_NAME),
  REG_CANCELLED: (ev) => ({ '#{이름}': TEST_NAME, '#{프로그램명}': programLabel(ev.title) }),
  CHECKIN_WITH_TEAM: (ev) => varsCheckinWithTeam(TEST_NAME, ev.title, '1팀'),
  CHECKIN_NO_TEAM: (ev) => varsCheckinNoTeam(TEST_NAME, ev.title),
  EVENT_CHANGED: (ev) => ({
    '#{이름}': TEST_NAME,
    '#{프로그램명}': programLabel(ev.title),
    '#{기존일시}': '(테스트) 변경 전 일시',
    '#{기존장소}': '(테스트) 변경 전 장소',
    '#{변경일시}': '(테스트) 변경 후 일시',
    '#{변경장소}': '(테스트) 변경 후 장소',
  }),
  DEPOSIT_REMINDER: (ev) => ({ '#{이름}': TEST_NAME, '#{프로그램명}': programLabel(ev.title) }),
}

export async function POST(request: NextRequest) {
  if (!request.cookies.get('admin_session')) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const { eventId, template, phone } = await request.json()
    const digits = String(phone || '').replace(/\D/g, '')
    if (!eventId || !template || digits.length !== 11) {
      return NextResponse.json({ message: 'eventId·template·전화번호(11자리)를 확인해주세요' }, { status: 400 })
    }
    const tpl = ALIMTALK[template as keyof typeof ALIMTALK]
    const build = BUILDERS[template as string]
    if (!tpl || !build) {
      return NextResponse.json({ message: '알 수 없는 템플릿입니다' }, { status: 400 })
    }

    const ev = await loadEventRow(eventId)
    if (!ev) return NextResponse.json({ message: '행사를 찾을 수 없습니다' }, { status: 404 })

    const result = await sendAlimtalk(tpl, digits, build(ev), { eventId })
    if (result.ok) {
      return NextResponse.json({ message: `${tpl.name} 테스트 발송 완료` })
    }
    if (result.skipped && result.reason === 'solapi_not_configured') {
      return NextResponse.json({ message: '솔라피 환경변수(SOLAPI_*)가 설정되지 않았습니다' }, { status: 503 })
    }
    return NextResponse.json({ message: `발송 실패: ${result.error || result.reason || '알 수 없는 오류'}` }, { status: 502 })
  } catch (error) {
    console.error('test-alimtalk error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

import { createAdminClient } from '@/lib/supabase-admin'
import {
  ALIMTALK, sendAlimtalk, alreadySent, loadEventRow, eventConfirmReady,
  varsEventConfirmed, varsEventD1Notice,
} from '@/lib/solapi'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

type RegRow = {
  id: string
  crew_id: number | null
  guest_id: string | null
  status: string | null
  deposit_status: string | null
  crew_members: { name: string | null; phone: string | null } | null
  guests: { name: string | null; phone: string | null } | null
}

function personOf(r: RegRow): { name: string; phone: string; crewId: number | null; guestId: string | null } | null {
  if (r.crew_id != null) {
    const c = r.crew_members
    if (!c?.phone) return null
    return { name: c.name || '회원', phone: c.phone, crewId: r.crew_id, guestId: null }
  }
  if (r.guest_id) {
    const g = r.guests
    if (!g?.phone) return null
    return { name: g.name || '게스트', phone: g.phone, crewId: null, guestId: r.guest_id }
  }
  return null
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { eventId, template } = body as { eventId?: string; template?: string }
    if (!eventId || !template) {
      return NextResponse.json({ message: 'eventId와 template이 필요합니다' }, { status: 400 })
    }
    if (!['confirm', 'd1', 'change'].includes(template)) {
      return NextResponse.json({ message: '알 수 없는 template' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const ev = await loadEventRow(eventId)
    if (!ev) {
      return NextResponse.json({ message: '행사를 찾을 수 없습니다' }, { status: 404 })
    }

    if (template === 'confirm' && !eventConfirmReady(ev)) {
      return NextResponse.json(
        { message: '행사 정보(장소·입장시간·준비물·진행내용·채팅방 링크)를 먼저 모두 입력해주세요' },
        { status: 400 },
      )
    }

    const { data: regsRaw } = await supabase
      .from('event_registrations')
      .select('id, crew_id, guest_id, status, deposit_status, crew_members(name, phone), guests(name, phone)')
      .eq('event_id', eventId)
    const regs = (regsRaw ?? []) as unknown as RegRow[]

    // 대상 추리기
    let targets: RegRow[]
    if (template === 'confirm') {
      targets = regs.filter((r) => r.status !== '노쇼확정' && (r.crew_id != null || (r.guest_id != null && r.deposit_status === '입금')))
    } else {
      // d1 / change: 노쇼확정 제외 전원
      targets = regs.filter((r) => r.status !== '노쇼확정')
    }

    // change(8번)는 운영진 입력값 필요
    let changeVars: { oldDate: string; oldLocation: string; newDate: string; newLocation: string } | null = null
    if (template === 'change') {
      const { oldDate, oldLocation, newDate, newLocation } = body
      if (!oldDate || !oldLocation || !newDate || !newLocation) {
        return NextResponse.json({ message: '변경 전/후 일시·장소를 모두 입력해주세요' }, { status: 400 })
      }
      changeVars = { oldDate: String(oldDate), oldLocation: String(oldLocation), newDate: String(newDate), newLocation: String(newLocation) }
    }

    const tpl = template === 'confirm' ? ALIMTALK.EVENT_CONFIRMED : template === 'd1' ? ALIMTALK.EVENT_D1_NOTICE : ALIMTALK.EVENT_CHANGED
    // change(8번)는 행사가 바뀔 때마다 재발송 가능하도록 중복 체크 안 함. confirm/d1는 미발송자만.
    const dedup = template !== 'change'

    let sent = 0, failed = 0, skipped = 0, alreadyDone = 0
    let configMissing = false

    await Promise.all(
      targets.map(async (r) => {
        const p = personOf(r)
        if (!p) { skipped++; return }
        if (dedup && (await alreadySent(tpl.code, { registrationId: r.id }))) { alreadyDone++; return }

        let variables: Record<string, string>
        if (template === 'confirm') variables = varsEventConfirmed(ev, p.name)
        else if (template === 'd1') variables = varsEventD1Notice(ev, p.name)
        else variables = {
          '#{이름}': p.name,
          '#{프로그램명}': ev.title || ' ',
          '#{기존일시}': changeVars!.oldDate,
          '#{기존장소}': changeVars!.oldLocation,
          '#{변경일시}': changeVars!.newDate,
          '#{변경장소}': changeVars!.newLocation,
        }

        const result = await sendAlimtalk(tpl, p.phone, variables, {
          crewId: p.crewId, guestId: p.guestId, registrationId: r.id, eventId,
        })
        if (result.ok) sent++
        else if (result.skipped && result.reason === 'solapi_not_configured') { skipped++; configMissing = true }
        else if (result.skipped) skipped++
        else failed++
      }),
    )

    if (configMissing) {
      return NextResponse.json({
        message: '솔라피 환경변수(SOLAPI_*)가 설정되지 않아 발송하지 못했습니다',
        sent, failed, skipped, alreadyDone, total: targets.length,
      }, { status: 200 })
    }

    return NextResponse.json({
      message: `발송 완료: 성공 ${sent}명${alreadyDone ? ` / 이미 발송 ${alreadyDone}명` : ''}${failed ? ` / 실패 ${failed}명` : ''}${skipped ? ` / 건너뜀 ${skipped}명` : ''}`,
      sent, failed, skipped, alreadyDone, total: targets.length,
    })
  } catch (error) {
    console.error('send-alimtalk-batch error:', error)
    return NextResponse.json({ message: '일괄 발송 중 오류가 발생했습니다' }, { status: 500 })
  }
}

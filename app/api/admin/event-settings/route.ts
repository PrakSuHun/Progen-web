import { createAdminClient } from '@/lib/supabase-admin'
import { ALIMTALK, eventConfirmReady } from '@/lib/solapi'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

const SETTINGS_FIELDS = ['location', 'entry_time', 'materials', 'program_detail', 'kakao_chat_url'] as const

// 참석 확정(2번) 대상: 크루 신청 + 입금된 게스트 신청 (노쇼확정 제외)
function eligibleForConfirm(r: { crew_id: number | null; guest_id: string | null; status: string | null; deposit_status: string | null }) {
  if (r.status === '노쇼확정') return false
  if (r.crew_id != null) return true
  return r.guest_id != null && r.deposit_status === '입금'
}
// D-1 공지(4번) 대상: 노쇼확정 아닌 모든 신청
function eligibleForD1(r: { status: string | null }) {
  return r.status !== '노쇼확정'
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  const eventId = request.nextUrl.searchParams.get('eventId')
  if (!eventId) {
    return NextResponse.json({ message: 'eventId가 필요합니다' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: ev, error } = await supabase
    .from('events')
    .select('id, title, event_date, location, entry_time, materials, program_detail, kakao_chat_url')
    .eq('id', eventId)
    .maybeSingle()

  if (error || !ev) {
    return NextResponse.json({ message: '행사를 찾을 수 없습니다' }, { status: 404 })
  }

  const { data: regs } = await supabase
    .from('event_registrations')
    .select('id, crew_id, guest_id, status, deposit_status')
    .eq('event_id', eventId)

  const { data: logs } = await supabase
    .from('alimtalk_logs')
    .select('template_code, registration_id')
    .eq('event_id', eventId)
    .eq('status', 'sent')

  const sentSet = new Set((logs ?? []).map((l) => `${l.template_code}::${l.registration_id}`))
  const list = regs ?? []

  const confirmEligible = list.filter(eligibleForConfirm)
  const confirmSent = confirmEligible.filter((r) => sentSet.has(`${ALIMTALK.EVENT_CONFIRMED.code}::${r.id}`)).length
  const d1Eligible = list.filter(eligibleForD1)
  const d1Sent = d1Eligible.filter((r) => sentSet.has(`${ALIMTALK.EVENT_D1_NOTICE.code}::${r.id}`)).length

  return NextResponse.json({
    event: { id: ev.id, title: ev.title, event_date: ev.event_date },
    settings: {
      location: ev.location ?? '',
      entry_time: ev.entry_time ?? '',
      materials: ev.materials ?? '',
      program_detail: ev.program_detail ?? '',
      kakao_chat_url: ev.kakao_chat_url ?? '',
    },
    confirmReady: eventConfirmReady(ev),
    pending: {
      confirm: { total: confirmEligible.length, sent: confirmSent, pending: confirmEligible.length - confirmSent },
      d1: { total: d1Eligible.length, sent: d1Sent, pending: d1Eligible.length - d1Sent },
    },
  })
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { eventId } = body
    if (!eventId) {
      return NextResponse.json({ message: 'eventId가 필요합니다' }, { status: 400 })
    }
    const update: Record<string, string | null> = {}
    for (const f of SETTINGS_FIELDS) {
      const v = typeof body[f] === 'string' ? body[f].trim() : ''
      update[f] = v || null
    }
    const supabase = createAdminClient()
    const { error } = await supabase.from('events').update(update).eq('id', eventId)
    if (error) throw error
    return NextResponse.json({ message: '행사 정보가 저장되었습니다' })
  } catch (error) {
    console.error('event-settings POST error:', error)
    return NextResponse.json({ message: '저장 중 오류가 발생했습니다' }, { status: 500 })
  }
}

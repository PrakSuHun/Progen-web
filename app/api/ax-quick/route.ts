import { createAdminClient } from '@/lib/supabase-admin'
import { ALIMTALK, sendAlimtalk, loadEventRow } from '@/lib/solapi'
import { sendPushToAdmins } from '@/lib/push'
import { AX_EVENT_ID, AX_SOURCE_EVENT_ID } from '@/lib/ax-project'
import { NextRequest, NextResponse } from 'next/server'

type SourceReg = {
  crew_id: number | null
  guest_id: string | null
  student_number: string | null
  crew_members: { name: string; phone: string } | null
  guests: { name: string; phone: string } | null
}

const digits = (s: string) => (s || '').replace(/\D/g, '')
const norm = (s: string) => (s || '').replace(/\s/g, '')

// AX 프로젝트 간편 신청: 11/7 행사 신청 명단에서 이름+연락처로 본인 확인 → 같은 역할(크루/게스트)로 AX 행사 신청
export async function POST(request: NextRequest) {
  try {
    const { name, phone } = await request.json()
    if (!name || !phone) {
      return NextResponse.json({ message: '이름과 연락처를 입력해주세요' }, { status: 400 })
    }
    const supabase = createAdminClient()

    const { data: regs, error } = await supabase
      .from('event_registrations')
      .select('crew_id, guest_id, student_number, crew_members(name, phone), guests(name, phone)')
      .eq('event_id', AX_SOURCE_EVENT_ID)
    if (error) throw error

    const phoneD = digits(phone)
    const nameN = norm(name)
    const match = ((regs ?? []) as unknown as SourceReg[]).find((r) => {
      const p = r.crew_members ?? r.guests
      return p && digits(p.phone) === phoneD && norm(p.name) === nameN
    })
    if (!match) {
      return NextResponse.json({ message: '행사 신청 명단에서 찾을 수 없습니다', code: 'not_found' }, { status: 404 })
    }

    const crewId = match.crew_id
    const guestId = crewId ? null : match.guest_id
    const person = (match.crew_members ?? match.guests)!

    const { data: existing } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', AX_EVENT_ID)
      .eq(crewId ? 'crew_id' : 'guest_id', (crewId ?? guestId) as string | number)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ message: '이미 신청하셨습니다' }, { status: 409 })
    }

    const { data, error: insErr } = await supabase
      .from('event_registrations')
      .insert([{ event_id: AX_EVENT_ID, crew_id: crewId, guest_id: guestId, status: '사전신청', student_number: match.student_number }])
      .select('id')
    if (insErr) throw insErr
    const registrationId: string | null = data?.[0]?.id ?? null

    // 알림톡: AX 전용 접수 템플릿(크루·게스트 공통, 변수 이름만)
    let eventTitle: string | null = null
    try {
      const ev = await loadEventRow(AX_EVENT_ID)
      eventTitle = ev?.title ?? null
      await sendAlimtalk(ALIMTALK.AX_RECEIVED, person.phone, { '#{이름}': person.name }, { crewId, guestId, registrationId, eventId: AX_EVENT_ID })
    } catch (e) {
      console.error('ax-quick alimtalk send failed:', e)
    }

    try {
      await sendPushToAdmins({
        title: '🔔 새 행사 신청',
        body: `${person.name}님이 「${eventTitle || 'AX 프로젝트'}」에 ${crewId ? '크루' : '게스트'}로 간편 신청했어요`,
        url: '/admin/dashboard',
      })
    } catch (e) {
      console.error('ax-quick admin push failed:', e)
    }

    return NextResponse.json({ message: '신청이 완료되었습니다', is_crew: !!crewId })
  } catch (error) {
    console.error('AX quick registration error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

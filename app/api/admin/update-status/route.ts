import { createAdminClient } from '@/lib/supabase-admin'
import { ALIMTALK, sendAlimtalk, loadEventRow } from '@/lib/solapi'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

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

    // 변경 전 상태/대상 (노쇼 카운트·알림톡 처리에 필요)
    const { data: before } = await supabase
      .from('event_registrations')
      .select('status, crew_id, event_id')
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

    // 노쇼 카운트 + 알림톡 — 크루 한정 (게스트는 noshow_count 컬럼 없음 / 보증금 미환불로 페널티)
    const alimtalk: { noshowWarned?: boolean; revoked?: boolean } = {}
    const crewId = before?.crew_id ?? null
    if (crewId != null && prevStatus !== status) {
      const becameNoshow = status === '노쇼확정' && prevStatus !== '노쇼확정'
      const leftNoshow = prevStatus === '노쇼확정' && status !== '노쇼확정'

      if (becameNoshow || leftNoshow) {
        const { data: crew } = await supabase
          .from('crew_members')
          .select('name, phone, noshow_count')
          .eq('id', crewId)
          .maybeSingle()
        const cur = crew?.noshow_count ?? 0
        const nextCount = becameNoshow ? cur + 1 : Math.max(0, cur - 1)
        await supabase.from('crew_members').update({ noshow_count: nextCount }).eq('id', crewId)

        if (becameNoshow && crew?.phone) {
          try {
            const ev = before?.event_id ? await loadEventRow(before.event_id) : null
            const eventTitle = ev?.title ?? ' '
            const r1 = await sendAlimtalk(
              ALIMTALK.NOSHOW_WARNING, crew.phone,
              { '#{이름}': crew.name || '회원', '#{프로그램명}': eventTitle },
              { crewId, registrationId: registration_id, eventId: before?.event_id ?? null },
            )
            alimtalk.noshowWarned = r1.ok
            if (nextCount >= 2) {
              const r2 = await sendAlimtalk(
                ALIMTALK.CREW_REVOKED, crew.phone,
                { '#{이름}': crew.name || '회원' },
                { crewId, registrationId: registration_id, eventId: before?.event_id ?? null },
              )
              alimtalk.revoked = r2.ok
            }
          } catch (e) {
            console.error('update-status alimtalk send failed:', e)
          }
        }
      }
    }

    return NextResponse.json({ message: '상태가 변경되었습니다', alimtalk })
  } catch (error) {
    console.error('update-status error:', error)
    return NextResponse.json({ message: '상태 변경 중 오류가 발생했습니다' }, { status: 500 })
  }
}

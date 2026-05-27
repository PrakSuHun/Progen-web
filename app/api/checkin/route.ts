import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import {
  ALIMTALK, sendAlimtalk, loadEventRow, varsCheckinWithTeam, varsCheckinNoTeam,
} from '@/lib/solapi'
import { NextRequest, NextResponse } from 'next/server'

const norm = (s: string) => (s || '').replace(/\s+/g, '').trim()

// 출석 완료 시 6번(팀 있음) / 7번(팀 없음) 알림톡 발송. 실패해도 출석 처리 흐름은 막지 않는다.
// ⚠️ 활성 행사의 events.auto_checkin_alimtalk = true 일 때만 자동 발송(기본 OFF).
//    OFF면 현장 체크인해도 문자가 안 나가고, 운영진이 신청자 탭 개별 버튼으로 직접 보낸다.
async function sendCheckinAlimtalk(args: {
  name: string
  phone: string
  teamName: string | null
  eventId: string
  crewId: string | number | null
  guestId: string | null
  registrationId: string | null
}) {
  try {
    const supabase = createAdminClient()
    const { data: evFlag } = await supabase
      .from('events')
      .select('auto_checkin_alimtalk')
      .eq('id', args.eventId)
      .maybeSingle()
    if (!evFlag?.auto_checkin_alimtalk) return // 자동문자 OFF → 발송 스킵

    const ev = await loadEventRow(args.eventId)
    const title = ev?.title ?? null
    const target = { crewId: args.crewId, guestId: args.guestId, registrationId: args.registrationId, eventId: args.eventId }
    if (args.teamName) {
      await sendAlimtalk(ALIMTALK.CHECKIN_WITH_TEAM, args.phone, varsCheckinWithTeam(args.name, title, args.teamName), target)
    } else {
      await sendAlimtalk(ALIMTALK.CHECKIN_NO_TEAM, args.phone, varsCheckinNoTeam(args.name, title), target)
    }
  } catch (e) {
    console.error('checkin alimtalk send failed:', e)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, age, school, grade, major, path, gender, walkin } = body

    if (!name || !phone) {
      return NextResponse.json(
        { message: '필수 항목을 입력해주세요' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const eventId = await getActiveEventId()

    if (!eventId) {
      return NextResponse.json(
        { message: '현재 활성 행사를 찾을 수 없습니다' },
        { status: 500 }
      )
    }

    if (walkin) {
      // Walk-in: 등록 + 즉시 출석 처리.
      // 핵심: 사전 신청 row가 이미 있는 사람이 walk-in 폼으로 들어왔을 때
      // 새 INSERT가 아니라 기존 row를 UPDATE해서 출석 누락 사고를 막는다.
      let crewId: string | null = null
      let guestId: string | null = null
      let resolvedName = name

      // 크루 매칭은 phone만으로 (오타로 인한 게스트 중복 생성 방지)
      const { data: crewMember } = await supabase
        .from('crew_members')
        .select('id, name')
        .eq('phone', phone)
        .maybeSingle()

      if (crewMember) {
        crewId = crewMember.id
        resolvedName = crewMember.name
      } else {
        const { data: existingGuest } = await supabase
          .from('guests')
          .select('id')
          .eq('phone', phone)
          .maybeSingle()

        if (existingGuest) {
          const { data: guest } = await supabase
            .from('guests')
            .update({ name, age, school: school || null, grade: grade || null, major: major || null, path: path || null, gender: gender || null })
            .eq('phone', phone)
            .select('id')
            .single()
          if (guest) guestId = guest.id
        } else {
          const { data: guest } = await supabase
            .from('guests')
            .insert({ name, phone, age, school: school || null, grade: grade || null, major: major || null, path: path || null, gender: gender || null, source_event_id: eventId })
            .select('id')
            .single()
          if (guest) guestId = guest.id
        }
      }

      // 사전 신청 row가 이미 있으면 UPDATE 경로로 빠진다
      const personFilter = crewId ? { crew_id: crewId } : { guest_id: guestId as string }
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('id, status, team_name')
        .eq('event_id', eventId)
        .match(personFilter)
        .maybeSingle()

      if (existing) {
        if (existing.status === '출석완료') {
          return NextResponse.json(
            { message: '이미 출석체크되었습니다', name: resolvedName },
            { status: 409 }
          )
        }
        // 사전 신청 → 출석완료로 전환. walk-in이라도 보증금은 입금했다고 보지 않는다(미정산은 운영진 판단).
        await supabase
          .from('event_registrations')
          .update({ status: '출석완료', checked_in_at: new Date().toISOString() })
          .eq('id', existing.id)

        await sendCheckinAlimtalk({
          name: resolvedName, phone, teamName: existing.team_name ?? null,
          eventId, crewId, guestId, registrationId: existing.id,
        })

        return NextResponse.json({
          message: '출석 완료',
          name: resolvedName,
          team_name: existing.team_name ?? null,
        })
      }

      // 진짜 신규 walk-in: INSERT
      const { data: inserted, error: insertError } = await supabase
        .from('event_registrations')
        .insert([
          {
            event_id: eventId,
            crew_id: crewId,
            guest_id: guestId,
            status: '출석완료',
            checked_in_at: new Date().toISOString(),
          },
        ])
        .select('id')

      if (insertError) {
        if (insertError.code === '23505') {
          return NextResponse.json(
            { message: '이미 출석체크되었습니다', name: resolvedName },
            { status: 409 }
          )
        }
        throw insertError
      }

      await sendCheckinAlimtalk({
        name: resolvedName, phone, teamName: null,
        eventId, crewId, guestId, registrationId: inserted?.[0]?.id ?? null,
      })

      return NextResponse.json({
        message: '현장 등록 + 출석 완료',
        name: resolvedName,
        team_name: null,
      })
    } else {
      // Regular check-in: 사전 신청자 출석 처리. phone+name AND 매칭으로 본인 확인 강도 ↑.
      const nName = norm(name)
      let crewId: string | null = null
      let guestId: string | null = null
      let resolvedName = name

      const { data: crewMember } = await supabase
        .from('crew_members')
        .select('id, name')
        .eq('phone', phone)
        .maybeSingle()

      if (crewMember && norm(crewMember.name) === nName) {
        crewId = crewMember.id
        resolvedName = crewMember.name
      } else {
        const { data: guest } = await supabase
          .from('guests')
          .select('id, name')
          .eq('phone', phone)
          .maybeSingle()

        if (guest && norm(guest.name) === nName) {
          guestId = guest.id
          resolvedName = guest.name
        }
      }

      if (!crewId && !guestId) {
        return NextResponse.json(
          { message: '사전 신청 정보를 찾을 수 없습니다' },
          { status: 404 }
        )
      }

      const personFilter = crewId ? { crew_id: crewId } : { guest_id: guestId as string }
      const { data: registration } = await supabase
        .from('event_registrations')
        .select('id, status, team_name')
        .eq('event_id', eventId)
        .match(personFilter)
        .maybeSingle()

      if (!registration) {
        return NextResponse.json(
          { message: '사전 신청 정보를 찾을 수 없습니다' },
          { status: 404 }
        )
      }

      if (registration.status === '출석완료') {
        return NextResponse.json(
          { message: '이미 출석체크되었습니다', name: resolvedName },
          { status: 409 }
        )
      }

      await supabase
        .from('event_registrations')
        .update({ status: '출석완료', checked_in_at: new Date().toISOString() })
        .eq('id', registration.id)

      await sendCheckinAlimtalk({
        name: resolvedName, phone, teamName: registration.team_name ?? null,
        eventId, crewId, guestId, registrationId: registration.id,
      })

      return NextResponse.json({
        message: '출석 완료',
        name: resolvedName,
        team_name: registration.team_name ?? null,
      })
    }
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { message: '오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

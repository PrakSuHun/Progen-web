import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

interface Attendee {
  registration_id: string
  name: string
  school: string
  grade: string
  age: string
  gender: string
  is_member: boolean
  noshow_count: number
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ message: '인증��� 필요합니다' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const body = await request.json().catch(() => ({}))
    const eventId = body.eventId || await getActiveEventId()
    const teamSize = typeof body.teamSize === 'number' ? Math.max(2, Math.min(8, body.teamSize)) : 4

    if (!eventId) {
      return NextResponse.json({ message: '��재 활성 행사를 찾을 수 없습니다' }, { status: 500 })
    }

    // 전체 참가자 조회 (배정된 사람 + 미배정 모두)
    const { data: allRegs, error } = await supabase
      .from('event_registrations')
      .select(`
        id, team_name, status,
        crew_members ( name, phone, school, grade, age, gender, is_member, noshow_count ),
        guests ( name, phone, school, grade, age, gender )
      `)
      .eq('event_id', eventId)
      .in('status', ['출석완료', '사전신청'])

    if (error) throw error

    // 포도 phone 매칭용
    const { data: podoCrews } = await supabase
      .from('crew_members')
      .select('phone')
      .eq('is_member', true)
    const podoPhones = new Set((podoCrews ?? []).map((c: any) => c.phone))

    const toAttendee = (reg: any): Attendee & { team_name: string | null } => {
      const crew = reg.crew_members
      const guest = reg.guests
      const person = crew || guest
      const phone = person?.phone ?? ''
      return {
        registration_id: reg.id,
        name: person?.name ?? '',
        school: person?.school ?? '',
        grade: person?.grade ?? '',
        age: person?.age ?? '0',
        gender: person?.gender ?? '',
        is_member: crew?.is_member ?? podoPhones.has(phone) ?? false,
        noshow_count: crew?.noshow_count ?? 0,
        team_name: reg.team_name ?? null,
      }
    }

    const all = (allRegs ?? []).map(toAttendee)

    // 이미 배정된 팀 구성
    const existingTeams: Record<string, typeof all> = {}
    for (const a of all.filter((a) => a.team_name)) {
      if (!existingTeams[a.team_name!]) existingTeams[a.team_name!] = []
      existingTeams[a.team_name!].push(a)
    }

    // 미배정 인원
    const unassigned = all.filter((a) => !a.team_name)
    if (unassigned.length === 0) {
      return NextResponse.json({ message: '배정할 인원이 없습���다', assignments: [] })
    }

    const used = new Set<string>()
    const assignments: { registration_id: string; team_name: string }[] = []

    // 1단계: 기존 팀 빈 자리 채우기 (4명 미만인 팀)
    const teamNames = Object.keys(existingTeams).sort((a, b) => {
      const na = parseInt(a); const nb = parseInt(b)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return a.localeCompare(b)
    })

    for (const teamName of teamNames) {
      const team = existingTeams[teamName]
      const slots = teamSize - team.length
      if (slots <= 0) continue

      // 팀에 포도가 있으면 포도 기준으로 매칭
      const teamPodo = team.find((m) => m.is_member)

      const candidates = unassigned.filter((s) => !used.has(s.registration_id) && !s.is_member)

      let ordered: typeof candidates
      if (teamPodo) {
        // 포도 기준: 1순위 같은 학교, 2순위 나이 같거나 어린 사람 (제일 어린 사람 우��)
        const pAge = Number(teamPodo.age)
        const matched = candidates.filter((s) => s.gender === teamPodo.gender && Number(s.age) <= pAge)
        const sameSchool = matched.filter((s) => s.school === teamPodo.school).sort((a, b) => Number(a.age) - Number(b.age))
        const otherSchool = matched.filter((s) => s.school !== teamPodo.school).sort((a, b) => Number(a.age) - Number(b.age))
        ordered = [...sameSchool, ...otherSchool]
      } else {
        // 포도 없는 팀: 나이 어린 순
        ordered = [...candidates].sort((a, b) => Number(a.age) - Number(b.age))
      }

      let filled = 0
      for (const c of ordered) {
        if (filled >= slots) break
        if (used.has(c.registration_id)) continue
        used.add(c.registration_id)
        assignments.push({ registration_id: c.registration_id, team_name: teamName })
        filled++
      }
    }

    // 2단계: 남은 인원으로 새 팀 구성
    const remaining = unassigned.filter((s) => !used.has(s.registration_id))

    if (remaining.length > 0) {
      // 기존 최대 팀 번호 파악
      const allNums = [...teamNames, ...assignments.map((a) => a.team_name)]
        .map((n) => parseInt(n)).filter((n) => !isNaN(n))
      let nextNum = allNums.length > 0 ? Math.max(...allNums) + 1 : 1

      // 남은 포도 먼저 팀 구성
      const remainPodo = remaining.filter((a) => a.is_member && !used.has(a.registration_id))
      const remainRegular = remaining.filter((a) => !a.is_member && !used.has(a.registration_id))

      for (const p of remainPodo) {
        if (used.has(p.registration_id)) continue
        const teamName = `${nextNum}팀`
        used.add(p.registration_id)
        assignments.push({ registration_id: p.registration_id, team_name: teamName })

        const pAge = Number(p.age)
        const matched = remainRegular.filter((s) => !used.has(s.registration_id) && s.gender === p.gender && Number(s.age) <= pAge)
        const sameSchool = matched.filter((s) => s.school === p.school).sort((a, b) => Number(a.age) - Number(b.age))
        const otherSchool = matched.filter((s) => s.school !== p.school).sort((a, b) => Number(a.age) - Number(b.age))
        const candidates = [...sameSchool, ...otherSchool]

        let filled = 0
        for (const c of candidates) {
          if (filled >= teamSize - 1) break
          used.add(c.registration_id)
          assignments.push({ registration_id: c.registration_id, team_name: teamName })
          filled++
        }
        nextNum++
      }

      // 남은 일반 인원 4명씩 묶기
      const leftover = remainRegular.filter((s) => !used.has(s.registration_id))
      leftover.sort((a, b) => {
        if (a.gender !== b.gender) return a.gender.localeCompare(b.gender)
        return Number(a.age) - Number(b.age)
      })

      for (let i = 0; i < leftover.length; i += teamSize) {
        const teamName = `${nextNum}팀`
        const chunk = leftover.slice(i, i + teamSize)
        for (const c of chunk) {
          assignments.push({ registration_id: c.registration_id, team_name: teamName })
        }
        nextNum++
      }
    }

    // DB 업데이트
    for (const { registration_id, team_name } of assignments) {
      await supabase
        .from('event_registrations')
        .update({ team_name })
        .eq('id', registration_id)
    }

    return NextResponse.json({ message: '자동 ��칭 완료', assignments })
  } catch (error) {
    console.error('auto-match error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

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

function autoMatch(unassigned: Attendee[]): { registration_id: string; team_name: string }[] {
  const podo = unassigned.filter((a) => a.is_member)
  const saengmyung = unassigned.filter((a) => !a.is_member)

  const used = new Set<string>()
  const teams: Attendee[][] = []

  // 포도 기준으로 팀 구성
  for (const p of podo) {
    const team: Attendee[] = [p]
    const pAge = Number(p.age)

    // 1순위: 같은 학교 + 동성 + 나이 어린 생명
    const pri = saengmyung
      .filter((s) => !used.has(s.registration_id) && s.school === p.school && s.gender === p.gender && Number(s.age) <= pAge)
      .sort((a, b) => Number(b.age) - Number(a.age)) // 나이 가까운 순

    for (const c of pri) {
      if (team.length >= 4) break
      team.push(c)
      used.add(c.registration_id)
    }

    // 2순위: 동성 + 나이 어린 생명 (학교 무관)
    if (team.length < 4) {
      const sec = saengmyung
        .filter((s) => !used.has(s.registration_id) && s.gender === p.gender && Number(s.age) <= pAge)
        .sort((a, b) => Number(b.age) - Number(a.age))
      for (const c of sec) {
        if (team.length >= 4) break
        team.push(c)
        used.add(c.registration_id)
      }
    }

    teams.push(team)
  }

  // 남은 인원 (미매칭 생명 등) — 성별→나이 순 정렬 후 4인씩 묶기
  const leftover = saengmyung.filter((s) => !used.has(s.registration_id))
  leftover.sort((a, b) => {
    if (a.gender !== b.gender) return a.gender.localeCompare(b.gender)
    return Number(a.age) - Number(b.age)
  })

  // 기존 팀 빈 자리 먼저 채우기
  for (const team of teams) {
    while (team.length < 4 && leftover.length > 0) {
      const idx = leftover.findIndex((s) => !used.has(s.registration_id))
      if (idx === -1) break
      const [person] = leftover.splice(idx, 1)
      team.push(person)
      used.add(person.registration_id)
    }
  }

  // 완전히 새 팀으로 4인씩
  for (let i = 0; i < leftover.length; i += 4) {
    teams.push(leftover.slice(i, i + 4))
  }

  // 팀번호 할당
  const result: { registration_id: string; team_name: string }[] = []
  teams.forEach((team, i) => {
    const teamName = `${i + 1}팀`
    for (const member of team) {
      result.push({ registration_id: member.registration_id, team_name: teamName })
    }
  })

  return result
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const eventId = await getActiveEventId()

    if (!eventId) {
      return NextResponse.json({ message: '현재 활성 행사를 찾을 수 없습니다' }, { status: 500 })
    }

    // 미배정 출석자만 가져오기
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select(`
        id, team_name,
        crew_members ( name, school, grade, age, gender, is_member, noshow_count ),
        guests ( name, school, grade, age, gender )
      `)
      .eq('event_id', eventId)
      .eq('status', '출석완료')
      .is('team_name', null)

    if (error) throw error

    const unassigned: Attendee[] = (registrations ?? []).map((reg: any) => {
      const crew = reg.crew_members
      const guest = reg.guests
      const person = crew || guest
      return {
        registration_id: reg.id,
        name: person?.name ?? '',
        school: person?.school ?? '',
        grade: person?.grade ?? '',
        age: person?.age ?? '0',
        gender: person?.gender ?? '',
        is_member: crew?.is_member ?? false,
        noshow_count: crew?.noshow_count ?? 0,
      }
    })

    if (unassigned.length === 0) {
      return NextResponse.json({ message: '배정할 인원이 없습니다', assignments: [] })
    }

    const assignments = autoMatch(unassigned)

    // DB에 일괄 저장
    for (const { registration_id, team_name } of assignments) {
      await supabase
        .from('event_registrations')
        .update({ team_name })
        .eq('id', registration_id)
    }

    return NextResponse.json({ message: '자동 매칭 완료', assignments })
  } catch (error) {
    console.error('auto-match error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

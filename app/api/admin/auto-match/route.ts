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

function autoMatch(
  unassigned: Attendee[],
  startTeamNum: number
): { registration_id: string; team_name: string }[] {
  const podo = unassigned.filter((a) => a.is_member)
  const regular = unassigned.filter((a) => !a.is_member)

  const used = new Set<string>()
  const teams: Attendee[][] = []

  // 포도 기준 팀 구성
  for (const p of podo) {
    const team: Attendee[] = [p]
    const pAge = Number(p.age)

    // 후보: 동성 + 포도보다 나이 어린 사람
    const candidates = regular.filter(
      (s) => !used.has(s.registration_id) && s.gender === p.gender && Number(s.age) <= pAge
    )

    // 2순위: 같은 학교 + 나이 어린 순 (오름차순 = 제일 어린 사람부터)
    const sameSchool = candidates
      .filter((s) => s.school === p.school)
      .sort((a, b) => Number(a.age) - Number(b.age))

    // 1순위(나이 어린 순) 중 다른 학교
    const otherSchool = candidates
      .filter((s) => s.school !== p.school)
      .sort((a, b) => Number(a.age) - Number(b.age))

    // 같은 학교 우선 → 나머지 어린 순
    const ordered = [...sameSchool, ...otherSchool]

    for (const c of ordered) {
      if (team.length >= 4) break
      if (used.has(c.registration_id)) continue
      team.push(c)
      used.add(c.registration_id)
    }

    teams.push(team)
  }

  // 남은 인원 — 성별→나이 오름차순 정렬 후 4인씩 묶기
  const leftover = regular.filter((s) => !used.has(s.registration_id))
  leftover.sort((a, b) => {
    if (a.gender !== b.gender) return a.gender.localeCompare(b.gender)
    return Number(a.age) - Number(b.age)
  })

  for (let i = 0; i < leftover.length; i += 4) {
    teams.push(leftover.slice(i, i + 4))
  }

  // 팀번호 할당: 기존 팀 번호 이후부터
  const result: { registration_id: string; team_name: string }[] = []
  teams.forEach((team, i) => {
    const teamName = `${startTeamNum + i}팀`
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

    // 기존 팀 최대 번호 파악 (DB + 클라이언트 전달값 중 큰 값 사용)
    const body = await request.json().catch(() => ({}))
    const clientMaxTeam = typeof body.clientMaxTeam === 'number' ? body.clientMaxTeam : 0

    const { data: existing } = await supabase
      .from('event_registrations')
      .select('team_name')
      .eq('event_id', eventId)
      .not('team_name', 'is', null)

    const dbMaxTeam = (existing ?? []).reduce((max, r) => {
      const n = parseInt(r.team_name ?? '0')
      return isNaN(n) ? max : Math.max(max, n)
    }, 0)

    const startTeamNum = Math.max(dbMaxTeam, clientMaxTeam) + 1

    // 미배정 출석자만
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select(`
        id,
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

    const assignments = autoMatch(unassigned, startTeamNum)

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

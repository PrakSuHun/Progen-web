import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
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

    // Get all distinct non-null team names for this event
    const { data: rows } = await supabase
      .from('event_registrations')
      .select('team_name')
      .eq('event_id', eventId)
      .not('team_name', 'is', null)

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: '팀 없음', changed: 0 })
    }

    const uniqueTeams = [...new Set(rows.map((r) => r.team_name as string))]
    uniqueTeams.sort((a, b) => {
      const na = parseInt(a)
      const nb = parseInt(b)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return a.localeCompare(b)
    })

    // Rename teams that need renumbering
    let changed = 0
    for (let i = 0; i < uniqueTeams.length; i++) {
      const oldName = uniqueTeams[i]
      const newName = `${i + 1}팀`
      if (oldName !== newName) {
        await supabase
          .from('event_registrations')
          .update({ team_name: newName })
          .eq('event_id', eventId)
          .eq('team_name', oldName)
        changed++
      }
    }

    return NextResponse.json({ message: '팀 번호 정리 완료', changed })
  } catch (error) {
    console.error('compact-teams error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  const cookie = request.cookies.get('admin_session')
  return !!cookie
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const eventId = process.env.NEXT_PUBLIC_EVENT_ID

    if (!eventId) {
      return NextResponse.json({ message: '행사 ID가 설정되지 않았습니다' }, { status: 500 })
    }

    // crew_members + event_registrations JOIN
    const { data: members } = await supabase
      .from('crew_members')
      .select(`
        name, phone, school, grade, age, major, path, project, gender, status, created_at,
        event_registrations!left(status, checked_in_at)
      `)
      .eq('role', 'participant')
      .eq('event_registrations.event_id', eventId)

    if (!members) {
      return NextResponse.json({ message: '데이터가 없습니다' }, { status: 404 })
    }

    // CSV 헤더
    const headers = ['이름', '연락처', '학교', '학년', '나이', '전공', '경로', '프로젝트', '성별', '지원상태', '출석상태', '출석시간', '신청일']
    const rows = members.map((m) => {
      const reg = Array.isArray(m.event_registrations) ? m.event_registrations[0] : null
      return [
        m.name,
        m.phone,
        m.school,
        m.grade,
        m.age || '',
        m.major,
        m.path,
        m.project,
        m.gender,
        m.status,
        reg?.status || '미신청',
        reg?.checked_in_at ? new Date(reg.checked_in_at).toLocaleString('ko-KR') : '',
        new Date(m.created_at).toLocaleString('ko-KR'),
      ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
    })

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const bom = '\uFEFF' // UTF-8 BOM for Excel

    return new NextResponse(bom + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="progen_members_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

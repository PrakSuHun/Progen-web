import { createAdminClient } from '@/lib/supabase-admin'
import { getActiveEventId } from '@/lib/get-active-event'
import { getCurrentCohortId } from '@/lib/get-active-cohort'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 행사 목록. 기수 필터(하위호환):
//  · ?cohort_id 없음 → 현재 기수로 기본 필터
//  · ?cohort_id=<id> → 그 기수만
//  · ?cohort_id=all  → 무필터(기존 전체 동작)
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  const supabase = createAdminClient()
  const param = request.nextUrl.searchParams.get('cohort_id')

  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('id, number, name, is_current')
    .order('number', { ascending: false })
  const currentCohortId = cohorts?.find((c) => c.is_current)?.id ?? cohorts?.[0]?.id ?? null

  let query = supabase
    .from('events')
    .select('id, title, event_date, is_mandatory, created_at, auto_checkin_alimtalk, cohort_id')
    .order('event_date', { ascending: true })

  let effectiveCohortId: number | null = null
  if (param === 'all') {
    // 무필터
  } else if (param) {
    effectiveCohortId = Number(param)
    query = query.eq('cohort_id', effectiveCohortId)
  } else {
    effectiveCohortId = currentCohortId
    if (effectiveCohortId != null) query = query.eq('cohort_id', effectiveCohortId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  const activeEventId = await getActiveEventId()
  return NextResponse.json({ data, activeEventId, cohorts: cohorts ?? [], currentCohortId, effectiveCohortId })
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { title, event_date, is_mandatory, cohort_id } = await request.json()
    if (!title || !event_date) {
      return NextResponse.json({ message: '제목과 날짜를 입력해주세요' }, { status: 400 })
    }
    const supabase = createAdminClient()
    // 기수 미지정 시 현재 기수로 자동 부착
    const effectiveCohortId = cohort_id ?? (await getCurrentCohortId())
    const { data, error } = await supabase
      .from('events')
      .insert([{ title, event_date, is_mandatory: is_mandatory ?? false, cohort_id: effectiveCohortId }])
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ message: '이벤트가 생성되었습니다', data })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

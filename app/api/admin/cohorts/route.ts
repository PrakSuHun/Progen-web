import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 기수 목록 + 현재 기수
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cohorts')
    .select('id, number, name, is_current, started_on, ended_on')
    .order('number', { ascending: false })
  if (error) return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  const currentCohortId = data?.find((c) => c.is_current)?.id ?? data?.[0]?.id ?? null
  return NextResponse.json({ data, currentCohortId })
}

// 기수 생성 (생성 시 해당 기수의 하반기 프로그램도 자동 1개 생성)
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { number, name } = await request.json()
    if (!number || !name) {
      return NextResponse.json({ message: '기수 번호와 이름을 입력해주세요' }, { status: 400 })
    }
    const supabase = createAdminClient()

    const { data: cohort, error } = await supabase
      .from('cohorts')
      .insert({ number, name })
      .select('id, number, name, is_current')
      .single()
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: '이미 존재하는 기수 번호입니다' }, { status: 409 })
      }
      throw error
    }

    // 기본 프로그램 1개 자동 생성
    await supabase
      .from('programs')
      .insert({ cohort_id: cohort.id, title: `${name} 프로그램` })

    return NextResponse.json({ message: '기수가 생성되었습니다', data: cohort })
  } catch (error) {
    console.error('Create cohort error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

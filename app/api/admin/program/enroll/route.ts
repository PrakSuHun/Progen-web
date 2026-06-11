import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 프로그램에 크루 등록 (중복 409)
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { program_id, crew_id, team_id } = await request.json()
    if (!program_id || !crew_id) {
      return NextResponse.json({ message: 'program_id와 crew_id가 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()

    const { data: crew } = await supabase.from('crew_members').select('id').eq('id', crew_id).maybeSingle()
    if (!crew) {
      return NextResponse.json({ message: '크루를 찾을 수 없습니다' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('program_enrollments')
      .insert({ program_id, crew_id, team_id: team_id ?? null })
      .select('id')
      .single()
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: '이미 등록된 크루입니다' }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json({ message: '등록되었습니다', data })
  } catch (error) {
    console.error('program enroll error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

// 등록 해제(삭제)
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { enrollment_id } = await request.json()
    if (!enrollment_id) {
      return NextResponse.json({ message: 'enrollment_id가 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase.from('program_enrollments').delete().eq('id', enrollment_id)
    if (error) throw error
    return NextResponse.json({ message: '등록이 해제되었습니다' })
  } catch (error) {
    console.error('program enroll DELETE error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

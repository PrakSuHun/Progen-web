import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 팀 목록
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  const programId = Number(request.nextUrl.searchParams.get('program_id'))
  if (!programId) {
    return NextResponse.json({ message: 'program_id가 필요합니다' }, { status: 400 })
  }
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('program_teams')
    .select('id, name')
    .eq('program_id', programId)
    .order('id', { ascending: true })
  if (error) return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  return NextResponse.json({ data })
}

// 팀 생성
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { program_id, name } = await request.json()
    if (!program_id || !name) {
      return NextResponse.json({ message: 'program_id와 name이 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('program_teams')
      .insert({ program_id, name })
      .select('id, name')
      .single()
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: '이미 존재하는 팀명입니다' }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json({ message: '팀이 생성되었습니다', data })
  } catch (error) {
    console.error('teams POST error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

// 팀명 수정
export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { team_id, name } = await request.json()
    if (!team_id || !name) {
      return NextResponse.json({ message: 'team_id와 name이 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase.from('program_teams').update({ name }).eq('id', team_id)
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: '이미 존재하는 팀명입니다' }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json({ message: '팀명이 변경되었습니다' })
  } catch (error) {
    console.error('teams PATCH error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

// 팀 삭제 (소속 enrollment.team_id 는 ON DELETE SET NULL 로 자동 해제)
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { team_id } = await request.json()
    if (!team_id) {
      return NextResponse.json({ message: 'team_id가 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase.from('program_teams').delete().eq('id', team_id)
    if (error) throw error
    return NextResponse.json({ message: '팀이 삭제되었습니다' })
  } catch (error) {
    console.error('teams DELETE error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다' }, { status: 500 })
  }
}

import { createAdminClient } from '@/lib/supabase-admin'
import { getFeedbackEventId } from '@/lib/get-active-event'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, q1, q2, q3 } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { message: '이름을 입력해주세요' },
        { status: 400 }
      )
    }
    if (!q1?.trim() || !q2?.trim() || !q3?.trim()) {
      return NextResponse.json(
        { message: '세 가지 질문에 모두 답변해주세요' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const eventId = await getFeedbackEventId()

    const { error } = await supabase
      .from('grape_feedbacks')
      .insert([
        {
          event_id: eventId,
          name: name.trim(),
          q1: q1.trim(),
          q2: q2.trim(),
          q3: q3.trim(),
        },
      ])

    if (error) {
      throw error
    }

    return NextResponse.json({ message: '피드백이 저장되었습니다' })
  } catch (error) {
    console.error('Grape feedback error:', error)
    return NextResponse.json(
      { message: '오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

import { createAdminClient } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

function checkAuth(request: NextRequest) {
  return !!request.cookies.get('admin_session')
}

// 어드민 웹푸시 구독 등록/해제 (2026-09-06)
// 계정 없는 어드민 구조: admin_session 쿠키만 통과하면 그 기기의 구독을 저장.
// endpoint UNIQUE upsert라 같은 기기에서 다시 눌러도 중복 안 생김.

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { subscription, label } = await request.json()
    const endpoint = subscription?.endpoint
    const p256dh = subscription?.keys?.p256dh
    const auth = subscription?.keys?.auth
    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ message: '구독 정보가 올바르지 않습니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { endpoint, p256dh, auth, label: typeof label === 'string' && label.trim() ? label.trim() : null },
        { onConflict: 'endpoint' }
      )
    if (error) throw error
    return NextResponse.json({ message: '알림이 켜졌습니다' })
  } catch (error) {
    console.error('push-subscribe error:', error)
    return NextResponse.json({ message: '구독 등록 중 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ message: '인증이 필요합니다' }, { status: 401 })
  }
  try {
    const { endpoint } = await request.json()
    if (!endpoint) {
      return NextResponse.json({ message: 'endpoint가 필요합니다' }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)
    if (error) throw error
    return NextResponse.json({ message: '알림이 꺼졌습니다' })
  } catch (error) {
    console.error('push-unsubscribe error:', error)
    return NextResponse.json({ message: '구독 해제 중 오류가 발생했습니다' }, { status: 500 })
  }
}

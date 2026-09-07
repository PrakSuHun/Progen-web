import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import {
  ALIMTALK, sendAlimtalk, loadEventRow, eventConfirmReady, varsEventConfirmed,
} from '@/lib/solapi'
import { sendPushToAdmins } from '@/lib/push'

// 보증금 입금 SMS 웹훅 — 공기계(SmsForwarder)가 하나은행 입출금 문자를 받는 즉시 POST.
// "입금 + 정확히 5,000원 + 미입금 게스트 이름 포함"일 때만 자동 입금 처리(+확정 알림톡).
// 그 외(매칭 실패·동명이인)는 자동 처리하지 않고 관리자 웹푸시로 수동 확인 요청 — 조용한 누락 방지.
// 미들웨어 보호 밖 공개 경로라 SMS_HOOK_SECRET 자체 인증(미설정 시 503 비활성).

const DEPOSIT_AMOUNT = 5000
const EVENT_WINDOW_DAYS = 14 // 행사일이 이보다 오래 지난 미입금 건은 매칭 제외(동명이인 오매칭 방지)

const norm = (s: string) => (s || '').replace(/\s+/g, '')

export async function POST(request: NextRequest) {
  const secret = process.env.SMS_HOOK_SECRET
  if (!secret) return NextResponse.json({ message: 'disabled' }, { status: 503 })

  let body: any = {}
  try { body = await request.json() } catch { /* 빈 바디 허용 */ }

  const given = request.headers.get('x-sms-secret') || body?.secret
  if (given !== secret) return NextResponse.json({ message: 'unauthorized' }, { status: 401 })

  const content: string = String(body?.content ?? body?.msg ?? body?.text ?? '')
  if (!content) return NextResponse.json({ message: 'content가 비어 있습니다' }, { status: 400 })
  const isTest = body?.test === true
  const flat = norm(content)

  // 1) 입금 문자만 처리 (출금·기타 문자는 조용히 무시 — 공기계가 전체 문자를 전달해도 안전)
  if (!flat.includes('입금') || flat.includes('출금')) {
    return NextResponse.json({ ignored: 'not-deposit' })
  }

  // 2) 금액: '입금 5,000원' 패턴 우선, 없으면 문자 내 5,000원 존재 여부로 판정
  const m = flat.match(/입금:?([\d,]+)원/)
  const amount = m ? parseInt(m[1].replace(/,/g, ''), 10)
    : (flat.includes('5,000원') || flat.includes('5000원')) ? DEPOSIT_AMOUNT : NaN
  if (amount !== DEPOSIT_AMOUNT) {
    return NextResponse.json({ ignored: 'amount-mismatch' })
  }

  try {
    const supabase = createAdminClient()

    // 3) 미입금 게스트 (노쇼확정 제외, 최근 행사만)
    const { data: pending, error } = await supabase
      .from('event_registrations')
      .select('id, guest_id, event_id, status, guests(name, phone), events(title, event_date)')
      .eq('deposit_status', '미입금')
      .not('guest_id', 'is', null)
      .neq('status', '노쇼확정')
    if (error) throw error

    const cutoff = Date.now() - EVENT_WINDOW_DAYS * 86400 * 1000
    const regs = (pending || [])
      .map((r: any) => ({
        id: r.id as string,
        guest_id: r.guest_id as string,
        event_id: r.event_id as string,
        name: norm(r.guests?.name || ''),
        phone: (r.guests?.phone || '') as string,
        eventTitle: (r.events?.title || '') as string,
        eventDate: r.events?.event_date ? new Date(r.events.event_date).getTime() : 0,
      }))
      .filter((r) => r.name && r.eventDate >= cutoff)

    const snippet = content.trim().slice(0, 80)
    const candidates = regs.filter((r) => flat.includes(r.name))

    // 4-a) 매칭 실패 — 자동 처리 없이 관리자 푸시로 수동 확인 요청
    if (candidates.length === 0) {
      if (!isTest) {
        await safePush('⚠️ 보증금 입금 — 수동 확인 필요', `5,000원 입금 문자가 왔는데 매칭되는 미입금 게스트가 없어요.\n${snippet}`)
      }
      return NextResponse.json({ matched: false, reason: 'no-match', pendingCount: regs.length })
    }

    // 4-b) 동명이인 등 복수 매칭 — 자동 처리 금지
    if (candidates.length > 1) {
      if (!isTest) {
        await safePush('⚠️ 보증금 입금 — 동명이인 수동 확인', `입금 문자가 미입금 게스트 ${candidates.length}명과 일치합니다(${candidates.map((c) => c.name).join(', ')}). 보증금 탭에서 직접 처리하세요.`)
      }
      return NextResponse.json({ matched: false, reason: 'ambiguous', names: candidates.map((c) => c.name) })
    }

    const reg = candidates[0]
    if (isTest) {
      return NextResponse.json({ matched: true, test: true, name: reg.name, eventTitle: reg.eventTitle })
    }

    // 5) 입금 처리 (조건부 update — 중복 문자 전달돼도 1회만 적용)
    const { data: updated, error: upErr } = await supabase
      .from('event_registrations')
      .update({ deposit_status: '입금', deposit_paid_at: new Date().toISOString() })
      .eq('id', reg.id)
      .eq('deposit_status', '미입금')
      .select('id')
    if (upErr) throw upErr
    if (!updated || updated.length === 0) {
      return NextResponse.json({ matched: true, duplicate: true, name: reg.name })
    }

    // 6) 참석 확정(2번) 알림톡 — toggle-deposit 수동 입금 처리와 동일 조건
    let alimtalkSent = false
    try {
      const ev = await loadEventRow(reg.event_id)
      if (reg.phone && ev && eventConfirmReady(ev)) {
        const res = await sendAlimtalk(
          ALIMTALK.EVENT_CONFIRMED, reg.phone, varsEventConfirmed(ev, reg.name || '게스트'),
          { guestId: reg.guest_id, registrationId: reg.id, eventId: reg.event_id },
        )
        alimtalkSent = res.ok
      }
    } catch (e) {
      console.error('sms-hook alimtalk failed:', e)
    }

    await safePush('✅ 보증금 입금 자동 확인', `${reg.name}님 5,000원 입금 확인 — 「${reg.eventTitle}」 입금 처리${alimtalkSent ? ' + 확정 알림톡 발송' : ''} 완료`)

    return NextResponse.json({ matched: true, name: reg.name, eventTitle: reg.eventTitle, alimtalkSent })
  } catch (e: any) {
    console.error('sms-hook error:', e)
    return NextResponse.json({ message: e?.message || 'error' }, { status: 500 })
  }
}

async function safePush(title: string, body: string) {
  try {
    await sendPushToAdmins({ title, body, url: '/admin/dashboard' })
  } catch (e) {
    console.error('sms-hook push failed:', e)
  }
}

import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase-admin'

// 어드민 웹푸시 발송 헬퍼 (2026-09-06)
// VAPID 키(NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY) 미설정 시 조용히 skip — 사이트 동작 안 막음 (solapi와 동일 정책)

function vapidReady(): boolean {
  return !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
}

export interface PushPayload {
  title: string
  body: string
  url?: string
}

// 저장된 어드민 구독 전체에 푸시 발송.
// 만료/해지된 구독(404·410)은 발송 실패 시 자동 삭제.
export async function sendPushToAdmins(payload: PushPayload): Promise<void> {
  if (!vapidReady()) return

  webpush.setVapidDetails(
    'mailto:aipro2510@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const supabase = createAdminClient()
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')

  if (error || !subs || subs.length === 0) return

  const body = JSON.stringify(payload)
  const staleIds: string[] = []

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body
        )
      } catch (e: unknown) {
        const statusCode = (e as { statusCode?: number })?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          staleIds.push(sub.id)
        } else {
          console.error('web push send failed:', statusCode, sub.endpoint.slice(0, 60))
        }
      }
    })
  )

  if (staleIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', staleIds)
  }
}

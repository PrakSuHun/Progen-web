import { redirect } from 'next/navigation'

// 이벤트 신청폼은 /event 로 이동 (구주소 호환 리다이렉트)
export default function EventRegEventRedirect() {
  redirect('/event')
}

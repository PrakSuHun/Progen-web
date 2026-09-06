// PROGEN 어드민 웹푸시 서비스워커
// 대시보드 「알림 켜기」 시 등록됨. 푸시 수신 → OS 알림 표시, 클릭 → 어드민 대시보드 열기.

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    data = { title: 'PROGEN', body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'PROGEN 알림'
  const options = {
    body: data.body || '',
    icon: '/icon.png',
    badge: '/icon.png',
    data: { url: data.url || '/admin/dashboard' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/admin/dashboard'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/admin') && 'focus' in client) return client.focus()
      }
      return self.clients.openWindow(url)
    })
  )
})

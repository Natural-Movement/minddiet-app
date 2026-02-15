// Service Worker
// 앱을 오프라인에서도 일부 사용 가능하게 해주고,
// "홈 화면에 추가" 기능이 작동하게 해주는 파일

const CACHE_NAME = 'mind-diet-v1'

// 앱 설치 시 기본 파일들을 캐시에 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['/']))
  )
  self.skipWaiting()
})

// 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// 네트워크 요청 처리: 인터넷 되면 인터넷, 안 되면 캐시
self.addEventListener('fetch', (event) => {
  // Supabase API 호출은 항상 인터넷 사용
  if (event.request.url.includes('supabase.co')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

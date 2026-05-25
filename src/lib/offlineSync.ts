// 오프라인 캐시 및 동기화 매니저
// Supabase와의 연결이 불안정할 때 로컬에 먼저 저장하고, 연결이 복구되면 동기화합니다.

import { supabase } from './supabase'
import { dateInputAtCurrentTime, getDateInputRange, isSameLocalDay } from './dateUtils'
import { withTimeout } from './requestTimeout'

export interface LogRow {
  user_id: string
  meal_type: string
  food_id: string
  created_at: string
}

export interface OfflineAction {
  id: string
  user_id: string
  date: string
  meal_type: string
  checked_items: string[]
}

const CACHE_PREFIX = 'mind_logs_cache_'
const QUEUE_KEY = 'mind_offline_queue'
const EMPTY_MEAL_KEY = 'mind_empty_meals'

// 1. 로컬 캐시 가져오기
export function getLocalCache(userId: string): LogRow[] {
  const cached = localStorage.getItem(`${CACHE_PREFIX}${userId}`)
  return cached ? JSON.parse(cached) : []
}

// 2. 로컬 캐시 설정하기
export function setLocalCache(userId: string, logs: LogRow[]): void {
  localStorage.setItem(`${CACHE_PREFIX}${userId}`, JSON.stringify(logs))
}

// 3. 날짜 비교 함수
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  return isSameLocalDay(date1, date2)
}

export interface EmptyMealMarker {
  user_id: string
  date: string
  meal_type: string
  updated_at: string
}

export function getEmptyMealMarkers(userId: string): EmptyMealMarker[] {
  const markers: EmptyMealMarker[] = JSON.parse(localStorage.getItem(EMPTY_MEAL_KEY) || '[]')
  return markers.filter((marker) => marker.user_id === userId)
}

export function hasEmptyMealMarker(userId: string, date: string, mealType: string): boolean {
  return getEmptyMealMarkers(userId).some(
    (marker) => marker.meal_type === mealType && isSameDay(marker.date, date),
  )
}

export function markEmptyMeal(userId: string, date: string, mealType: string): void {
  const markers: EmptyMealMarker[] = JSON.parse(localStorage.getItem(EMPTY_MEAL_KEY) || '[]')
  const filtered = markers.filter(
    (marker) => !(marker.user_id === userId && marker.meal_type === mealType && isSameDay(marker.date, date)),
  )

  localStorage.setItem(
    EMPTY_MEAL_KEY,
    JSON.stringify([
      ...filtered,
      {
        user_id: userId,
        date,
        meal_type: mealType,
        updated_at: new Date().toISOString(),
      },
    ]),
  )
}

export function clearEmptyMeal(userId: string, date: string, mealType: string): void {
  const markers: EmptyMealMarker[] = JSON.parse(localStorage.getItem(EMPTY_MEAL_KEY) || '[]')
  const filtered = markers.filter(
    (marker) => !(marker.user_id === userId && marker.meal_type === mealType && isSameDay(marker.date, date)),
  )

  localStorage.setItem(EMPTY_MEAL_KEY, JSON.stringify(filtered))
}

// 4. 오프라인으로 로그 저장 (로컬 캐시 즉시 업데이트 + 대기열 추가)
export function saveLogOffline(userId: string, date: string, mealType: string, checkedItems: string[]): void {
  // 4.1 로컬 캐시 업데이트
  const currentLogs = getLocalCache(userId)
  const createdAt = dateInputAtCurrentTime(date)

  // 기존 날짜 & 끼니 기록 필터링 아웃 (삭제 효과)
  const filteredLogs = currentLogs.filter(
    (log) => !(log.meal_type === mealType && isSameDay(log.created_at, date))
  )

  // 새 기록 추가
  const newRows: LogRow[] = checkedItems.map((foodId) => ({
    user_id: userId,
    meal_type: mealType,
    food_id: foodId,
    created_at: createdAt,
  }))

  const updatedLogs = [...filteredLogs, ...newRows]
  setLocalCache(userId, updatedLogs)

  if (checkedItems.length === 0) {
    markEmptyMeal(userId, date, mealType)
  } else {
    clearEmptyMeal(userId, date, mealType)
  }

  // 4.2 오프라인 큐에 액션 적재
  const queue: OfflineAction[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')

  // 중복 대기열 방지: 동일 날짜+끼니 액션이 있으면 덮어씌움
  const filteredQueue = queue.filter(
    (act) => !(act.user_id === userId && act.meal_type === mealType && isSameDay(act.date, date))
  )

  const newAction: OfflineAction = {
    id: `${userId}_${date}_${mealType}_${Date.now()}`,
    user_id: userId,
    date,
    meal_type: mealType,
    checked_items: checkedItems,
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify([...filteredQueue, newAction]))
}

// 5. 오프라인 큐에 남은 액션 개수 가져오기
export function getOfflineQueueCount(): number {
  const queue: OfflineAction[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  return queue.length
}

// 6. 오프라인 대기열을 Supabase에 동기화
export async function syncOfflineActions(): Promise<{ success: boolean; syncedCount: number }> {
  if (!supabase || !navigator.onLine) {
    return { success: false, syncedCount: 0 }
  }

  const queue: OfflineAction[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  if (queue.length === 0) {
    return { success: true, syncedCount: 0 }
  }

  let successCount = 0
  const remainingQueue: OfflineAction[] = []

  for (const action of queue) {
    try {
      // 7일 범위 하루 설정
      const { start, end } = getDateInputRange(action.date)

      // 1단계: 기존 기록 삭제
      const { error: deleteError } = await withTimeout(
        supabase
          .from('mind_logs')
          .delete()
          .eq('user_id', action.user_id)
          .eq('meal_type', action.meal_type)
          .gte('created_at', start)
          .lte('created_at', end),
        '오프라인 기록 동기화',
      )

      if (deleteError) throw deleteError

      // 2단계: 신규 기록 삽입 (기록이 하나 이상 있을 경우에만)
      if (action.checked_items.length > 0) {
        const createdAt = dateInputAtCurrentTime(action.date)

        const rows = action.checked_items.map((foodId) => ({
          user_id: action.user_id,
          meal_type: action.meal_type,
          food_id: foodId,
          created_at: createdAt,
        }))

        const { error: insertError } = await withTimeout(
          supabase.from('mind_logs').insert(rows),
          '오프라인 기록 동기화',
        )
        if (insertError) throw insertError
      }

      successCount++
    } catch (err) {
      console.error('Failed to sync offline action:', action, err)
      remainingQueue.push(action) // 실패 시 대기열에 보관
    }
  }

  // 남은 대기열 저장
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue))

  return {
    success: remainingQueue.length === 0,
    syncedCount: successCount,
  }
}

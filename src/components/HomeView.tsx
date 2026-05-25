// 홈 화면 (랜딩페이지)
// 주간 현황 + 알림 설정 + "기록하러 가기" 버튼

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import {
  goodFoods,
  badFoods,
  allFoods,
  beverageFoods,
  calcItemScore,
  calcBeverageScore,
  FoodItem,
  BeverageItem,
} from '../data/foodItems'
import { Loader2, ArrowRight, ChevronDown, Sparkles, Check, Coffee } from 'lucide-react'
import ReminderSetting from './ReminderSetting'
import WeeklyScoreCard from './WeeklyScoreCard'
import { getLocalCache, setLocalCache, isSameDay } from '../lib/offlineSync'

// 최근 7일 날짜 배열
function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

// 요일 라벨
function getDayLabel(date: Date) {
  const today = new Date()
  if (isSameDay(date, today)) return '오늘'
  return date.toLocaleDateString('ko-KR', { weekday: 'short' })
}

// 날짜 숫자
function getDayNum(date: Date) {
  return date.getDate()
}

// 음식별 현황 카드 하나 (클릭 시 7일 기록 표시)
interface FoodStatusProps {
  food: FoodItem | BeverageItem
  count: number
  dailyRecord: number[] // 7일 각 날의 섭취 횟수
  colorType?: 'good' | 'bad' | 'beverage'
}

function FoodStatus({ food, count, dailyRecord, colorType }: FoodStatusProps) {
  const [expanded, setExpanded] = useState(false)
  const isBeverage = colorType === 'beverage'
  const isGood = isBeverage || (food as FoodItem).weeklyTarget !== undefined
  const target = isBeverage
    ? (food as BeverageItem).dailyTarget
    : isGood
    ? (food as FoodItem).weeklyTarget
    : (food as FoodItem).weeklyLimit

  const score = isBeverage ? null : calcItemScore(food as FoodItem, count)
  const days = getLast7Days()

  const getBarColor = () => {
    if (isBeverage) return 'bg-teal-500'
    if (score === 1) return 'bg-green-500'
    if (score === 0.5) return 'bg-amber-400'
    return isGood ? 'bg-red-400' : 'bg-red-500'
  }

  const getScoreBadge = () => {
    if (isBeverage) return null
    if (score === 1)
      return { text: '1.0점', bg: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' }
    if (score === 0.5)
      return { text: '0.5점', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' }
    return { text: '0.0점', bg: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-450' }
  }

  const badge = getScoreBadge()

  const barPercent = isBeverage
    ? 0
    : isGood
    ? Math.min((count / (target || 1)) * 100, 100)
    : target === 0
    ? count === 0
      ? 0
      : 100
    : Math.min((count / (target || 1)) * 100, 100)

  const borderColor = isBeverage
    ? 'border-teal-100 dark:border-teal-950/30'
    : isGood
    ? 'border-gray-100 dark:border-gray-800'
    : 'border-red-100 dark:border-red-950/30'

  const bgColor = isBeverage
    ? 'bg-teal-50/20 dark:bg-teal-950/10'
    : isGood
    ? 'bg-white dark:bg-gray-900/60'
    : 'bg-red-50/20 dark:bg-red-950/10'

  return (
    <div
      className={`p-4 rounded-3xl border-2 transition-all cursor-pointer active-press premium-card ${bgColor} ${borderColor}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl w-10 text-center">{food.emoji}</span>
          <div>
            <span className="text-base font-bold text-gray-850 dark:text-gray-200">{food.label}</span>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{food.example}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge && <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${badge.bg}`}>{badge.text}</span>}
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-gray-500 dark:text-gray-400">
        <span>
          {isBeverage
            ? `이번 주 누적 ${count}회 (하루 ${target}잔 이상 달성 기준)`
            : isGood
            ? `${count}회 / 주 ${target}회 이상`
            : `${count}회 / 주 ${target}회 미만 권장`}
        </span>
      </div>

      {!isBeverage && (
        <div className="h-2.5 bg-gray-150 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`} style={{ width: `${barPercent}%` }} />
        </div>
      )}

      {/* 확장: 7일 기록 (프리미엄 원형 타일 배치) */}
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-28 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex justify-between gap-1 bg-gray-50/50 dark:bg-gray-950/30 p-2.5 rounded-2xl">
          {days.map((day, i) => {
            const countVal = dailyRecord[i] || 0
            const isToday = isSameDay(day, new Date())
            const isFulfilled = isBeverage ? countVal >= target : countVal > 0

            // 원형 배경 색상 계산
            const getCircleStyle = () => {
              if (isFulfilled) {
                if (isBeverage) return 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                if (isGood) return 'bg-green-500 text-white shadow-md shadow-green-500/20'
                return 'bg-red-500 text-white shadow-md shadow-red-500/20'
              }
              if (isBeverage && countVal > 0) {
                return 'bg-teal-100 dark:bg-teal-900/30 text-teal-650 dark:text-teal-400 border border-teal-300 dark:border-teal-800'
              }
              if (isToday) {
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-450 border border-blue-300 dark:border-blue-700'
              }
              return 'bg-gray-100 dark:bg-gray-850 text-gray-400 dark:text-gray-550'
            }

            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <span className={`text-[10px] font-bold mb-1.5 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {getDayLabel(day)}
                </span>
                <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${getCircleStyle()}`}>
                  {isBeverage && countVal > 0 ? `${countVal}` : isFulfilled ? '✓' : getDayNum(day)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ===== 메인 홈 뷰 =====
interface HomeViewProps {
  userId: string
  onGoToLog: () => void
}

export default function HomeView({ onGoToLog, userId }: HomeViewProps) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [dailyData, setDailyData] = useState<Record<string, number[]>>({}) // food_id -> [day0..day6 횟수]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchWeekData()
    }
  }, [userId])

  const fetchWeekData = async () => {
    setLoading(true)

    const days = getLast7Days()
    const weekAgo = days[0]

    // 1단계: 즉시 로컬 캐시 데이터 로드 (0초 응답 속도)
    const cachedLogs = getLocalCache(userId)
    processData(cachedLogs, days)

    // 2단계: 네트워크 온라인 상태일 때 Supabase에서 갱신
    if (!supabase || !navigator.onLine) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('mind_logs')
        .select('food_id, created_at')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString())

      if (!error && data) {
        setLocalCache(userId, data)
        processData(data, days)
      }
    } catch (err) {
      console.error('Failed to sync data from server, using local cache', err)
    } finally {
      setLoading(false)
    }
  }

  const processData = (logs: any[], daysList: Date[]) => {
    // 주간 총 횟수
    const result: Record<string, number> = {}
    allFoods.forEach((f) => {
      result[f.id] = 0
    })
    beverageFoods.forEach((f) => {
      result[f.id] = 0
    })

    // 날짜별 기록 (7일) - 횟수 누적
    const daily: Record<string, number[]> = {}
    allFoods.forEach((f) => {
      daily[f.id] = Array(7).fill(0)
    })
    beverageFoods.forEach((f) => {
      daily[f.id] = Array(7).fill(0)
    })

    logs.forEach((row: any) => {
      if (result[row.food_id] !== undefined) {
        result[row.food_id]++
      }

      // 날짜별 섭취 횟수 가산
      const rowDate = new Date(row.created_at)
      daysList.forEach((day, idx) => {
        if (isSameDay(rowDate, day) && daily[row.food_id]) {
          daily[row.food_id][idx]++
        }
      })
    })

    setCounts(result)
    setDailyData(daily)
  }

  // 음료 누적 및 계산 정합성 맞추기
  const days = getLast7Days()
  const beverageDailyCounts = days.map((_day, idx) => {
    const bc: Record<string, number> = {}
    beverageFoods.forEach((f) => {
      bc[f.id] = dailyData[f.id]?.[idx] || 0
    })
    return bc
  })

  // 음료 날짜별 충족 여부 (어떤 음료든 그 날 목표치를 달성했는가)
  const beverageFulfilledCount = days.filter((_day, idx) => {
    return beverageFoods.some((f) => (dailyData[f.id]?.[idx] || 0) >= f.dailyTarget)
  }).length

  const beverageScore = calcBeverageScore(beverageDailyCounts)

  const weeklyScore =
    allFoods.reduce((total, food) => {
      return total + calcItemScore(food, counts[food.id] || 0)
    }, 0) + beverageScore

  return (
    <section className="space-y-6">
      {/* 알림 설정 */}
      <ReminderSetting />

      {/* 주간 MIND 총점 카드 */}
      <WeeklyScoreCard score={weeklyScore} />

      {/* 권장 식품 현황 */}
      <div>
        <h2 className="text-xl font-black text-green-700 dark:text-green-400 mb-3.5 flex items-center gap-1.5">
          <Sparkles className="text-green-500" size={20} />
          권장 식품 현황
        </h2>
        <div className="space-y-3">
          {goodFoods.map((food) => (
            <FoodStatus
              key={food.id}
              food={food}
              count={counts[food.id] || 0}
              dailyRecord={dailyData[food.id] || Array(7).fill(0)}
              colorType="good"
            />
          ))}
        </div>
      </div>

      {/* 건강 음료 현황 (정합성 맞춘 UI) */}
      <div>
        <h2 className="text-xl font-black text-teal-700 dark:text-teal-400 mb-3.5 flex items-center gap-1.5">
          <Coffee className="text-teal-500" size={20} />
          건강 음료 현황
        </h2>
        <div className="mb-3 p-4 bg-teal-50/40 dark:bg-teal-950/15 border border-teal-200/50 dark:border-teal-900/30 rounded-3xl premium-card flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-teal-800 dark:text-teal-300">통합 권장 음료 목표</span>
            <p className="text-xs text-teal-650 dark:text-teal-500 mt-0.5">최근 7일 중 {beverageFulfilledCount}일 가이드라인을 충족했습니다.</p>
          </div>
          <span
            className={`text-sm font-extrabold px-3 py-1 rounded-full ${
              beverageScore === 1
                ? 'bg-green-150 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                : beverageScore === 0.5
                ? 'bg-amber-150 text-amber-700 dark:bg-amber-950/40 dark:text-amber-450'
                : 'bg-red-150 text-red-700 dark:bg-red-950/40 dark:text-red-450'
            }`}
          >
            {beverageScore}점
          </span>
        </div>
        <div className="space-y-3">
          {beverageFoods.map((food) => (
            <FoodStatus
              key={food.id}
              food={food}
              count={counts[food.id] || 0}
              dailyRecord={dailyData[food.id] || Array(7).fill(0)}
              colorType="beverage"
            />
          ))}
        </div>
      </div>

      {/* 제한 식품 현황 */}
      <div>
        <h2 className="text-xl font-black text-red-700 dark:text-red-450 mb-3.5 flex items-center gap-1.5">
          <Sparkles className="text-red-500" size={20} />
          제한 식품 현황
        </h2>
        <div className="space-y-3">
          {badFoods.map((food) => (
            <FoodStatus
              key={food.id}
              food={food}
              count={counts[food.id] || 0}
              dailyRecord={dailyData[food.id] || Array(7).fill(0)}
              colorType="bad"
            />
          ))}
        </div>
      </div>

      {/* 기록하러 가기 버튼 */}
      <button
        onClick={onGoToLog}
        className="w-full flex items-center justify-center gap-3 py-4.5 px-6 rounded-3xl text-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active-press shadow-lg shadow-blue-500/20 transition-all border border-blue-500"
      >
        <span>식단 기록하기</span>
        <ArrowRight size={22} />
      </button>
    </section>
  )
}
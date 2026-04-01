// 홈 화면 (랜딩페이지)
// 주간 현황 + 알림 설정 + "기록하러 가기" 버튼

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { goodFoods, badFoods, allFoods, beverageFoods, calcItemScore, calcBeverageScore, FoodItem, BeverageItem } from '../data/foodItems'
import { Loader2, ArrowRight, ChevronDown } from 'lucide-react'
import ReminderSetting from './ReminderSetting'
import WeeklyScoreCard from './WeeklyScoreCard'

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

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
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
  food: FoodItem | BeverageItem;
  count: number;
  dailyRecord: boolean[]; // 7일 각 날에 먹었는지
  colorType?: 'good' | 'bad' | 'beverage';
}

function FoodStatus({ food, count, dailyRecord, colorType }: FoodStatusProps) {
  const [expanded, setExpanded] = useState(false)
  const isBeverage = colorType === 'beverage'
  const isGood = isBeverage || (food as FoodItem).weeklyTarget !== undefined
  const target = isBeverage
    ? (food as BeverageItem).dailyTarget
    : isGood ? (food as FoodItem).weeklyTarget : (food as FoodItem).weeklyLimit

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
    if (score === 1) return { text: '1점', bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
    if (score === 0.5) return { text: '0.5', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
    return { text: '0점', bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
  }

  const badge = getScoreBadge()

  const barPercent = isBeverage
    ? 0
    : isGood
      ? Math.min((count / (target || 1)) * 100, 100)
      : target === 0
        ? (count === 0 ? 0 : 100)
        : Math.min((count / (target || 1)) * 100, 100)

  const borderColor = isBeverage
    ? 'border-teal-100 dark:border-teal-900/30'
    : isGood
      ? 'border-gray-100 dark:border-gray-700'
      : 'border-red-100 dark:border-red-900/30'

  const bgColor = isBeverage
    ? 'bg-teal-50/50 dark:bg-teal-900/10'
    : isGood
      ? 'bg-white dark:bg-gray-800'
      : 'bg-red-50/50 dark:bg-red-900/10'

  return (
    <div
      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer active:scale-[0.99] ${bgColor} ${borderColor}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{food.emoji}</span>
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{food.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${badge.bg}`}>
              {badge.text}
            </span>
          )}
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-gray-500 dark:text-gray-400">
          {isBeverage
            ? `주간 ${count}회 (하루 ${target}잔 기준)`
            : isGood
              ? `${count}회 / ${target}회 이상`
              : `${count}회 / ${target}회 미만 권장`
          }
        </span>
      </div>

      {!isBeverage && (
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${barPercent}%` }}
          />
        </div>
      )}

      {/* 확장: 7일 기록 */}
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-24 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex justify-between gap-1">
          {days.map((day, i) => {
            const ate = dailyRecord[i]
            const isToday = isSameDay(day, new Date())
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <span className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {getDayLabel(day)}
                </span>
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${ate
                    ? isBeverage
                      ? 'bg-teal-500 text-white'
                      : isGood
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    : isToday
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-300 dark:border-blue-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }
                `}>
                  {ate ? '✓' : getDayNum(day)}
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
  userId: string;
  onGoToLog: () => void;
}

export default function HomeView({ onGoToLog, userId }: HomeViewProps) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [dailyData, setDailyData] = useState<Record<string, boolean[]>>({}) // food_id -> [day0..day6 먹었는지]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchWeekData()
    }
  }, [userId])

  const fetchWeekData = async () => {
    setLoading(true)
    if (!supabase) return;

    const days = getLast7Days()
    const weekAgo = days[0].toISOString()

    const { data, error } = await supabase
      .from('mind_logs')
      .select('food_id, created_at')
      .eq('user_id', userId)
      .gte('created_at', weekAgo);

    if (!error && data) {
      // 주간 총 횟수
      const result: Record<string, number> = {}
      allFoods.forEach(f => { result[f.id] = 0 })
      beverageFoods.forEach(f => { result[f.id] = 0 })

      // 날짜별 기록 (7일)
      const daily: Record<string, boolean[]> = {}
      allFoods.forEach(f => { daily[f.id] = Array(7).fill(false) })
      beverageFoods.forEach(f => { daily[f.id] = Array(7).fill(false) })

      data.forEach((row: any) => {
        if (result[row.food_id] !== undefined) {
          result[row.food_id]++
        }
        // 어느 날에 먹었는지 체크
        const rowDate = new Date(row.created_at)
        days.forEach((day, idx) => {
          if (isSameDay(rowDate, day) && daily[row.food_id]) {
            daily[row.food_id][idx] = true
          }
        })
      })

      setCounts(result)
      setDailyData(daily)
    }
    setLoading(false)
  }

  // 음료 점수 계산
  const days = getLast7Days()
  const beverageDailyCounts = days.map((day, idx) => {
    const bc: Record<string, number> = {}
    beverageFoods.forEach(f => {
      bc[f.id] = dailyData[f.id]?.[idx] ? (counts[f.id] || 0) : 0
    })
    return bc
  })

  // 음료 날짜별 충족 여부 (어떤 음료든 그 날 먹었으면)
  const beverageFulfilled = days.map((_day, idx) => {
    return beverageFoods.some(f => dailyData[f.id]?.[idx])
  })

  const beverageScore = calcBeverageScore(
    days.map((_day, idx) => {
      // 실제 일별 카운트가 필요하지만, 현재 구조상 전체 카운트만 있으므로
      // 일단 그 날 먹었는지 여부로 판단 (체크 = dailyTarget 충족으로 간주)
      const bc: Record<string, number> = {}
      beverageFoods.forEach(f => {
        bc[f.id] = dailyData[f.id]?.[idx] ? f.dailyTarget : 0
      })
      return bc
    })
  )

  const weeklyScore = allFoods.reduce((total, food) => {
    return total + calcItemScore(food, counts[food.id] || 0)
  }, 0) + beverageScore

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <section>
      {/* 알림 설정 */}
      <ReminderSetting />

      {/* 주간 MIND 총점 카드 */}
      <WeeklyScoreCard score={weeklyScore} />

      {/* 권장 식품 현황 */}
      <h2 className="text-xl font-bold text-green-800 dark:text-green-500 mb-3">✅ 권장 식품 현황</h2>
      <div className="space-y-2 mb-6">
        {goodFoods.map(food => (
          <FoodStatus
            key={food.id}
            food={food}
            count={counts[food.id] || 0}
            dailyRecord={dailyData[food.id] || Array(7).fill(false)}
          />
        ))}
      </div>

      {/* 건강 음료 현황 */}
      <h2 className="text-xl font-bold text-teal-800 dark:text-teal-500 mb-3">☕ 건강 음료 현황</h2>
      <div className="mb-2 p-3 bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
            통합 점수 (7일 중 {beverageFulfilled.filter(Boolean).length}일 충족)
          </span>
          <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${beverageScore === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : beverageScore === 0.5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {beverageScore}점
          </span>
        </div>
      </div>
      <div className="space-y-2 mb-6">
        {beverageFoods.map(food => (
          <FoodStatus
            key={food.id}
            food={food}
            count={counts[food.id] || 0}
            dailyRecord={dailyData[food.id] || Array(7).fill(false)}
            colorType="beverage"
          />
        ))}
      </div>

      {/* 제한 식품 현황 */}
      <h2 className="text-xl font-bold text-red-800 dark:text-red-500 mb-3">⛔ 제한 식품 현황</h2>
      <div className="space-y-2 mb-6">
        {badFoods.map(food => (
          <FoodStatus
            key={food.id}
            food={food}
            count={counts[food.id] || 0}
            dailyRecord={dailyData[food.id] || Array(7).fill(false)}
            colorType="bad"
          />
        ))}
      </div>

      {/* 기록하러 가기 버튼 */}
      <button
        onClick={onGoToLog}
        className="
          w-full flex items-center justify-center gap-3
          py-4 px-6 rounded-2xl
          text-xl font-bold text-white
          bg-blue-600 hover:bg-blue-700 active:scale-[0.98]
          shadow-lg transition-all
        "
      >
        <span>기록하러 가기</span>
        <ArrowRight size={24} />
      </button>
    </section>
  )
}
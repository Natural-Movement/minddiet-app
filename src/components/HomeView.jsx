// 홈 화면 (랜딩페이지)
// 주간 현황 + 알림 설정 + "기록하러 가기" 버튼

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { goodFoods, badFoods, allFoods, calcItemScore } from '../data/foodItems.js'
import { Loader2, ArrowRight } from 'lucide-react'
import ReminderSetting from './ReminderSetting'

// 7일 전 날짜
function getWeekAgo() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - 6)
  return d.toISOString()
}

// 음식별 현황 카드 하나
function FoodStatus({ food, count }) {
  const isGood = food.weeklyTarget !== undefined
  const target = isGood ? food.weeklyTarget : food.weeklyLimit
  const score = calcItemScore(food, count)

  const getBarColor = () => {
    if (score === 1) return 'bg-green-500'
    if (score === 0.5) return 'bg-amber-400'
    return isGood ? 'bg-red-400' : 'bg-red-500'
  }

  const getScoreBadge = () => {
    if (score === 1) return { text: '1점', bg: 'bg-green-100 text-green-700' }
    if (score === 0.5) return { text: '0.5', bg: 'bg-amber-100 text-amber-700' }
    return { text: '0점', bg: 'bg-red-100 text-red-700' }
  }

  const badge = getScoreBadge()

  const barPercent = isGood
    ? Math.min((count / target) * 100, 100)
    : target === 0
      ? (count === 0 ? 0 : 100)
      : Math.min((count / target) * 100, 100)

  return (
    <div className={`
      p-4 rounded-2xl border-2 transition-all
      ${isGood ? 'bg-white border-gray-100' : 'bg-red-50/50 border-red-100'}
    `}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{food.emoji}</span>
          <span className="text-lg font-semibold text-gray-800">{food.label}</span>
        </div>
        <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${badge.bg}`}>
          {badge.text}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-gray-500">
          {isGood
            ? `${count}회 / 목표 ${target}회 이상`
            : `${count}회 / ${target}회 미만 권장`
          }
        </span>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${barPercent}%` }}
        />
      </div>
    </div>
  )
}

// ===== 메인 홈 뷰 =====
export default function HomeView({ onGoToLog }) {
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeekData()
  }, [])

  const fetchWeekData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('mind_logs')
      .select('food_id')
      .gte('created_at', getWeekAgo())

    if (!error && data) {
      const result = {}
      allFoods.forEach(f => { result[f.id] = 0 })
      data.forEach(row => {
        if (result[row.food_id] !== undefined) {
          result[row.food_id]++
        }
      })
      setCounts(result)
    }
    setLoading(false)
  }

  const weeklyScore = allFoods.reduce((total, food) => {
    return total + calcItemScore(food, counts[food.id] || 0)
  }, 0)

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
      <div className={`
        p-5 rounded-2xl border-2 mb-6 text-center
        ${weeklyScore >= 10
          ? 'bg-green-50 border-green-200'
          : weeklyScore >= 5
            ? 'bg-amber-50 border-amber-200'
            : 'bg-red-50 border-red-200'
        }
      `}>
        <p className="text-base font-semibold text-gray-500 mb-1">이번 주 MIND 점수</p>
        <p className={`text-5xl font-extrabold ${
          weeklyScore >= 10 ? 'text-green-600'
            : weeklyScore >= 5 ? 'text-amber-500'
              : 'text-red-500'
        }`}>
          {weeklyScore}
          <span className="text-2xl text-gray-400"> / 15</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">최근 7일 기준 (롤링)</p>
      </div>

      {/* 권장 식품 현황 */}
      <h2 className="text-xl font-bold text-green-800 mb-3">✅ 권장 식품 현황</h2>
      <div className="space-y-2 mb-6">
        {goodFoods.map(food => (
          <FoodStatus key={food.id} food={food} count={counts[food.id] || 0} />
        ))}
      </div>

      {/* 제한 식품 현황 */}
      <h2 className="text-xl font-bold text-red-800 mb-3">⛔ 제한 식품 현황</h2>
      <div className="space-y-2 mb-6">
        {badFoods.map(food => (
          <FoodStatus key={food.id} food={food} count={counts[food.id] || 0} />
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

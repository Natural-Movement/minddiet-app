// 주간 리포트 화면
// 지난 7일간 날짜별로 MIND 점수가 어떻게 변했는지 보여줘요

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { allFoods, calcItemScore } from '../data/foodItems.js'
import { Loader2 } from 'lucide-react'

// 최근 7일 날짜 배열 만들기 (오늘 포함)
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

// 날짜를 한국어로 표시
function formatDate(date) {
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

// 같은 날인지 비교
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// 점수에 따른 색상
function getScoreColor(score) {
  if (score >= 10) return 'text-green-600'
  if (score >= 5) return 'text-amber-500'
  return 'text-red-500'
}

function getBarColor(score) {
  if (score >= 10) return 'bg-green-500'
  if (score >= 5) return 'bg-amber-400'
  return 'bg-red-400'
}

export default function WeeklyReport() {
  const [dailyScores, setDailyScores] = useState([])  // [{date, score, counts}, ...]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeekData()
  }, [])

  const fetchWeekData = async () => {
    setLoading(true)

    // 7일 전부터 오늘까지의 데이터 가져오기
    const days = getLast7Days()
    const weekAgo = days[0].toISOString()

    const { data, error } = await supabase
      .from('mind_logs')
      .select('food_id, created_at')
      .gte('created_at', weekAgo)

    if (!error && data) {
      // 날짜별 + 음식별로 횟수 세기
      const result = days.map(day => {
        // 이 날짜에 해당하는 기록만 필터
        const dayLogs = data.filter(row =>
          isSameDay(new Date(row.created_at), day)
        )

        // 음식별 횟수 세기
        const counts = {}
        allFoods.forEach(f => { counts[f.id] = 0 })
        dayLogs.forEach(row => {
          if (counts[row.food_id] !== undefined) {
            counts[row.food_id]++
          }
        })

        // 이 날의 총 기록 수
        const totalLogs = dayLogs.length

        return { date: day, counts, totalLogs }
      })

      setDailyScores(result)
    }
    setLoading(false)
  }

  // 7일 누적 횟수로 주간 MIND 점수 계산
  const weeklyTotalCounts = {}
  allFoods.forEach(f => { weeklyTotalCounts[f.id] = 0 })
  dailyScores.forEach(day => {
    allFoods.forEach(f => {
      weeklyTotalCounts[f.id] += day.counts[f.id] || 0
    })
  })

  const weeklyMindScore = allFoods.reduce((total, food) => {
    return total + calcItemScore(food, weeklyTotalCounts[food.id] || 0)
  }, 0)

  // 일별 기록 건수 중 최대값 (바 그래프 스케일링용)
  const maxDailyLogs = Math.max(...dailyScores.map(d => d.totalLogs), 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <section>
      {/* 주간 총점 */}
      <div className={`
        p-5 rounded-2xl border-2 mb-6 text-center
        ${weeklyMindScore >= 10
          ? 'bg-green-50 border-green-200'
          : weeklyMindScore >= 5
            ? 'bg-amber-50 border-amber-200'
            : 'bg-red-50 border-red-200'
        }
      `}>
        <p className="text-base font-semibold text-gray-500 mb-1">이번 주 MIND 점수</p>
        <p className={`text-5xl font-extrabold ${
          weeklyMindScore >= 10 ? 'text-green-600'
            : weeklyMindScore >= 5 ? 'text-amber-500'
              : 'text-red-500'
        }`}>
          {weeklyMindScore}
          <span className="text-2xl text-gray-400"> / 15</span>
        </p>
      </div>

      {/* 날짜별 기록 현황 */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">📊 일별 기록 현황</h2>

      <div className="space-y-3">
        {dailyScores.map(({ date, counts, totalLogs }) => {
          const isToday = isSameDay(date, new Date())
          const barWidth = (totalLogs / maxDailyLogs) * 100

          // 이 날 먹은 음식 이모지 목록
          const eatenEmojis = allFoods
            .filter(f => counts[f.id] > 0)
            .map(f => f.emoji)

          return (
            <div
              key={date.toISOString()}
              className={`
                p-4 rounded-2xl border-2
                ${isToday
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-100'
                }
              `}
            >
              {/* 날짜 + 기록 수 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-semibold ${
                    isToday ? 'text-blue-600' : 'text-gray-800'
                  }`}>
                    {isToday ? '오늘' : formatDate(date)}
                  </span>
                  {isToday && (
                    <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      TODAY
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-gray-600">
                  {totalLogs}건
                </span>
              </div>

              {/* 기록 바 */}
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    totalLogs === 0 ? 'bg-gray-200' : 'bg-blue-500'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* 먹은 음식 이모지들 */}
              {eatenEmojis.length > 0 ? (
                <p className="text-xl">{eatenEmojis.join(' ')}</p>
              ) : (
                <p className="text-sm text-gray-400">기록 없음</p>
              )}
            </div>
          )
        })}
      </div>

      {/* 식품별 주간 상세 */}
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">📋 식품별 주간 요약</h2>

      <div className="space-y-2">
        {allFoods.map(food => {
          const count = weeklyTotalCounts[food.id] || 0
          const score = calcItemScore(food, count)
          const isGood = food.weeklyTarget !== undefined
          const target = isGood ? food.weeklyTarget : food.weeklyLimit

          return (
            <div key={food.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
              <span className="text-2xl">{food.emoji}</span>
              <span className="text-base font-semibold text-gray-800 flex-1">{food.label}</span>
              <span className="text-base text-gray-500">
                {count}회{isGood ? ` / ${target}` : ` / ${target}미만`}
              </span>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                score === 1 ? 'bg-green-100 text-green-700'
                  : score === 0.5 ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
              }`}>
                {score}점
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

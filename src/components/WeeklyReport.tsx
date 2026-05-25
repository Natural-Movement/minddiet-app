// 주간 리포트 화면
// 지난 7일간 롤링 MIND 점수 추이를 SVG 트렌드 차트로 시각화하고 식품별 점수를 요약합니다.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { allFoods, beverageFoods, calcItemScore, calcBeverageScore } from '../data/foodItems'
import { Loader2, TrendingUp, BarChart3, HelpCircle } from 'lucide-react'
import WeeklyScoreCard from './WeeklyScoreCard'
import { getEmptyMealMarkers, getLocalCache, setLocalCache, isSameDay } from '../lib/offlineSync'
import { withTimeout } from '../lib/requestTimeout'

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
function formatDate(date: Date) {
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

export default function WeeklyReport({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true)
  const [dailyScores, setDailyScores] = useState<any[]>([]) // 7일 각각의 식단 로그 수 {date, totalLogs}
  const [rollingScores, setRollingScores] = useState<number[]>([]) // 7일 각각의 롤링 7일 MIND 점수
  const [hasWeeklyActivity, setHasWeeklyActivity] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchWeekData()
    }
  }, [userId])

  const fetchWeekData = async () => {
    setLoading(true)

    const days = getLast7Days()
    // 7일 롤링 점수 산출을 위해 12일 전까지의 데이터가 필요함
    const twelveDaysAgo = new Date()
    twelveDaysAgo.setHours(0, 0, 0, 0)
    twelveDaysAgo.setDate(twelveDaysAgo.getDate() - 12)

    // 1단계: 로컬 캐시 즉시 결합
    const cachedLogs = getLocalCache(userId)
    processLogs(cachedLogs, days)
    setLoading(false)

    // 2단계: 네트워크 온라인일 때 Supabase 동기화 및 캐시 업데이트
    if (!supabase || !navigator.onLine) {
      return
    }

    try {
      const { data, error } = await withTimeout(
        supabase
          .from('mind_logs')
          .select('food_id, created_at')
          .eq('user_id', userId)
          .gte('created_at', twelveDaysAgo.toISOString()),
        '리포트 데이터 불러오기',
      )

      if (!error && data) {
        setLocalCache(userId, data)
        processLogs(data, days)
      }
    } catch (err) {
      console.error('Failed to fetch from supabase in WeeklyReport', err)
    } finally {
      setLoading(false)
    }
  }

  const processLogs = (logs: any[], days: Date[]) => {
    const emptyMarkers = getEmptyMealMarkers(userId)

    // 1. 일별 단순 로그 수 계산 (최근 7일 기준)
    const dailyResult = days.map((day) => {
      const dayLogs = logs.filter((row: any) => isSameDay(new Date(row.created_at), day))
      const emptyMealCount = emptyMarkers.filter((marker) => isSameDay(marker.date, day)).length
      const counts: Record<string, number> = {}
      allFoods.forEach((f) => {
        counts[f.id] = 0
      })
      beverageFoods.forEach((f) => {
        counts[f.id] = 0
      })
      dayLogs.forEach((row: any) => {
        if (counts[row.food_id] !== undefined) {
          counts[row.food_id]++
        }
      })
      return {
        date: day,
        counts,
        totalLogs: dayLogs.length,
        emptyMealCount,
        recordCount: dayLogs.length + emptyMealCount,
      }
    })
    setDailyScores(dailyResult)
    setHasWeeklyActivity(dailyResult.some((day) => day.recordCount > 0))

    // 2. 7일 각각에 대한 "롤링 7일 MIND 점수" 역산
    const rollingScoresResult = days.map((targetDay) => {
      // targetDay 기준 이전 6일~당일까지 (7일 윈도우)
      const windowStart = new Date(targetDay)
      windowStart.setDate(windowStart.getDate() - 6)
      windowStart.setHours(0, 0, 0, 0)

      const windowEnd = new Date(targetDay)
      windowEnd.setHours(23, 59, 59, 999)

      // 이 윈도우 내에 속하는 로그 필터
      const windowLogs = logs.filter((row: any) => {
        const d = new Date(row.created_at)
        return d >= windowStart && d <= windowEnd
      })

      // 윈도우 내의 일별 기록 추출 (음료 일수 계산용)
      const windowDays: Date[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(targetDay)
        d.setDate(d.getDate() - i)
        windowDays.push(d)
      }

      // 일별 섭취 카운트 가공
      const windowDailyCounts = windowDays.map((wDay) => {
        const wDayLogs = windowLogs.filter((row: any) => isSameDay(new Date(row.created_at), wDay))
        const bc: Record<string, number> = {}
        beverageFoods.forEach((f) => {
          bc[f.id] = 0
        })
        wDayLogs.forEach((row: any) => {
          if (bc[row.food_id] !== undefined) {
            bc[row.food_id]++
          }
        })
        return bc
      })

      // 윈도우 내 식품 총합
      const counts: Record<string, number> = {}
      allFoods.forEach((f) => {
        counts[f.id] = 0
      })
      windowLogs.forEach((row: any) => {
        if (counts[row.food_id] !== undefined) {
          counts[row.food_id]++
        }
      })

      // 점수 계산
      const beverageScore = calcBeverageScore(windowDailyCounts)
      const foodScore = allFoods.reduce((total, food) => {
        return total + calcItemScore(food, counts[food.id] || 0)
      }, 0)

      return foodScore + beverageScore
    })

    setRollingScores(rollingScoresResult)
  }

  // 7일 누적 횟수 (테이블 요약 표시용 - 오늘 시점 기준 최근 7일)
  const currentDays = getLast7Days()
  const weeklyTotalCounts: Record<string, number> = {}
  allFoods.forEach((f) => {
    weeklyTotalCounts[f.id] = 0
  })
  beverageFoods.forEach((f) => {
    weeklyTotalCounts[f.id] = 0
  })

  dailyScores.forEach((day) => {
    allFoods.forEach((f) => {
      weeklyTotalCounts[f.id] += day.counts[f.id] || 0
    })
    beverageFoods.forEach((f) => {
      weeklyTotalCounts[f.id] += day.counts[f.id] || 0
    })
  })

  // 오늘의 음료 롤링 점수
  const beverageDailyCounts = dailyScores.map((day) => {
    const bc: Record<string, number> = {}
    beverageFoods.forEach((f) => {
      bc[f.id] = day.counts[f.id] || 0
    })
    return bc
  })
  const beverageScore = calcBeverageScore(beverageDailyCounts)

  const weeklyMindScore =
    allFoods.reduce((total, food) => {
      return total + calcItemScore(food, weeklyTotalCounts[food.id] || 0)
    }, 0) + beverageScore

  // 일별 기록 건수 중 최대값 (바 그래프 스케일링용)
  const maxDailyLogs = Math.max(...dailyScores.map((d) => d.recordCount || d.totalLogs), 1)

  // SVG 차트 좌표 계산
  // viewBox="0 0 500 160" 기준
  const chartWidth = 500
  const chartHeight = 160
  const paddingLeft = 40
  const paddingRight = 40
  const paddingTop = 30
  const paddingBottom = 30

  const plotWidth = chartWidth - paddingLeft - paddingRight
  const plotHeight = chartHeight - paddingTop - paddingBottom

  const points = rollingScores.map((score, idx) => {
    const x = paddingLeft + idx * (plotWidth / 6)
    // 0점일 때 Y는 가장 밑 (chartHeight - paddingBottom)
    // 15점일 때 Y는 가장 위 (paddingTop)
    const y = chartHeight - paddingBottom - (score / 15) * plotHeight
    return { x, y, score }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${
          chartHeight - paddingBottom
        } Z`
      : ''

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={36} className="animate-spin text-blue-600" />
        <span className="text-sm text-gray-400 dark:text-gray-500 mt-3 font-bold">리포트 집계 중...</span>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      {/* 주간 총점 */}
      <WeeklyScoreCard score={hasWeeklyActivity ? weeklyMindScore : null} />

      {/* SVG 스코어 트렌드 차트 */}
      <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/80 premium-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
            <TrendingUp size={18} className="text-blue-500" />
            7일 MIND 점수 추이
          </h3>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-850 px-2 py-0.5 rounded-full">
            7일 롤링 스코어
          </span>
        </div>

        {/* SVG 렌더링 */}
        {hasWeeklyActivity ? (
          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
            <defs>
              {/* 그라데이션 정의 */}
              <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 그리드 수평선 */}
            {[0, 5, 10, 15].map((gridVal) => {
              const gridY = chartHeight - paddingBottom - (gridVal / 15) * plotHeight
              return (
                <g key={gridVal}>
                  <line
                    x1={paddingLeft}
                    y1={gridY}
                    x2={chartWidth - paddingRight}
                    y2={gridY}
                    className="stroke-gray-100 dark:stroke-gray-800/50"
                    strokeWidth={1}
                    strokeDasharray={gridVal === 0 ? '0' : '4, 4'}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={gridY + 4}
                    textAnchor="end"
                    className="text-[9px] font-bold fill-gray-400 dark:fill-gray-650"
                  >
                    {gridVal}
                  </text>
                </g>
              )
            })}

            {/* 그라데이션 영역 채우기 */}
            {points.length > 0 && <path d={areaPath} fill="url(#area-grad)" />}

            {/* 주간 롤링 스코어 곡선 라인 */}
            {points.length > 0 && (
              <path d={linePath} fill="none" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth={3} />
            )}

            {/* 데이터 노드 및 점수 텍스트 */}
            {points.map((p, idx) => {
              const isToday = idx === 6
              return (
                <g key={idx}>
                  {/* 노드 점수 */}
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    className={`text-[10px] font-black ${
                      isToday ? 'fill-blue-600 dark:fill-blue-400' : 'fill-gray-500 dark:fill-gray-450'
                    }`}
                  >
                    {p.score.toFixed(1).replace('.0', '')}
                  </text>
                  {/* 노드 점 */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isToday ? 5 : 4}
                    className={`stroke-white dark:stroke-gray-900 stroke-2 ${
                      isToday ? 'fill-blue-650' : 'fill-blue-450'
                    }`}
                  />
                  {/* X축 요일 라벨 */}
                  <text
                    x={p.x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className={`text-[10px] font-bold ${
                      isToday ? 'fill-blue-650 dark:fill-blue-400' : 'fill-gray-400 dark:fill-gray-550'
                    }`}
                  >
                    {isToday ? '오늘' : currentDays[idx].toLocaleDateString('ko-KR', { weekday: 'short' })}
                  </text>
                </g>
              )
            })}
            </svg>
          </div>
        ) : (
          <div className="py-10 text-center text-sm font-bold text-gray-400 dark:text-gray-500">
            식단 기록이 쌓이면 점수 추이를 표시합니다.
          </div>
        )}
      </div>

      {/* 날짜별 기록 현황 */}
      <div>
        <h2 className="text-xl font-black text-gray-805 dark:text-gray-200 mb-3.5 flex items-center gap-1.5">
          <BarChart3 size={20} className="text-blue-500" />
          일별 기록 현황
        </h2>

        <div className="space-y-3">
          {dailyScores.map(({ date, counts, emptyMealCount, recordCount }) => {
            const isToday = isSameDay(date, new Date())
            const barWidth = (recordCount / maxDailyLogs) * 100

            // 이 날 먹은 음식 이모지 목록
            const eatenEmojis = [...allFoods, ...beverageFoods].filter((f) => counts[f.id] > 0).map((f) => f.emoji)

            return (
              <div
                key={date.toISOString()}
                className={`p-4 rounded-3xl border-2 transition-all premium-card
                  ${
                    isToday
                      ? 'bg-blue-50/20 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/80'
                      : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                  }
                `}
              >
                {/* 날짜 + 기록 수 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base font-bold ${
                        isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {isToday ? '오늘' : formatDate(date)}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        TODAY
                      </span>
                    )}
                  </div>
                  <span className="text-base font-bold text-gray-650 dark:text-gray-400">{recordCount}건 기록됨</span>
                </div>

                {/* 기록 바 */}
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      recordCount === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-500 dark:bg-blue-600'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* 먹은 음식 이모지들 */}
                {eatenEmojis.length > 0 ? (
                  <p className="text-2xl tracking-wide">{eatenEmojis.join(' ')}</p>
                ) : emptyMealCount > 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold">해당 MIND 항목 없음으로 기록됨</p>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold">식단 기록이 없습니다.</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 식품별 주간 상세 요약 */}
      <div>
        <h2 className="text-xl font-black text-gray-805 dark:text-gray-200 mb-3.5 flex items-center gap-1.5">
          <HelpCircle size={20} className="text-blue-500" />
          식품별 주간 요약
        </h2>

        <div className="space-y-2">
          {allFoods.map((food) => {
            const count = weeklyTotalCounts[food.id] || 0
            const score = calcItemScore(food, count)
            const isGood = food.weeklyTarget !== undefined
            const target = isGood ? food.weeklyTarget : food.weeklyLimit

            return (
              <div
                key={food.id}
                className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 premium-card"
              >
                <span className="text-2xl w-8 text-center">{food.emoji}</span>
                <span className="text-sm font-bold text-gray-850 dark:text-gray-250 flex-1">{food.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mr-2">
                  {count}회 {isGood ? `/ ${target}회` : `/ ${target}회 미만`}
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    !hasWeeklyActivity
                      ? 'bg-gray-100 text-gray-400 dark:bg-gray-850 dark:text-gray-500'
                      : score === 1
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                      : score === 0.5
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-450'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-450'
                  }`}
                >
                  {hasWeeklyActivity ? score.toFixed(1).replace('.0', '') : '-'}점
                </span>
              </div>
            )
          })}

          {/* 건강 음료 통합 점수 */}
          <div className="flex items-center gap-3 p-3.5 bg-teal-50/30 dark:bg-teal-950/10 rounded-2xl border border-teal-200/50 dark:border-teal-900/30 premium-card">
            <span className="text-2xl w-8 text-center">☕</span>
            <div className="flex-1">
              <span className="text-sm font-bold text-teal-850 dark:text-teal-350">건강 음료 (통합 요약)</span>
              <div className="flex gap-2.5 text-[10px] text-teal-650 dark:text-teal-500 font-bold mt-1">
                {beverageFoods.map((b) => (
                  <span key={b.id}>
                    {b.emoji} {weeklyTotalCounts[b.id] || 0}회
                  </span>
                ))}
              </div>
            </div>
            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                !hasWeeklyActivity
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-850 dark:text-gray-500'
                  : beverageScore === 1
                  ? 'bg-green-150 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                  : beverageScore === 0.5
                  ? 'bg-amber-150 text-amber-700 dark:bg-amber-950/40 dark:text-amber-450'
                  : 'bg-red-150 text-red-700 dark:bg-red-950/40 dark:text-red-450'
              }`}
            >
              {hasWeeklyActivity ? beverageScore.toFixed(1).replace('.0', '') : '-'}점
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

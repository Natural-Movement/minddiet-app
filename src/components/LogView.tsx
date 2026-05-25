import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { goodFoods, badFoods, beverageFoods, FoodItem, BeverageItem } from '../data/foodItems'
import { fetchSchoolMeal, SchoolInfo } from '../lib/schoolMeal'
import { analyzeMealMenu, MealAnalysis } from '../lib/mealAnalyzer'
import { Sun, CloudSun, Moon, Cookie, Check, Save, Loader2, Sparkles, Wand2, School } from 'lucide-react'
import Toast from './Toast'
import { getLocalCache, saveLogOffline, isSameDay, getOfflineQueueCount, syncOfflineActions } from '../lib/offlineSync'

const meals = [
  { key: 'breakfast', label: '아침', icon: Sun },
  { key: 'lunch', label: '점심', icon: CloudSun },
  { key: 'dinner', label: '저녁', icon: Moon },
  { key: 'snack', label: '간식', icon: Cookie },
]

// 현재 시간에 맞는 끼니 자동 선택
function getAutoMeal() {
  const hour = new Date().getHours()
  const minute = new Date().getMinutes()
  const time = hour * 100 + minute

  if (time >= 700 && time <= 1100) return 'breakfast'
  if (time >= 1101 && time <= 1400) return 'lunch'
  if (time >= 1701 && time <= 2000) return 'dinner'
  return 'snack'
}

// 오늘 날짜의 시작~끝 시간 (선택된 날짜 기준)
function getDayRange(dateString: string) {
  const d = new Date(dateString)
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
  return { start: start.toISOString(), end: end.toISOString() }
}

function FoodCheckCard({
  food,
  checked,
  onToggle,
  colorType,
}: {
  food: FoodItem | BeverageItem
  checked: boolean
  onToggle: (id: string) => void
  colorType?: 'good' | 'bad' | 'beverage'
}) {
  const type = colorType || ((food as FoodItem).weeklyTarget !== undefined ? 'good' : 'bad')
  const colorMap = {
    good: {
      bg: 'bg-green-50/50 dark:bg-green-950/15 border-green-500',
      text: 'text-green-800 dark:text-green-400',
      sub: 'text-green-650 dark:text-green-550',
      check: 'bg-green-500 border-green-500',
    },
    bad: {
      bg: 'bg-red-50/50 dark:bg-red-950/15 border-red-500',
      text: 'text-red-850 dark:text-red-400',
      sub: 'text-red-650 dark:text-red-550',
      check: 'bg-red-500 border-red-500',
    },
    beverage: {
      bg: 'bg-teal-50/50 dark:bg-teal-950/15 border-teal-500',
      text: 'text-teal-800 dark:text-teal-400',
      sub: 'text-teal-650 dark:text-teal-500',
      check: 'bg-teal-500 border-teal-500',
    },
  }
  const c = colorMap[type]
  return (
    <button
      onClick={() => onToggle(food.id)}
      className={`w-full flex items-center gap-3 p-4.5 rounded-2xl border-2 text-left premium-card active-press
        ${checked ? `${c.bg} shadow-md` : 'bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800'}
      `}
    >
      <span className="text-3xl w-10 text-center">{food.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-base font-bold truncate ${checked ? c.text : 'text-gray-800 dark:text-gray-250'}`}>
          {food.label}
        </p>
        <p className={`text-xs mt-0.5 truncate ${checked ? c.sub : 'text-gray-400 dark:text-gray-500'}`}>
          {food.example}
        </p>
      </div>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-200 shrink-0
        ${checked ? c.check : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700'}`}
      >
        {checked && <Check size={16} className="text-white" strokeWidth={3.5} />}
      </div>
    </button>
  )
}

export default function LogView({ userId }: { userId: string }) {
  const yyyymmdd = new Date().toISOString().split('T')[0]

  const [selectedDate, setSelectedDate] = useState(yyyymmdd)
  const [mealType, setMealType] = useState(getAutoMeal())
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [hasExisting, setHasExisting] = useState(false)
  const [mealAnalysis, setMealAnalysis] = useState<MealAnalysis | null>(null)
  const [mealAnalysisMessage, setMealAnalysisMessage] = useState('')
  const [analyzingMeal, setAnalyzingMeal] = useState(false)

  // 설정된 학교 정보 가져오기
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('mind_school_info')
    if (saved) {
      setSchoolInfo(JSON.parse(saved))
    } else {
      setSchoolInfo(null)
    }
  }, [mealType, selectedDate])

  // 날짜, 끼니, 사용자가 바뀔 때 기록을 불러옴
  useEffect(() => {
    if (userId) {
      fetchExisting(mealType, selectedDate)
    }
  }, [mealType, userId, selectedDate])

  useEffect(() => {
    setMealAnalysis(null)
    setMealAnalysisMessage('')

    if (mealType === 'lunch') {
      analyzeLunchMeal(selectedDate, false)
    }
  }, [mealType, selectedDate])

  const fetchExisting = async (meal: string, targetDate: string) => {
    setLoading(true)

    // 1단계: 로컬 캐시에서 즉시 데이터 검색 (인터넷 없어도 즉각 표시)
    const cachedLogs = getLocalCache(userId)
    const matchedCached = cachedLogs.filter(
      (log) => log.meal_type === meal && isSameDay(log.created_at, targetDate)
    )

    if (matchedCached.length > 0) {
      setCheckedItems(matchedCached.map((row) => row.food_id))
      setHasExisting(true)
      setLoading(false)
      // 온라인이어도 캐시 우선으로 바로 보여주고 백그라운드에서 굳이 스피너를 돌리지 않습니다.
      // 원격 서버 갱신도 시도하여 조용히 싱크를 맞춰줍니다.
    } else {
      setCheckedItems([])
      setHasExisting(false)
    }

    if (!supabase || !navigator.onLine) {
      setLoading(false)
      return
    }

    try {
      const { start, end } = getDayRange(targetDate)
      const { data, error } = await supabase
        .from('mind_logs')
        .select('food_id')
        .eq('user_id', userId)
        .eq('meal_type', meal)
        .gte('created_at', start)
        .lte('created_at', end)

      if (!error && data) {
        if (data.length > 0) {
          setCheckedItems(data.map((row) => row.food_id))
          setHasExisting(true)

          // 로컬 캐시 정합성 갱신
          const todayLogs = cachedLogs.filter(
            (log) => !(log.meal_type === meal && isSameDay(log.created_at, targetDate))
          )
          const fetchedRows = data.map((row) => {
            const today = new Date()
            const stDate = new Date(targetDate)
            stDate.setHours(today.getHours(), today.getMinutes(), today.getSeconds())
            return {
              user_id: userId,
              meal_type: meal,
              food_id: row.food_id,
              created_at: stDate.toISOString(),
            }
          })
          setLocalCache(userId, [...todayLogs, ...fetchedRows])
        } else {
          // 서버에 없는데 로컬엔 있을 수도 있는 정합성 체크:
          // 오프라인 대기열에 들어있는 액션이 있으면 로컬 캐시를 덮어쓰지 말아야 합니다.
          const hasPendingQueue = getOfflineQueueCount() > 0
          if (!hasPendingQueue && matchedCached.length > 0) {
            setCheckedItems([])
            setHasExisting(false)
            const cleanLogs = cachedLogs.filter(
              (log) => !(log.meal_type === meal && isSameDay(log.created_at, targetDate))
            )
            setLocalCache(userId, cleanLogs)
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const analyzeLunchMeal = async (targetDate = selectedDate, applyImmediately = true) => {
    if (mealType !== 'lunch') {
      setToast({ message: '급식 자동 분석은 점심 기록에서 사용할 수 있어요.', type: 'error' })
      return
    }

    setAnalyzingMeal(true)
    setMealAnalysisMessage('')

    try {
      const meal = await fetchSchoolMeal(targetDate)

      if (!meal.found || !meal.menu) {
        setMealAnalysis(null)
        setMealAnalysisMessage(meal.message || '해당 날짜에 등록된 점심 급식정보가 없습니다.')
        return
      }

      const analysis = analyzeMealMenu(meal.menu)
      setMealAnalysis(analysis)

      if (analysis.suggestedIds.length === 0) {
        setMealAnalysisMessage('급식 메뉴는 찾았지만 MIND 항목과 직접 매칭되는 음식은 없었어요.')
        return
      }

      setMealAnalysisMessage(`${analysis.suggestedIds.length}개 항목을 찾았어요.`)

      if (applyImmediately) {
        setCheckedItems((prev) => Array.from(new Set([...prev, ...analysis.suggestedIds])))
        setToast({ message: `급식 분석 결과 ${analysis.suggestedIds.length}개 항목을 체크했어요.`, type: 'success' })
      }
    } catch (err) {
      console.error(err)
      setMealAnalysis(null)
      setMealAnalysisMessage('급식정보를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.')
    } finally {
      setAnalyzingMeal(false)
    }
  }

  const applyMealAnalysis = () => {
    if (!mealAnalysis || mealAnalysis.suggestedIds.length === 0) return

    setCheckedItems((prev) => Array.from(new Set([...prev, ...mealAnalysis.suggestedIds])))
    setToast({ message: `급식 분석 결과 ${mealAnalysis.suggestedIds.length}개 항목을 체크했어요.`, type: 'success' })
  }

  const handleToggle = (id: string) => {
    setCheckedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSave = async () => {
    if (checkedItems.length === 0) {
      setToast({ message: '최소 1개 이상 체크해주세요!', type: 'error' })
      return
    }

    setSaving(true)

    // 오프라인 상태이거나 Supabase 미세팅 시 로컬 캐시 우선 저장 (Offline-First)
    if (!supabase || !navigator.onLine) {
      try {
        saveLogOffline(userId, selectedDate, mealType, checkedItems)
        setHasExisting(true)
        setToast({
          message: '오프라인 상태입니다. 기기에 안전하게 기록되었으며 인터넷 연결 시 자동 동기화됩니다. 💾',
          type: 'success',
        })
      } catch (err) {
        console.error(err)
        setToast({ message: '로컬 임시 저장에 실패했습니다.', type: 'error' })
      } finally {
        setSaving(false)
      }
      return
    }

    try {
      const { start, end } = getDayRange(selectedDate)

      // 1단계: 기존 삭제
      const { error: deleteError } = await supabase
        .from('mind_logs')
        .delete()
        .eq('user_id', userId)
        .eq('meal_type', mealType)
        .gte('created_at', start)
        .lte('created_at', end)

      if (deleteError) throw deleteError

      // 2단계: 신규 추가
      const now = new Date()
      const stDate = new Date(selectedDate)
      stDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds())

      const rows = checkedItems.map((foodId) => ({
        user_id: userId,
        meal_type: mealType,
        food_id: foodId,
        created_at: stDate.toISOString(),
      }))

      const { error: insertError } = await supabase.from('mind_logs').insert(rows)
      if (insertError) throw insertError

      // 로컬 캐시 갱신
      const cachedLogs = getLocalCache(userId)
      const filtered = cachedLogs.filter(
        (log) => !(log.meal_type === mealType && isSameDay(log.created_at, selectedDate))
      )
      setLocalCache(userId, [...filtered, ...rows])

      setHasExisting(true)
      setToast({
        message: hasExisting
          ? `${checkedItems.length}개 음식으로 업데이트 완료! ✏️`
          : `${checkedItems.length}개 음식을 기록했어요! 👏`,
        type: 'success',
      })

      // 대기열에 남은 게 있다면 비동기로 싱크 시도
      syncOfflineActions()
    } catch (err) {
      console.error(err)
      // 만약 네트워크 등의 예외 실패가 나면 로컬 오프라인 저장을 대체 수행해 줍니다.
      try {
        saveLogOffline(userId, selectedDate, mealType, checkedItems)
        setHasExisting(true)
        setToast({
          message: '네트워크 장애로 인해 기록을 기기에 임시 저장했습니다. 연결 시 동기화됩니다. 💾',
          type: 'success',
        })
      } catch (localErr) {
        setToast({ message: '저장에 실패했습니다. 네트워크 연결을 확인하세요.', type: 'error' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-5">
      {/* 0. 날짜 선택 */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold dark:text-white">날짜 선택</h2>
        <input
          type="date"
          value={selectedDate}
          max={yyyymmdd}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3.5 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-750 dark:text-gray-200 font-bold focus:ring-2 focus:ring-blue-500 outline-none color-scheme-light dark:[color-scheme:dark]"
        />
      </div>

      {/* 1. 끼니 선택 */}
      <div>
        <h2 className="text-xl font-bold dark:text-white mb-3">끼니 선택</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {meals.map(({ key, label, icon: Icon }) => {
            const active = mealType === key
            return (
              <button
                key={key}
                onClick={() => setMealType(key)}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border-2 font-bold transition-all duration-200 active-press
                ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-150 dark:border-gray-800'
                }`}
              >
                <Icon size={26} strokeWidth={active ? 2.5 : 2.0} />
                <span className="text-sm">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 기존 기록 안내 */}
      {hasExisting && !loading && (
        <div className="p-3.5 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-200/50 dark:border-blue-900/40 rounded-2xl text-center">
          <p className="text-blue-750 dark:text-blue-400 font-bold text-sm">
            📝 이미 기록된 끼니예요. 체크 수정 후 다시 저장하면 업데이트돼요!
          </p>
        </div>
      )}

      {/* 급식 AI 연동 카드 */}
      {mealType === 'lunch' && !loading && (
        <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/15 border-2 border-indigo-100/50 dark:border-indigo-900/40 rounded-3xl premium-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-650 text-white flex items-center justify-center shrink-0">
              <School size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-indigo-950 dark:text-indigo-250">급식 AI 매칭</h3>
                  <p className="text-xs text-indigo-750 dark:text-indigo-400 mt-0.5">
                    {schoolInfo
                      ? `🏫 ${schoolInfo.schoolName} 점심식단 연동`
                      : '⚠️ 등록된 학교가 없습니다. 헤더 설정을 통해 학교를 등록해 주세요.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => analyzeLunchMeal(selectedDate, true)}
                  disabled={analyzingMeal}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black disabled:bg-indigo-300 dark:disabled:bg-indigo-900 shrink-0"
                >
                  {analyzingMeal ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                  자동 분석
                </button>
              </div>

              {mealAnalysisMessage && (
                <p className="mt-3 text-xs font-extrabold text-indigo-800 dark:text-indigo-300">{mealAnalysisMessage}</p>
              )}

              {mealAnalysis && mealAnalysis.menuItems.length > 0 && (
                <div className="mt-3.5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex flex-wrap gap-1.5">
                    {mealAnalysis.menuItems.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 text-[10px] font-bold text-gray-700 dark:text-gray-300 border border-indigo-100 dark:border-indigo-900"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {mealAnalysis.matches.length > 0 && (
                    <>
                      <div className="grid gap-2">
                        {mealAnalysis.matches.map((match) => (
                          <div
                            key={match.foodId}
                            className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-900 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-bold text-sm text-gray-900 dark:text-gray-150">
                                <span className="mr-1">{match.emoji}</span>
                                {match.label}
                              </p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                매칭 요리: {match.matchedItems.join(', ')}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full shrink-0">
                              체크추천
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={applyMealAnalysis}
                        className="w-full py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white text-sm font-bold active-press transition-transform shadow-md shadow-indigo-500/10"
                      >
                        분석 결과 적용하기
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 로딩 표시 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={36} className="animate-spin text-blue-600" />
          <span className="mt-3 text-sm text-gray-400 dark:text-gray-500 font-bold">기록 불러오는 중...</span>
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 2. 권장 식품 */}
          <div>
            <h3 className="text-base font-black text-green-700 dark:text-green-450 mb-3 flex items-center gap-1.5">
              <span>✅ 권장 식품</span>
              <span className="text-xs font-extrabold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 rounded-full">
                {goodFoods.filter((f) => checkedItems.includes(f.id)).length} / {goodFoods.length}
              </span>
            </h3>
            <div className="grid gap-2">
              {goodFoods.map((food) => (
                <FoodCheckCard
                  key={food.id}
                  food={food}
                  checked={checkedItems.includes(food.id)}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>

          {/* 3. 건강 음료 */}
          <div>
            <h3 className="text-base font-black text-teal-700 dark:text-teal-450 mb-1 flex items-center gap-1.5">
              <span>☕ 건강 음료</span>
              <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-2.5 py-0.5 rounded-full">
                {beverageFoods.filter((f) => checkedItems.includes(f.id)).length} / {beverageFoods.length}
              </span>
            </h3>
            <p className="text-[11px] text-teal-650 dark:text-teal-500 mb-3">
              드신 시간대에 맞게 체크해 주세요. 7일 중 목표 일수가 계산됩니다.
            </p>
            <div className="grid gap-2">
              {beverageFoods.map((food) => (
                <FoodCheckCard
                  key={food.id}
                  food={food}
                  checked={checkedItems.includes(food.id)}
                  onToggle={handleToggle}
                  colorType="beverage"
                />
              ))}
            </div>
          </div>

          {/* 4. 제한 식품 */}
          <div>
            <h3 className="text-base font-black text-red-700 dark:text-red-450 mb-3 flex items-center gap-1.5">
              <span>⛔ 제한 식품</span>
              <span className="text-xs font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2.5 py-0.5 rounded-full">
                {badFoods.filter((f) => checkedItems.includes(f.id)).length} / {badFoods.length}
              </span>
            </h3>
            <div className="grid gap-2">
              {badFoods.map((food) => (
                <FoodCheckCard
                  key={food.id}
                  food={food}
                  checked={checkedItems.includes(food.id)}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>

          {/* 5. 기록하기 버튼 */}
          <button
            onClick={handleSave}
            disabled={saving || checkedItems.length === 0}
            className={`w-full flex items-center justify-center gap-3 py-4.5 px-6 rounded-3xl text-xl font-bold text-white transition-all border active-press
              ${
                saving || checkedItems.length === 0
                  ? 'bg-gray-300 dark:bg-gray-800 border-gray-300 dark:border-gray-800 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                  : hasExisting
                  ? 'bg-amber-500 hover:bg-amber-600 border-amber-600 shadow-md shadow-amber-500/10'
                  : 'bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-md shadow-blue-500/10'
              }`}
          >
            {saving ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>저장 중...</span>
              </>
            ) : (
              <>
                <Save size={24} strokeWidth={2.2} />
                <span>
                  {hasExisting ? `기록 업데이트 (${checkedItems.length}개)` : `식단 기록하기 (${checkedItems.length}개)`}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  )
}

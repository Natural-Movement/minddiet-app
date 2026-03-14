import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { goodFoods, badFoods, FoodItem } from '../data/foodItems'
import { Sun, CloudSun, Moon, Cookie, Check, Save, Loader2 } from 'lucide-react'
import Toast from './Toast'

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
  // Ensure we use the local time from the date picking
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
  return { start: start.toISOString(), end: end.toISOString() }
}

function FoodCheckCard({ food, checked, onToggle }: { food: FoodItem, checked: boolean, onToggle: (id: string) => void }) {
  const isGood = food.weeklyTarget !== undefined
  return (
    <button onClick={() => onToggle(food.id)}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200
        ${checked
          ? (isGood ? 'bg-green-50 dark:bg-green-900/30 border-green-500 shadow-md' : 'bg-red-50 dark:bg-red-900/30 border-red-500 shadow-md')
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 active:scale-[0.98]'}
      `}>
      <span className="text-3xl w-10 text-center">{food.emoji}</span>
      <div className="flex-1">
        <p className={`text-lg font-semibold ${checked ? (isGood ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400') : 'text-gray-800 dark:text-gray-200'}`}>{food.label}</p>
        <p className={`text-sm mt-0.5 ${checked ? (isGood ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500') : 'text-gray-400 dark:text-gray-500'}`}>{food.example}</p>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200
        ${checked
          ? (isGood ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500')
          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>
        {checked && <Check size={18} className="text-white" strokeWidth={3} />}
      </div>
    </button>
  )
}

export default function LogView({ userId }: { userId: string }) {
  // "2026-03-14" 같은 형태로 맞춤
  const yyyymmdd = new Date().toISOString().split('T')[0]

  const [selectedDate, setSelectedDate] = useState(yyyymmdd)
  const [mealType, setMealType] = useState(getAutoMeal())
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  const [hasExisting, setHasExisting] = useState(false)

  // 날짜, 끼니, 사용자가 바뀔 때 기록을 불러옴
  useEffect(() => {
    if (userId) {
      fetchExisting(mealType, selectedDate)
    }
  }, [mealType, userId, selectedDate])

  const fetchExisting = async (meal: string, targetDate: string) => {
    setLoading(true)
    try {
      const { start, end } = getDayRange(targetDate)

      if (!supabase) return; // Type guard
      const { data, error } = await supabase
        .from('mind_logs')
        .select('food_id')
        .eq('user_id', userId)
        .eq('meal_type', meal)
        .gte('created_at', start)
        .lte('created_at', end)

      if (!error && data && data.length > 0) {
        setCheckedItems(data.map(row => row.food_id))
        setHasExisting(true)
      } else {
        setCheckedItems([])
        setHasExisting(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (id: string) => {
    setCheckedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (checkedItems.length === 0) {
      setToast({ message: '최소 1개 이상 체크해주세요!', type: 'error' })
      return
    }
    setSaving(true)
    try {
      const { start, end } = getDayRange(selectedDate)

      if (!supabase) return; // Type guard

      // 1단계: 오늘 해당 끼니의 기존 레코드 삭제
      const { error: deleteError } = await supabase
        .from('mind_logs')
        .delete()
        .eq('user_id', userId)
        .eq('meal_type', mealType)
        .gte('created_at', start)
        .lte('created_at', end)

      if (deleteError) throw deleteError

      // 2단계: 새로 체크된 항목들 저장
      // 선택된 날짜의 현재 시간 기반으로 created_at 설정 (정렬 등을 위함)
      const now = new Date();
      const stDate = new Date(selectedDate);
      stDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

      const rows = checkedItems.map(foodId => ({
        user_id: userId,
        meal_type: mealType,
        food_id: foodId,
        created_at: stDate.toISOString() // 과거 날짜 선택 시 해당 날짜로 저장되도록 수정 (스키마에 의해 무시될 수 있으나 데이터가 start~end 사이에 있도록 보장하려면 Supabase에 알맞은 입력 필요, 기본 created_at은 DB 자동생성이지만 로그는 명시 가능할 수 있음. 기본 DB 정책에 따라 다를 수 있으나, 보통은 created_at 덮어쓰기 허용됨. 없다면 별도 date 컬럼이 필요.)
      }))

      const { error: insertError } = await supabase
        .from('mind_logs')
        .insert(rows)

      if (insertError) throw insertError

      setHasExisting(true)
      setToast({
        message: hasExisting
          ? `${checkedItems.length}개 음식으로 업데이트 완료! ✏️`
          : `${checkedItems.length}개 음식이 기록되었어요! 👏`,
        type: 'success'
      })
    } catch (err) {
      console.error(err)
      setToast({ message: '저장 실패. 네트워크를 확인해주세요.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      {/* 0. 날짜 선택 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold dark:text-white">날짜 선택</h2>
        <input
          type="date"
          value={selectedDate}
          max={yyyymmdd}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-200 font-medium focus:ring-2 focus:ring-blue-500 outline-none color-scheme-light dark:[color-scheme:dark]"
        />
      </div>

      {/* 1. 끼니 선택 */}
      <h2 className="text-xl font-bold dark:text-white mb-3">끼니 선택</h2>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {meals.map(({ key, label, icon: Icon }) => {
          const active = mealType === key
          return (
            <button key={key} onClick={() => setMealType(key)}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 font-semibold transition-all duration-200
                ${active
                  ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
              <Icon size={28} strokeWidth={2.2} />
              <span className="text-base">{label}</span>
            </button>
          )
        })}
      </div>

      {/* 기존 기록 안내 */}
      {hasExisting && !loading && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl text-center">
          <p className="text-blue-700 dark:text-blue-300 font-semibold text-base">
            📝 이미 기록된 끼니예요. 수정 후 저장하면 업데이트돼요!
          </p>
        </div>
      )}

      {/* 로딩 */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={32} className="animate-spin text-blue-600 dark:text-blue-400" />
          <span className="ml-3 text-gray-500 dark:text-gray-400">불러오는 중...</span>
        </div>
      ) : (
        <>
          {/* 2. 음식 체크 */}
          <h2 className="text-xl font-bold text-green-800 dark:text-green-500 mb-3">
            ✅ 권장 식품
            <span className="ml-2 text-base font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
              {goodFoods.filter(f => checkedItems.includes(f.id)).length}/{goodFoods.length}
            </span>
          </h2>
          <div className="space-y-2 mb-6">
            {goodFoods.map(food => (
              <FoodCheckCard key={food.id} food={food}
                checked={checkedItems.includes(food.id)}
                onToggle={handleToggle} />
            ))}
          </div>

          <h2 className="text-xl font-bold text-red-800 dark:text-red-500 mb-3">
            ⛔ 제한 식품
            <span className="ml-2 text-base font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">
              {badFoods.filter(f => checkedItems.includes(f.id)).length}/{badFoods.length}
            </span>
          </h2>
          <div className="space-y-2 mb-6">
            {badFoods.map(food => (
              <FoodCheckCard key={food.id} food={food}
                checked={checkedItems.includes(food.id)}
                onToggle={handleToggle} />
            ))}
          </div>

          {/* 3. 기록하기 버튼 */}
          <button onClick={handleSave}
            disabled={saving || checkedItems.length === 0}
            className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-xl font-bold text-white transition-all duration-200
              ${saving || checkedItems.length === 0
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : hasExisting
                  ? 'bg-amber-500 hover:bg-amber-600 active:scale-[0.98] shadow-lg'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg'}`}>
            {saving ? (
              <><Loader2 size={26} className="animate-spin" /><span>저장 중...</span></>
            ) : (
              <><Save size={26} strokeWidth={2.2} />
                <span>{hasExisting ? `업데이트 (${checkedItems.length}개)` : `기록하기 (${checkedItems.length}개)`}</span>
              </>
            )}
          </button>
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  )
}
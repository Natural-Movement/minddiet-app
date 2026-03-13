import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { goodFoods, badFoods } from '../data/foodItems.js'
import { Sun, CloudSun, Moon, Cookie, Check, Save, Loader2 } from 'lucide-react'
import Toast from './Toast'

const meals = [
  { key: 'breakfast', label: '아침', icon: Sun },
  { key: 'lunch',     label: '점심', icon: CloudSun },
  { key: 'dinner',    label: '저녁', icon: Moon },
  { key: 'snack',     label: '간식', icon: Cookie },
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

// 오늘 날짜의 시작~끝 시간
function getTodayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  return { start: start.toISOString(), end: end.toISOString() }
}

function FoodCheckCard({ food, checked, onToggle }) {
  const isGood = food.weeklyTarget !== undefined
  return (
    <button onClick={() => onToggle(food.id)}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200
        ${checked
          ? (isGood ? 'bg-green-50 border-green-500 shadow-md' : 'bg-red-50 border-red-500 shadow-md')
          : 'bg-white border-gray-200 active:scale-[0.98]'}
      `}>
      <span className="text-3xl w-10 text-center">{food.emoji}</span>
      <div className="flex-1">
        <p className={`text-lg font-semibold ${checked ? (isGood ? 'text-green-800' : 'text-red-800') : 'text-gray-800'}`}>{food.label}</p>
        <p className={`text-sm mt-0.5 ${checked ? (isGood ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>{food.example}</p>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200
        ${checked
          ? (isGood ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500')
          : 'bg-white border-gray-300'}`}>
        {checked && <Check size={18} className="text-white" strokeWidth={3} />}
      </div>
    </button>
  )
}

export default function LogView({ userId }) {
  const [mealType, setMealType] = useState(getAutoMeal())
  const [checkedItems, setCheckedItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [hasExisting, setHasExisting] = useState(false)

  // 끼니나 사용자가 바뀔 때마다, 그리고 userId가 확실히 존재할 때 기록을 불러옴
  useEffect(() => {
    if (userId) {
      fetchExisting(mealType)
    }
  }, [mealType, userId])

  const fetchExisting = async (meal) => {
    setLoading(true)
    try {
      const { start, end } = getTodayRange()
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

  const handleToggle = (id) => {
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
      const { start, end } = getTodayRange()

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
      const rows = checkedItems.map(foodId => ({
        user_id: userId,
        meal_type: mealType,
        food_id: foodId
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
      {/* 1. 끼니 선택 */}
      <h2 className="text-xl font-bold text-gray-800 mb-3">끼니 선택</h2>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {meals.map(({ key, label, icon: Icon }) => {
          const active = mealType === key
          return (
            <button key={key} onClick={() => setMealType(key)}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 font-semibold transition-all duration-200
                ${active
                  ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-lg'
                  : 'bg-white text-gray-600 border-gray-200'}`}>
              <Icon size={28} strokeWidth={2.2} />
              <span className="text-base">{label}</span>
            </button>
          )
        })}
      </div>

      {/* 기존 기록 안내 */}
      {hasExisting && !loading && (
        <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl text-center">
          <p className="text-blue-700 font-semibold text-base">
            📝 이미 기록된 끼니예요. 수정 후 저장하면 업데이트돼요!
          </p>
        </div>
      )}

      {/* 로딩 */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <span className="ml-3 text-gray-500">불러오는 중...</span>
        </div>
      ) : (
        <>
          {/* 2. 음식 체크 */}
          <h2 className="text-xl font-bold text-green-800 mb-3">
            ✅ 권장 식품
            <span className="ml-2 text-base font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
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

          <h2 className="text-xl font-bold text-red-800 mb-3">
            ⛔ 제한 식품
            <span className="ml-2 text-base font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
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
                ? 'bg-gray-300 cursor-not-allowed'
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
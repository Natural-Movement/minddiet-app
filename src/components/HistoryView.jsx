// 히스토리 컴포넌트
// 과거에 기록한 식단들을 목록으로 보여주는 부품
// Supabase에서 데이터를 가져와서 보여줘요

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { allFoods } from '../data/foodItems.js'
import { Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

// 끼니 이름을 이모지랑 같이 보여주려고 정리
const mealLabels = {
  breakfast: '🌅 아침',
  lunch: '☀️ 점심',
  dinner: '🌙 저녁',
  snack: '🍪 간식',
}

// ===== 기록 한 줄(카드) 컴포넌트 =====
function LogEntry({ log, onDelete }) {
  // open = 카드를 펼쳤는지 접었는지
  const [open, setOpen] = useState(false)

  // 점수 색깔
  const scoreColor = log.score >= 0 ? 'text-green-600' : 'text-red-600'

  // 날짜를 한국어로 변환
  const date = new Date(log.created_at)
  const dateStr = date.toLocaleDateString('ko-KR', {
    month: 'short', day: 'numeric', weekday: 'short',
  })
  const timeStr = date.toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit',
  })

  // 체크된 음식 id를 이모지+이름으로 변환
  const checkedLabels = (log.checked_items || []).map(id => {
    const found = allFoods.find(f => f.id === id)
    return found ? `${found.emoji} ${found.label}` : id
  })

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
      {/* 접힌 상태: 요약 정보 (터치하면 펼침) */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              {mealLabels[log.meal_type] || log.meal_type}
            </span>
            <span className={`text-lg font-bold ${scoreColor}`}>
              {log.score > 0 ? `+${log.score}` : log.score}점
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{dateStr} {timeStr}</p>
        </div>
        {/* 펼침/접힘 화살표 */}
        {open
          ? <ChevronUp size={22} className="text-gray-400" />
          : <ChevronDown size={22} className="text-gray-400" />
        }
      </button>

      {/* 펼친 상태: 상세 정보 */}
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* 체크한 음식 목록 */}
          {checkedLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {checkedLabels.map((label, i) => (
                <span key={i} className="bg-gray-100 text-sm text-gray-600 px-2.5 py-1 rounded-full">
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* 메모 */}
          {log.notes && (
            <p className="mt-3 text-base text-gray-600 bg-gray-50 p-3 rounded-lg">
              {log.notes}
            </p>
          )}

          {/* 삭제 버튼 */}
          <button
            onClick={() => onDelete(log.id)}
            className="mt-3 flex items-center gap-1.5 text-sm text-red-400"
          >
            <Trash2 size={16} />
            삭제
          </button>
        </div>
      )}
    </div>
  )
}

// ===== 메인 히스토리 뷰 =====
export default function HistoryView() {
  const [logs, setLogs] = useState([])        // 기록 목록
  const [loading, setLoading] = useState(true) // 로딩 중인지

  // 컴포넌트가 화면에 나타나면 Supabase에서 데이터 가져오기
  useEffect(() => {
    fetchLogs()
  }, [])

  // 데이터 가져오는 함수
  const fetchLogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('mind_logs')
      .select('*')                           // 모든 컬럼 가져와
      .order('created_at', { ascending: false }) // 최신순 정렬
      .limit(30)                              // 최대 30개만
    if (!error && data) setLogs(data)
    setLoading(false)
  }

  // 삭제 함수
  const handleDelete = async (id) => {
    if (!window.confirm('이 기록을 삭제할까요?')) return
    const { error } = await supabase.from('mind_logs').delete().eq('id', id)
    if (!error) {
      // 삭제 성공하면 목록에서도 제거
      setLogs(prev => prev.filter(l => l.id !== id))
    }
  }

  // 오늘의 총점 계산
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayScore = logs
    .filter(l => new Date(l.created_at) >= todayStart)
    .reduce((sum, l) => sum + (l.score || 0), 0)

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-800 mb-4">📋 기록 히스토리</h2>

      {/* 오늘 총점 카드 */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-blue-800">오늘의 총점</span>
        <span className={`text-4xl font-extrabold ${todayScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {todayScore > 0 ? `+${todayScore}` : todayScore}
        </span>
      </div>

      {/* 로딩 중 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>

      /* 기록 없음 */
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">아직 기록이 없어요</p>
          <p className="text-base mt-1">첫 번째 식단을 기록해보세요!</p>
        </div>

      /* 기록 목록 */
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <LogEntry key={log.id} log={log} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </section>
  )
}

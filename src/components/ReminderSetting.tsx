import { useState, useEffect, useRef } from 'react'
import { Bell, BellOff, ChevronDown, ChevronUp } from 'lucide-react'

const DEFAULT_TIMES = {
  breakfast: '08:00',
  lunch: '12:30',
  dinner: '18:00',
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: '🌅 아침',
  lunch: '☀️ 점심',
  dinner: '🌙 저녁',
}

export default function ReminderSetting() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('reminder_enabled') === 'true')
  const [times, setTimes] = useState(() => {
    const saved = localStorage.getItem('reminder_times')
    return saved ? JSON.parse(saved) : DEFAULT_TIMES
  })
  const [open, setOpen] = useState(false)
  const timersRef = useRef<NodeJS.Timeout[]>([])

  // 알림 권한 요청 + 타이머 설정
  useEffect(() => {
    if (enabled) {
      requestPermission()
      scheduleAll()
    } else {
      clearAll()
    }
    return () => clearAll()
  }, [enabled, times])

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const clearAll = () => {
    timersRef.current.forEach(id => clearTimeout(id))
    timersRef.current = []
  }

  const scheduleAll = () => {
    clearAll()
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const now = new Date()
    Object.entries(times as Record<string, string>).forEach(([meal, timeStr]) => {
      const [h, m] = timeStr.split(':').map(Number)
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0)
      let diff = target.getTime() - now.getTime()

      // 이미 지난 시간이면 내일로
      if (diff < 0) diff += 24 * 60 * 60 * 1000

      const id = setTimeout(() => {
        new Notification('🧠 MIND Diet 알림', {
          body: `${MEAL_LABELS[meal]} 식사를 기록할 시간이에요!`,
          icon: '/icon.svg',
          tag: meal,
        })
        // 다음날 같은 시간에 다시 알림
        const nextId = setTimeout(() => scheduleAll(), 1000)
        timersRef.current.push(nextId)
      }, diff)

      timersRef.current.push(id)
    })
  }

  const toggleEnabled = () => {
    const next = !enabled
    setEnabled(next)
    localStorage.setItem('reminder_enabled', String(next))
    if (next) requestPermission()
  }

  const updateTime = (meal: string, value: string) => {
    const updated = { ...times, [meal]: value }
    setTimes(updated)
    localStorage.setItem('reminder_times', JSON.stringify(updated))
  }

  return (
    <div className="mb-4 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
          {enabled ? <Bell size={16} className="text-blue-500 dark:text-blue-400" /> : <BellOff size={16} className="text-gray-400 dark:text-gray-500" />}
          <span>식사 알림</span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button onClick={toggleEnabled}
          className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${enabled ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {open && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex gap-3">
          {Object.entries(MEAL_LABELS).map(([key, label]) => (
            <div key={key} className="flex-1 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
              <input type="time" value={times[key]}
                onChange={e => updateTime(key, e.target.value)}
                className="w-full text-sm text-center border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg py-1 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 color-scheme-light dark:[color-scheme:dark]" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

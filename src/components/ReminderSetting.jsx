// 알림 설정 컴포넌트
// 아침/점심/저녁 시간에 "식단 기록하세요!" 알림을 보내줘요
// 알림 시간은 사용자가 바꿀 수 있고, localStorage에 저장돼요

import { useState, useEffect, useRef } from 'react'
import { Bell, BellOff } from 'lucide-react'

// 기본 알림 시간
const DEFAULT_TIMES = {
  breakfast: '08:00',
  lunch: '12:30',
  dinner: '18:00',
}

const MEAL_LABELS = {
  breakfast: '🌅 아침',
  lunch: '☀️ 점심',
  dinner: '🌙 저녁',
}

// 알림 권한 요청
async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// 알림 보내기
function sendNotification(meal) {
  if (Notification.permission !== 'granted') return
  new Notification('🧠 MIND Diet 알림', {
    body: `${MEAL_LABELS[meal]} 식사 기록할 시간이에요!`,
    icon: '/icons/icon-192.png',
    tag: `mind-diet-${meal}`,  // 같은 태그면 중복 알림 방지
  })
}

export default function ReminderSetting() {
  // localStorage에서 설정 불러오기
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('reminder_enabled') === 'true'
  })
  const [times, setTimes] = useState(() => {
    const saved = localStorage.getItem('reminder_times')
    return saved ? JSON.parse(saved) : DEFAULT_TIMES
  })
  const [open, setOpen] = useState(false)  // 설정 패널 열기/닫기

  // 타이머 저장용 (컴포넌트가 사라져도 정리할 수 있게)
  const timersRef = useRef([])

  // 알림 스케줄링
  useEffect(() => {
    // 기존 타이머 전부 정리
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []

    if (!enabled) return

    // 각 끼니별로 타이머 설정
    Object.entries(times).forEach(([meal, timeStr]) => {
      const scheduleNext = () => {
        const now = new Date()
        const [hours, minutes] = timeStr.split(':').map(Number)

        // 오늘 알림 시간 계산
        const target = new Date()
        target.setHours(hours, minutes, 0, 0)

        // 이미 지났으면 내일로
        if (target <= now) {
          target.setDate(target.getDate() + 1)
        }

        // 밀리초 단위 차이 계산
        const delay = target.getTime() - now.getTime()

        const timer = setTimeout(() => {
          sendNotification(meal)
          // 알림 보낸 후 다음 날 알림 다시 예약
          scheduleNext()
        }, delay)

        timersRef.current.push(timer)
      }

      scheduleNext()
    })

    // 컴포넌트가 사라질 때 타이머 정리
    return () => {
      timersRef.current.forEach(t => clearTimeout(t))
    }
  }, [enabled, times])

  // 설정 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('reminder_enabled', enabled.toString())
    localStorage.setItem('reminder_times', JSON.stringify(times))
  }, [enabled, times])

  // 알림 켜기/끄기 토글
  const handleToggle = async () => {
    if (!enabled) {
      // 켜려고 할 때 → 권한 요청
      const granted = await requestPermission()
      if (!granted) {
        alert('알림 권한이 필요해요. 브라우저 설정에서 알림을 허용해주세요.')
        return
      }
    }
    setEnabled(prev => !prev)
  }

  // 시간 변경
  const handleTimeChange = (meal, newTime) => {
    setTimes(prev => ({ ...prev, [meal]: newTime }))
  }

  return (
    <div className={`
      rounded-2xl border-2 mb-6 overflow-hidden transition-all
      ${enabled
        ? 'bg-blue-50 border-blue-200'
        : 'bg-gray-50 border-gray-200'
      }
    `}>
      {/* 알림 토글 버튼 */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          {enabled
            ? <Bell size={24} className="text-blue-600" />
            : <BellOff size={24} className="text-gray-400" />
          }
          <div className="text-left">
            <p className="text-lg font-semibold text-gray-800">식사 알림</p>
            <p className="text-sm text-gray-500">
              {enabled ? '알림이 켜져 있어요' : '알림이 꺼져 있어요'}
            </p>
          </div>
        </div>

        {/* 토글 스위치 */}
        <div className={`
          w-14 h-8 rounded-full p-1 transition-all
          ${enabled ? 'bg-blue-600' : 'bg-gray-300'}
        `}>
          <div className={`
            w-6 h-6 bg-white rounded-full shadow transition-all
            ${enabled ? 'translate-x-6' : 'translate-x-0'}
          `} />
        </div>
      </button>

      {/* 알림 켜져 있을 때만 시간 설정 보여줌 */}
      {enabled && (
        <div className="px-4 pb-4 space-y-3">
          {/* 설정 열기/닫기 */}
          <button
            onClick={() => setOpen(o => !o)}
            className="text-sm font-semibold text-blue-600"
          >
            {open ? '시간 설정 닫기 ▲' : '시간 설정 변경 ▼'}
          </button>

          {open && (
            <div className="space-y-2">
              {Object.entries(MEAL_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between bg-white p-3 rounded-xl">
                  <span className="text-base font-semibold text-gray-700">{label}</span>
                  {/* 시간 선택 input */}
                  <input
                    type="time"
                    value={times[key]}
                    onChange={(e) => handleTimeChange(key, e.target.value)}
                    className="text-lg font-bold text-blue-600 bg-transparent border-none outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 현재 설정된 시간 요약 */}
          {!open && (
            <div className="flex gap-3">
              {Object.entries(times).map(([key, time]) => (
                <span key={key} className="text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                  {MEAL_LABELS[key].split(' ')[0]} {time}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

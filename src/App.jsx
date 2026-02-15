// 메인 앱 파일 (최종 4탭 버전)
// 탭 1: 홈 (주간 현황)
// 탭 2: 기록하기
// 탭 3: 주간 리포트
// 탭 4: 인포그래픽

import { useState } from 'react'
import HomeView from './components/HomeView'
import LogView from './components/LogView'
import WeeklyReport from './components/WeeklyReport'
import InfoView from './components/InfoView'
import { Home, PlusCircle, BarChart3, BookOpen } from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [homeKey, setHomeKey] = useState(0)
  const [reportKey, setReportKey] = useState(0)

  const changeTab = (tab) => {
    if (tab === 'home') setHomeKey(k => k + 1)
    if (tab === 'report') setReportKey(k => k + 1)
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* ===== 상단 헤더 ===== */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            🧠 MIND Diet
          </h1>
          <span className="text-sm text-gray-400">
            {new Date().toLocaleDateString('ko-KR', {
              month: 'long', day: 'numeric', weekday: 'short'
            })}
          </span>
        </div>
      </header>

      {/* ===== 메인 콘텐츠 ===== */}
      <main className="max-w-lg mx-auto w-full px-4 py-6">
        {activeTab === 'home' && (
          <HomeView
            key={homeKey}
            onGoToLog={() => changeTab('log')}
          />
        )}
        {activeTab === 'log' && (
          <LogView />
        )}
        {activeTab === 'report' && (
          <WeeklyReport key={reportKey} />
        )}
        {activeTab === 'info' && (
          <InfoView />
        )}
      </main>

      {/* ===== 하단 탭 바 (4개) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto grid grid-cols-4">
          {/* 홈 */}
          <button
            onClick={() => changeTab('home')}
            className={`
              flex flex-col items-center gap-1 py-3
              transition-all
              ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}
            `}
          >
            <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 1.8} />
            <span className="text-xs font-semibold">홈</span>
          </button>

          {/* 기록 */}
          <button
            onClick={() => changeTab('log')}
            className={`
              flex flex-col items-center gap-1 py-3
              transition-all
              ${activeTab === 'log' ? 'text-blue-600' : 'text-gray-400'}
            `}
          >
            <PlusCircle size={22} strokeWidth={activeTab === 'log' ? 2.5 : 1.8} />
            <span className="text-xs font-semibold">기록</span>
          </button>

          {/* 리포트 */}
          <button
            onClick={() => changeTab('report')}
            className={`
              flex flex-col items-center gap-1 py-3
              transition-all
              ${activeTab === 'report' ? 'text-blue-600' : 'text-gray-400'}
            `}
          >
            <BarChart3 size={22} strokeWidth={activeTab === 'report' ? 2.5 : 1.8} />
            <span className="text-xs font-semibold">리포트</span>
          </button>

          {/* 가이드 */}
          <button
            onClick={() => changeTab('info')}
            className={`
              flex flex-col items-center gap-1 py-3
              transition-all
              ${activeTab === 'info' ? 'text-blue-600' : 'text-gray-400'}
            `}
          >
            <BookOpen size={22} strokeWidth={activeTab === 'info' ? 2.5 : 1.8} />
            <span className="text-xs font-semibold">가이드</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

import { useState } from 'react'
import UserSelect from './components/UserSelect'
import HomeView from './components/HomeView'
import LogView from './components/LogView'
import WeeklyReport from './components/WeeklyReport'
import InfoView from './components/InfoView'
import { Home, PlusCircle, BarChart3, BookOpen, LogOut } from 'lucide-react'

const USER_LABELS = {
  only_me: 'Only Me',
  sky: 'Sky',
}

export default function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem('mind_user') || null)
  const [activeTab, setActiveTab] = useState('home')
  const [homeKey, setHomeKey] = useState(0)
  const [reportKey, setReportKey] = useState(0)

  const selectUser = (id) => {
    localStorage.setItem('mind_user', id)
    setUserId(id)
  }

  const logout = () => {
    localStorage.removeItem('mind_user')
    setUserId(null)
    setActiveTab('home')
  }

  const changeTab = (tab) => {
    if (tab === 'home') setHomeKey(k => k + 1)
    if (tab === 'report') setReportKey(k => k + 1)
    setActiveTab(tab)
  }

  // 사용자 미선택 시 선택 화면
  if (!userId) {
    return <UserSelect onSelect={selectUser} />
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">🧠 MIND Diet</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {USER_LABELS[userId]}
            </span>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="max-w-lg mx-auto w-full px-4 py-6">
        {activeTab === 'home' && <HomeView key={homeKey} userId={userId} onGoToLog={() => changeTab('log')} />}
        {activeTab === 'log' && <LogView userId={userId} />}
        {activeTab === 'report' && <WeeklyReport key={reportKey} userId={userId} />}
        {activeTab === 'info' && <InfoView />}
      </main>

      {/* bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto grid grid-cols-4">
          <button onClick={() => changeTab('home')} className={`flex flex-col items-center gap-1 py-3 transition-all ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}>
            <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 1.8} />
            <span className="text-xs font-semibold">홈</span>
          </button>
          <button onClick={() => changeTab('log')} className={`flex flex-col items-center gap-1 py-3 transition-all ${activeTab === 'log' ? 'text-blue-600' : 'text-gray-400'}`}>
            <PlusCircle size={22} strokeWidth={activeTab === 'log' ? 2.5 : 1.8} />
            <span className="text-xs font-semibold">기록</span>
          </button>
          <button onClick={() => changeTab('report')} className={`flex flex-col items-center gap-1 py-3 transition-all ${activeTab === 'report' ? 'text-blue-600' : 'text-gray-400'}`}>
            <BarChart3 size={22} strokeWidth={activeTab === 'report' ? 2.5 : 1.8} />
            <span className="text-xs font-semibold">리포트</span>
          </button>
          <button onClick={() => changeTab('info')} className={`flex flex-col items-center gap-1 py-3 transition-all ${activeTab === 'info' ? 'text-blue-600' : 'text-gray-400'}`}>
            <BookOpen size={22} strokeWidth={activeTab === 'info' ? 2.5 : 1.8} />
            <span className="text-xs font-semibold">가이드</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

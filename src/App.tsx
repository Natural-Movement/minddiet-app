import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import UserSelect from './components/UserSelect'
import HomeView from './components/HomeView'
import LogView from './components/LogView'
import WeeklyReport from './components/WeeklyReport'
import InfoView from './components/InfoView'
import { Home, PlusCircle, BarChart3, BookOpen, LogOut, Moon, Sun } from 'lucide-react'

const USER_LABELS = {
  only_me: 'Only Me',
  sky: 'Sky',
}

export default function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem('mind_user') || null)
  const [isDark, setIsDark] = useState(() => {
    // Check local storage or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true;
    }
    return false;
  })
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const themeColorMeta = document.getElementById('theme-color-meta')
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.style.backgroundColor = '#111827' // 강제 주입!
      document.body.style.backgroundColor = '#111827'
      localStorage.theme = 'dark'
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#111827')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.backgroundColor = '#f9fafb' // 강제 주입!
      document.body.style.backgroundColor = '#f9fafb'
      localStorage.theme = 'light'
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#f9fafb')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  const selectUser = (id: string) => {
    localStorage.setItem('mind_user', id)
    setUserId(id)
  }

  const logout = () => {
    localStorage.removeItem('mind_user')
    setUserId(null)
    navigate('/')
  }

  // 사용자 미선택 시 선택 화면
  if (!userId) {
    return <UserSelect onSelect={selectUser} />
  }

  return (
    <div className="min-h-screen pb-24 transition-colors duration-200 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
      {/* header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">🧠 MIND Diet</h1>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-1.5 text-gray-500 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
              {userId ? USER_LABELS[userId as keyof typeof USER_LABELS] : ''}
            </span>
            <button onClick={logout} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="max-w-lg mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/" element={<HomeView userId={userId} onGoToLog={() => navigate('/log')} />} />
          <Route path="/log" element={<LogView userId={userId} />} />
          <Route path="/report" element={<WeeklyReport userId={userId} />} />
          <Route path="/info" element={<InfoView />} />
        </Routes>
      </main>

      {/* bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-lg mx-auto grid grid-cols-4">
          <Link to="/" className={`flex flex-col items-center gap-1 py-3 transition-all ${location.pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <Home size={22} strokeWidth={location.pathname === '/' ? 2.5 : 1.8} />
            <span className="text-xs font-semibold">홈</span>
          </Link>
          <Link to="/log" className={`flex flex-col items-center gap-1 py-3 transition-all ${location.pathname === '/log' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <PlusCircle size={22} strokeWidth={location.pathname === '/log' ? 2.5 : 1.8} />
            <span className="text-xs font-semibold">기록</span>
          </Link>
          <Link to="/report" className={`flex flex-col items-center gap-1 py-3 transition-all ${location.pathname === '/report' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <BarChart3 size={22} strokeWidth={location.pathname === '/report' ? 2.5 : 1.8} />
            <span className="text-xs font-semibold">리포트</span>
          </Link>
          <Link to="/info" className={`flex flex-col items-center gap-1 py-3 transition-all ${location.pathname === '/info' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <BookOpen size={22} strokeWidth={location.pathname === '/info' ? 2.5 : 1.8} />
            <span className="text-xs font-semibold">가이드</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

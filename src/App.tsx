import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import UserSelect from './components/UserSelect'
import HomeView from './components/HomeView'
import LogView from './components/LogView'
import WeeklyReport from './components/WeeklyReport'
import InfoView from './components/InfoView'
import SchoolSettingModal from './components/SchoolSettingModal'
import { Home, PlusCircle, BarChart3, BookOpen, LogOut, Moon, Sun, School } from 'lucide-react'
import { syncOfflineActions } from './lib/offlineSync'

export default function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem('mind_user') || null)
  const [isDark, setIsDark] = useState(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true
    }
    return false
  })
  const [schoolModalOpen, setSchoolModalOpen] = useState(false)
  const [schoolName, setSchoolName] = useState('')
  const [profiles, setProfiles] = useState<any[]>([])

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const themeColorMeta = document.getElementById('theme-color-meta')
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.style.backgroundColor = '#0b0f19'
      document.body.style.backgroundColor = '#0b0f19'
      localStorage.theme = 'dark'
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#0b0f19')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.backgroundColor = '#f9fafb'
      document.body.style.backgroundColor = '#f9fafb'
      localStorage.theme = 'light'
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#f9fafb')
    }
  }, [isDark])

  // 학교명 및 프로필 정보 로드
  useEffect(() => {
    updateSchoolName()
    const savedProfiles = localStorage.getItem('mind_profiles')
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles))
    }
  }, [userId])

  // 오프라인 동기화 프로세스 연결
  useEffect(() => {
    // 마운트 시 동기화 시도
    syncOfflineActions()

    const handleOnline = () => {
      syncOfflineActions().then((res) => {
        if (res.syncedCount > 0) {
          alert(`☁️ 오프라인 대기 식단 ${res.syncedCount}건이 온라인 데이터베이스와 무사히 동기화되었습니다!`)
          // 현재 페이지 데이터 리로드를 위해 강제 새로고침 또는 상태 갱신 트리거
          window.location.reload()
        }
      })
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  const updateSchoolName = () => {
    const saved = localStorage.getItem('mind_school_info')
    if (saved) {
      try {
        setSchoolName(JSON.parse(saved).schoolName)
      } catch (e) {
        setSchoolName('')
      }
    } else {
      setSchoolName('')
    }
  }

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

  // 활성 프로필 정보
  const activeProfile = profiles.find((p) => p.id === userId)
  const profileLabel = activeProfile ? activeProfile.label : 'Only Me'
  const profileGradient = activeProfile ? activeProfile.colorClass : 'from-blue-500 to-indigo-650'

  // 사용자 미선택 시 프로필 선택 화면 표시
  if (!userId) {
    return <UserSelect onSelect={selectUser} />
  }

  return (
    <div className="min-h-screen pb-24 transition-colors duration-200 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      {/* header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/60 nav-blur">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-black tracking-tight">🧠 MIND Diet</Link>
          <div className="flex items-center gap-2">
            {/* 학교 설정 단추 */}
            <button
              onClick={() => setSchoolModalOpen(true)}
              className="px-2.5 py-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 flex items-center gap-1.5 border border-gray-200/40 dark:border-gray-800"
            >
              <School size={16} />
              <span className="text-[10px] font-bold truncate max-w-[75px]">
                {schoolName ? schoolName.replace('고등학교', '고').replace('중학교', '중').replace('초등학교', '초') : '학교 등록'}
              </span>
            </button>

            {/* 다크 모드 */}
            <button onClick={toggleTheme} className="p-1.5 text-gray-500 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-400 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* 프로필 라벨 */}
            <span className={`text-[10px] font-extrabold text-white bg-gradient-to-r ${profileGradient} px-2.5 py-1 rounded-full shadow-sm`}>
              {profileLabel}
            </span>

            {/* 로그아웃 */}
            <button onClick={logout} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850">
              <LogOut size={16} />
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200/50 dark:border-gray-800/80 nav-blur pb-env">
        <div className="max-w-lg mx-auto grid grid-cols-4">
          <Link to="/" className={`flex flex-col items-center gap-0.5 py-3 transition-all ${location.pathname === '/' ? 'text-blue-600 dark:text-blue-400 scale-105' : 'text-gray-400 dark:text-gray-500 hover:text-gray-650'}`}>
            <Home size={22} strokeWidth={location.pathname === '/' ? 2.8 : 2.0} />
            <span className="text-[10px] font-black">홈</span>
          </Link>
          <Link to="/log" className={`flex flex-col items-center gap-0.5 py-3 transition-all ${location.pathname === '/log' ? 'text-blue-600 dark:text-blue-400 scale-105' : 'text-gray-400 dark:text-gray-500 hover:text-gray-650'}`}>
            <PlusCircle size={22} strokeWidth={location.pathname === '/log' ? 2.8 : 2.0} />
            <span className="text-[10px] font-black">기록</span>
          </Link>
          <Link to="/report" className={`flex flex-col items-center gap-0.5 py-3 transition-all ${location.pathname === '/report' ? 'text-blue-600 dark:text-blue-400 scale-105' : 'text-gray-400 dark:text-gray-500 hover:text-gray-650'}`}>
            <BarChart3 size={22} strokeWidth={location.pathname === '/report' ? 2.8 : 2.0} />
            <span className="text-[10px] font-black">리포트</span>
          </Link>
          <Link to="/info" className={`flex flex-col items-center gap-0.5 py-3 transition-all ${location.pathname === '/info' ? 'text-blue-600 dark:text-blue-400 scale-105' : 'text-gray-400 dark:text-gray-500 hover:text-gray-650'}`}>
            <BookOpen size={22} strokeWidth={location.pathname === '/info' ? 2.8 : 2.0} />
            <span className="text-[10px] font-black">가이드</span>
          </Link>
        </div>
      </nav>

      {/* 학교 검색 설정 모달 */}
      {schoolModalOpen && (
        <SchoolSettingModal
          onClose={() => setSchoolModalOpen(false)}
          onSaved={updateSchoolName}
        />
      )}
    </div>
  )
}

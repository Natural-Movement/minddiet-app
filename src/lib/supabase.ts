// Supabase 연결 설정 파일
// Supabase = 우리 앱의 데이터를 저장해주는 온라인 데이터베이스 서비스
// 식단 기록을 저장하고 불러올 때 이걸 통해서 통신해요

import { createClient } from '@supabase/supabase-js'

// .env 파일에서 주소와 비밀키를 가져옴
// 이걸 직접 코드에 안 쓰는 이유: 비밀키가 노출되면 위험하니까!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasValidConfig =
  typeof supabaseUrl === 'string' &&
  typeof supabaseAnonKey === 'string' &&
  /^https?:\/\//.test(supabaseUrl) &&
  !supabaseUrl.includes('여기에_나중에') &&
  !supabaseAnonKey.includes('여기에_나중에')

// 설정이 없거나 placeholder면 앱이 죽지 않게 null로 두고 저장 시점에 안내
export const supabase = hasValidConfig ? createClient(supabaseUrl, supabaseAnonKey) : null

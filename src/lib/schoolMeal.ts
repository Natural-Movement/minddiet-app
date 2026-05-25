const MEAL_API_URL = 'https://open.neis.go.kr/hub/mealServiceDietInfo'
const SCHOOL_API_URL = 'https://open.neis.go.kr/hub/schoolInfo'

// 디폴트 학교 정보 (전주영생고등학교)
const DEFAULT_OFFICE_CODE = 'P10' // 전북특별자치도교육청 (실제 데이터에 맞게 P10으로 정정)
const DEFAULT_SCHOOL_CODE = '8321102' // 전주영생고등학교 (실제 코드 8321102로 정정)

export interface SchoolInfo {
  officeCode: string
  schoolCode: string
  schoolName: string
  location: string
}

export interface SchoolMeal {
  found: boolean
  mealName?: string
  menu?: string
  message?: string
}

function toApiDate(dateString: string) {
  return dateString.replaceAll('-', '')
}

function parseMealXml(xmlText: string): SchoolMeal {
  const parser = new DOMParser()
  const xml = parser.parseFromString(xmlText, 'application/xml')

  if (xml.querySelector('parsererror')) {
    throw new Error('급식 데이터를 해석하지 못했습니다.')
  }

  const resultMessage = xml.querySelector('RESULT > MESSAGE')?.textContent?.trim()
  const row = xml.querySelector('row')

  if (!row) {
    return {
      found: false,
      message: resultMessage || '해당 날짜에 등록된 점심 급식정보가 없습니다.',
    }
  }

  return {
    found: true,
    mealName: row.querySelector('MMEAL_SC_NM')?.textContent?.trim() || '중식',
    menu: row.querySelector('DDISH_NM')?.textContent?.trim() || '',
  }
}

// 1. 급식 데이터 조회
export async function fetchSchoolMeal(dateString: string): Promise<SchoolMeal> {
  // 로컬 스토리지에서 선택된 학교 정보를 로드
  const savedSchoolStr = localStorage.getItem('mind_school_info')
  let officeCode = DEFAULT_OFFICE_CODE
  let schoolCode = DEFAULT_SCHOOL_CODE

  if (savedSchoolStr) {
    try {
      const savedSchool: SchoolInfo = JSON.parse(savedSchoolStr)
      officeCode = savedSchool.officeCode
      schoolCode = savedSchool.schoolCode
    } catch (e) {
      console.error('Failed to parse saved school info', e)
    }
  }

  const url = new URL(MEAL_API_URL)
  url.searchParams.set('ATPT_OFCDC_SC_CODE', officeCode)
  url.searchParams.set('SD_SCHUL_CODE', schoolCode)
  url.searchParams.set('MLSV_YMD', toApiDate(dateString))

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error('급식정보 서버에 연결하지 못했습니다.')
  }

  return parseMealXml(await response.text())
}

// 2. NEIS API 학교 검색 함수 추가
export async function searchSchool(schoolName: string): Promise<SchoolInfo[]> {
  if (!schoolName.trim()) return []

  const url = new URL(SCHOOL_API_URL)
  url.searchParams.set('Type', 'json')
  url.searchParams.set('pIndex', '1')
  url.searchParams.set('pSize', '20')
  url.searchParams.set('SCHUL_NM', schoolName)

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error('학교 정보를 검색하는 도중 서버 오류가 발생했습니다.')
  }

  const data = await response.json()
  if (data.RESULT && data.RESULT.CODE !== 'INFO-000') {
    return []
  }

  const schoolInfo = data.schoolInfo
  if (!schoolInfo || schoolInfo.length < 2 || !schoolInfo[1].row) {
    return []
  }

  return schoolInfo[1].row.map((row: any) => ({
    officeCode: row.ATPT_OFCDC_SC_CODE,
    schoolCode: row.SD_SCHUL_CODE,
    schoolName: row.SCHUL_NM,
    location: row.LCTN_SC_NM,
  }))
}

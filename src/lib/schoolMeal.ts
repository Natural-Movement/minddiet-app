const API_URL = 'https://open.neis.go.kr/hub/mealServiceDietInfo'
const OFFICE_CODE = 'M10'
const SCHOOL_CODE = '8031016'

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

export async function fetchSchoolMeal(dateString: string): Promise<SchoolMeal> {
  const url = new URL(API_URL)
  url.searchParams.set('ATPT_OFCDC_SC_CODE', OFFICE_CODE)
  url.searchParams.set('SD_SCHUL_CODE', SCHOOL_CODE)
  url.searchParams.set('MLSV_YMD', toApiDate(dateString))

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error('급식정보 서버에 연결하지 못했습니다.')
  }

  return parseMealXml(await response.text())
}

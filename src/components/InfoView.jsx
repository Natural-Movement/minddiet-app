// 마인드 다이어트 인포그래픽 화면
// 이모지 + 색상 카드로 마인드 다이어트를 쉽게 설명해요

export default function InfoView() {
  return (
    <section className="space-y-6">

      {/* ===== 타이틀 카드 ===== */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center">
        <p className="text-5xl mb-3">🧠</p>
        <h2 className="text-2xl font-extrabold mb-2">MIND 다이어트란?</h2>
        <p className="text-base opacity-90 leading-relaxed">
          <strong>M</strong>editerranean-<strong>D</strong>ASH
          <strong> I</strong>ntervention for
          <strong> N</strong>eurodegenerative
          <strong> D</strong>elay
        </p>
        <p className="text-base opacity-90 mt-2 leading-relaxed">
          지중해식 + DASH 식단을 결합하여<br/>
          <strong>뇌 건강</strong>에 특화된 식단법이에요
        </p>
      </div>

      {/* ===== 핵심 수치 ===== */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
          <p className="text-4xl font-extrabold text-green-600">53%</p>
          <p className="text-sm font-semibold text-green-800 mt-1">
            알츠하이머 위험 감소<br/>(엄격히 준수 시)
          </p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-4xl font-extrabold text-amber-500">35%</p>
          <p className="text-sm font-semibold text-amber-800 mt-1">
            알츠하이머 위험 감소<br/>(적당히 준수 시)
          </p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-4xl font-extrabold text-blue-600">7.5년</p>
          <p className="text-sm font-semibold text-blue-800 mt-1">
            인지 노화 지연 효과<br/>(최상위 그룹 기준)
          </p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 text-center">
          <p className="text-4xl font-extrabold text-purple-600">15점</p>
          <p className="text-sm font-semibold text-purple-800 mt-1">
            MIND 점수 만점<br/>(15개 식품 항목)
          </p>
        </div>
      </div>

      {/* ===== 출처 ===== */}
      <p className="text-xs text-gray-400 text-center">
        출처: Rush University, Morris et al. (2015) Alzheimer's & Dementia
      </p>

      {/* ===== 권장 식품 10종 ===== */}
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
        <h3 className="text-xl font-bold text-green-800 mb-1">✅ 뇌를 지키는 10가지 식품</h3>
        <p className="text-sm text-green-700 mb-4">많이 먹을수록 좋아요</p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🥬</span>
            <div>
              <p className="text-base font-bold text-green-900">녹색 잎채소 — 주 6회 이상</p>
              <p className="text-sm text-green-700">시금치, 케일, 상추 등. 엽산, 비타민E, 카로티노이드가 뇌세포를 보호해요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🥕</span>
            <div>
              <p className="text-base font-bold text-green-900">기타 채소 — 매일 1회 이상</p>
              <p className="text-sm text-green-700">브로콜리, 당근, 파프리카 등. 항산화 성분이 뇌 염증을 줄여요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🥜</span>
            <div>
              <p className="text-base font-bold text-green-900">견과류 — 주 5회 이상</p>
              <p className="text-sm text-green-700">아몬드, 호두. 비타민E의 보고! 뇌의 산화 스트레스를 막아요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🫐</span>
            <div>
              <p className="text-base font-bold text-green-900">베리류 — 주 2회 이상</p>
              <p className="text-sm text-green-700">블루베리, 딸기. 플라보노이드가 기억력과 학습 능력을 향상시켜요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🫘</span>
            <div>
              <p className="text-base font-bold text-green-900">콩류 — 주 4회 이상</p>
              <p className="text-sm text-green-700">두부, 렌틸콩, 검은콩. 식물성 단백질과 식이섬유가 풍부해요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🌾</span>
            <div>
              <p className="text-base font-bold text-green-900">통곡물 — 하루 3회 (주 21회)</p>
              <p className="text-sm text-green-700">현미, 귀리, 통밀빵. 뇌의 주 에너지원을 안정적으로 공급해요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🐟</span>
            <div>
              <p className="text-base font-bold text-green-900">생선 — 주 1회 이상</p>
              <p className="text-sm text-green-700">연어, 고등어. 오메가-3가 뇌세포막을 건강하게 유지해요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🍗</span>
            <div>
              <p className="text-base font-bold text-green-900">가금류 — 주 2회 이상</p>
              <p className="text-sm text-green-700">닭, 오리, 칠면조. 붉은 고기 대신 저지방 단백질 공급원이에요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🫒</span>
            <div>
              <p className="text-base font-bold text-green-900">올리브유 — 주요 오일로 사용</p>
              <p className="text-sm text-green-700">단일불포화지방산이 뇌 혈관을 건강하게 유지해요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🍷</span>
            <div>
              <p className="text-base font-bold text-green-900">와인 — 하루 1잔</p>
              <p className="text-sm text-green-700">레드와인의 레스베라트롤이 뇌 보호 효과. 단, 1잔 초과는 역효과!</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 제한 식품 5종 ===== */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
        <h3 className="text-xl font-bold text-red-800 mb-1">⛔ 뇌에 해로운 5가지 식품</h3>
        <p className="text-sm text-red-700 mb-4">적게 먹을수록 좋아요</p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🥩</span>
            <div>
              <p className="text-base font-bold text-red-900">붉은 육류 — 주 4회 미만</p>
              <p className="text-sm text-red-700">소고기, 돼지고기. 포화지방이 뇌 혈관에 부담을 줘요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧈</span>
            <div>
              <p className="text-base font-bold text-red-900">버터/마가린 — 주 7회 미만</p>
              <p className="text-sm text-red-700">포화지방·트랜스지방이 뇌 혈류를 방해하고 베타아밀로이드를 축적시켜요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧀</span>
            <div>
              <p className="text-base font-bold text-red-900">치즈 — 주 1회 미만</p>
              <p className="text-sm text-red-700">고지방 유제품. 포화지방 함량이 높아 뇌 건강에 불리해요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🍰</span>
            <div>
              <p className="text-base font-bold text-red-900">당분/디저트 — 주 5회 미만</p>
              <p className="text-sm text-red-700">케이크, 쿠키, 아이스크림. 혈당 급등이 뇌 염증을 유발해요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🍟</span>
            <div>
              <p className="text-base font-bold text-red-900">튀김/패스트푸드 — 주 1회 미만</p>
              <p className="text-sm text-red-700">트랜스지방이 뇌세포막 기능을 저하시키고 인지 능력을 떨어뜨려요</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 점수 체계 설명 ===== */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5">
        <h3 className="text-xl font-bold text-indigo-800 mb-3">📊 점수는 이렇게 매겨요</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-14 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold text-lg">1점</span>
            <p className="text-base text-indigo-900">주간 목표를 <strong>완전히 달성</strong>했을 때</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-14 h-10 rounded-lg bg-amber-400 flex items-center justify-center text-white font-bold text-lg">0.5</span>
            <p className="text-base text-indigo-900">목표에 <strong>절반 정도</strong> 달성했을 때</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-14 h-10 rounded-lg bg-red-400 flex items-center justify-center text-white font-bold text-lg">0점</span>
            <p className="text-base text-indigo-900">목표에 <strong>많이 못 미칠</strong> 때</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded-xl border border-indigo-100">
          <p className="text-base text-indigo-900 leading-relaxed">
            15개 항목 × 최대 1점 = <strong>총 15점 만점</strong><br/>
            주간 식사 기록을 기반으로 자동 계산돼요!
          </p>
        </div>
      </div>

      {/* ===== 점수 해석 ===== */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-3">🎯 내 점수는 어느 수준?</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-base font-bold text-green-800">12~15점: 최상위</p>
              <p className="text-sm text-green-700">알츠하이머 위험 최대 53% 감소</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-2xl">💪</span>
            <div>
              <p className="text-base font-bold text-blue-800">8~11점: 우수</p>
              <p className="text-sm text-blue-700">알츠하이머 위험 약 35% 감소</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
            <span className="text-2xl">📈</span>
            <div>
              <p className="text-base font-bold text-amber-800">4~7점: 보통</p>
              <p className="text-sm text-amber-700">조금만 더 노력하면 효과가 커져요</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-base font-bold text-red-800">0~3점: 개선 필요</p>
              <p className="text-sm text-red-700">작은 변화부터 시작해봐요!</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 팁 ===== */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
        <h3 className="text-xl font-bold text-yellow-800 mb-3">💡 실천 팁</h3>
        <div className="space-y-2 text-base text-yellow-900 leading-relaxed">
          <p>🥗 매 끼니 채소 한 종류 이상 포함하기</p>
          <p>🫐 간식을 과자 대신 견과류·베리류로 바꾸기</p>
          <p>🫒 조리할 때 버터 대신 올리브유 사용하기</p>
          <p>🐟 주 1회는 생선 요리 먹기</p>
          <p>🌾 흰 쌀밥 대신 현미밥이나 잡곡밥 선택하기</p>
          <p>📱 이 앱으로 매일 기록하면서 습관 만들기!</p>
        </div>
      </div>

      {/* 하단 여백 */}
      <div className="h-4" />
    </section>
  )
}

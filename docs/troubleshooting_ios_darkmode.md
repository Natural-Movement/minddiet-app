# 개발자 노트: iOS PWA 다크 모드 상단(Status Bar) 흰색 여백 문제 해결기

## 🚨 문제 현상
- 앱에 다크 모드를 적용하고 iOS (iPhone) Safari 및 PWA(홈 화면에 추가)로 실행했을 때, 화면 최상단의 상태바(Status Bar) 영역과 Safe Area 뒷배경이 다크 모드로 전환되지 않고 **흰색으로 남는 현상** 발생.
- 안드로이드에서는 정상적으로 다크 모드가 작동함.

## 🔍 원인 분석 및 시행착오

### 1차 시도: `theme-color` 메타 태그 동적 변경 & `html` 배경색 적용
- **가설**: iOS는 상단 바 색상을 `<meta name="theme-color">`와 `<html>`의 배경색을 참조하여 결정한다.
- **적용**: 자바스크립트로 `theme-color`를 변경하고, Tailwind CSS로 `html { @apply bg-gray-50 dark:bg-gray-900; }` 적용.
- **결과**: **실패.** 상단이 여전히 흰색으로 출력됨. 
- **실패 원인**: Tailwind CSS v4에서 `html` 태그 자체에 `.dark` 클래스를 토글할 때, 내부적으로 `@apply dark:bg-gray-900`가 `html.dark`가 아닌 `.dark html`(조상 요소 탐색)로 컴파일되는 고질적인 이슈가 있어 실제로는 배경색이 안 들어감.

### 2차 시도: `viewport-fit=cover` 및 `safe-area-inset` 적용
- **가설**: iOS 노치 디자인 때문에 웹 콘텐츠가 Safe Area까지만 확장되고, 그 위쪽은 브라우저 기본색(흰색)으로 채워진다.
- **적용**: `<meta name="viewport" content="... viewport-fit=cover">` 추가 및 `body`에 `env(safe-area-inset-top)` 패딩 추가.
- **결과**: **실패.** 콘텐츠는 위로 확장되었으나 바탕(html)이 여전히 흰색이어서 패딩 영역이 희게 보임. Service Worker 캐시(v2) 갱신도 했으나 변화 없음.

### 3차 시도: 네이티브 미디어 쿼리(`color-scheme`) 적용
- **가설**: 사파리가 네이티브하게 다크모드를 인식하도록 `media="(prefers-color-scheme: dark)"` 속성을 가진 `theme-color` 2개를 배치.
- **적용**: `<meta name="color-scheme" content="light dark" />` 및 2개의 `theme-color` 배치.
- **결과**: **실패.**
- **실패 원인**: 앱 내에 **수동 다크 모드 토글 스위치**가 존재함. 시스템은 라이트 모드인데 앱만 다크 모드일 경우, JS가 첫 번째 메타 태그만 건드리게 되어 상태가 꼬임. Safari 캐시도 매우 강력하여 새로고침이 제대로 되지 않음.

---

## ✅ 최종 해결책 (The Bulletproof Solution)

수동 토글이 있는 PWA에서 iOS 상단바 색상을 완벽하게 제어하려면 다음 3가지가 반드시 조화를 이루어야 합니다.

### 1. 순수 CSS를 이용한 강제 배경색 지정 (Tailwind 버그 우회)
Tailwind의 `@apply`에 의존하지 않고, `.dark` 클래스가 붙었을 때 `html`과 `body`의 배경색을 `!important`로 하드코딩합니다.
```css
/* index.css */
html, body, #root { background-color: #f9fafb !important; }
html.dark, html.dark body, html.dark #root { background-color: #111827 !important; }
```

### 2. JS에서 Inline Style로 배경색 2중 강제 주입
CSS 우선순위 문제나 지연 렌더링을 막기 위해, 다크모드 토글 시 JS에서 `document.documentElement`의 `style.backgroundColor`를 직접 변경합니다.
```javascript
// App.tsx
document.documentElement.style.backgroundColor = '#111827'
document.body.style.backgroundColor = '#111827'
```

### 3. 단일 `theme-color` 메타 태그 사용 및 JS 동기화
미디어 쿼리를 제거하고 단일 `<meta id="theme-color-meta">`를 둔 뒤, 토글 스위치가 바뀔 때 JS가 이를 정확히 업데이트하도록 합니다.

### 4. 강력한 Safari/PWA 캐시 우회
서비스 워커(`sw.js`) 캐시 버전을 올리더라도 iOS Safari는 기존 캐시를 고집하는 경향이 있습니다.
- **캐시 뚫기 팁**: 주소창의 **[aA]**를 눌러 **[데스크탑 웹사이트 요청]**을 실행하면 Safari가 캐시를 무시하고 페이지를 강제로 새로 받아옵니다. 그 후 다시 모바일로 돌리면 업데이트된 코드가 적용됩니다.

## 💡 교훈 (Lessons Learned)
1. **PWA 최상위 배경색**: TailwindCSS 사용 시 루트 요소(`html`)의 다크모드 배경은 프레임워크에 의존하지 말고 **순수 CSS 하드코딩**이 제일 안전하다.
2. **수동 테마 토글**: 시스템 연동과 수동 토글이 혼재할 때는, HTML 미디어 쿼리 대신 **단일 메타 태그 + JS 제어**가 충돌을 막는다.
3. **iOS 캐시**: 코드를 고쳐도 iOS 기기에서 변화가 없다면 높은 확률로 Service Worker나 Safari의 강력한 캐시 때문이다. "데스크탑 웹사이트 요청" 신공을 적극 활용하자.

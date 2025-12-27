# Foody (푸디) - AI 기반 식단 분석 및 커뮤니티 플랫폼

![Foody Logo](./github_asset/img/foody_logo.png)

### 프로젝트 기간
2025.12.01 ~ 2025.12.25

### 팀원
- 박정훈
- 유주경

## 📖 프로젝트 소개
**Foody**는 사용자의 식단을 AI로 분석하여 영양 정보를 제공하고, 이를 기반으로 건강 관리를 돕는 **AI 식단 분석 서비스**입니다.

사용자는 총 세 가지의 방법(DB 음식, 직접 입력, 이미지 분석)을 통해 식단을 등록할 수 있습니다.
Vision-Language Model (VLM)을 활용하여 음식 이미지를 자동 인식하고, 칼로리 및 영양소를 분석합니다. 사용자는 분석된 레포트를 바탕으로 식단을 기록하고, 커뮤니티를 통해 다른 유저들과 식단 정보를 공유할 수 있습니다.

---

## 🏗️ 전체 아키텍처 (Architecture)

Foody는 크게 세 가지의 서버로 구성되어 있습니다.
각 서버의 상세 설정 및 구조는 각 레포지토리의 README를 참고하세요.

### 1. [🧠 Foody-AI (AI 분석 서버)](https://github.com/SSAFY-Foody/Foody-AI)
- **역할**: 음식 이미지 인식 및 식단 분석
- **핵심 기술**: Vision-Language Model (VLM), PyTorch

### 2. [🛡️ Foody-Backend (API 서버)](https://github.com/SSAFY-Foody/Foody-Backend)
- **역할**: 사용자 인증/인가, 데이터 관리(CRUD), 커뮤니티 기능, AI 서버 통신, 데이터베이스 통신
- **핵심 기술**: Spring Boot 3, MyBatis, MySQL, JWT, REST API, WebSocket, OAuth2.0

### 3. [🎨 Foody-Frontend (웹 클라이언트)](https://github.com/SSAFY-Foody/Foody-Frontend)
- **역할**: 사용자 인터페이스(UI), 식단 시각화, 커뮤니티 상호작용
- **핵심 기술**: Vue.js 3, Vite, TypeScript, TailwindCSS, Pinia

---

## ✨ 주요 기능
1.  **📸 AI 음식 이미지 분석**: 음식 이미지를 등록하고 분석 요청을 하면 AI가 음식 종류와 영양소를 자동으로 분석합니다.
2.  **📝 AI 식단 분석**: 식단을 등록하고 분석 요청을 하면 AI가 식단에 대한 분석 결과를 생성합니다.
3.  **📊 영양 리포트**: 섭취한 칼로리, 탄단지 비율을 시각적인 그래프로 제공합니다.
4.  **🤝 식단 커뮤니티**: 나의 식단 리포트를 공유하고, 다른 유저들과 소통(댓글)할 수 있습니다.
5.  **📚 푸디 도감**: 다양한 음식 캐릭터를 수집하고 도감을 채워나가는 재미 요소를 제공합니다.
6.  **🔐 회원 관리**: JWT 기반의 안전한 로그인 및 회원가입, 마이페이지 기능을 제공합니다.

---

## 시작하기 (Getting Started)

프로젝트를 실행하려면 각 모듈별 설정을 완료해야 합니다. 상세 내용은 아래 링크를 확인하세요.

- **Backend 설정 및 실행**: [Foody-Backend README](https://github.com/SSAFY-Foody/Foody-Backend)
- **Frontend 설정 및 실행**: [Foody-Frontend README](https://github.com/SSAFY-Foody/Foody-Frontend)
- **AI 서버 설정 및 실행**: [Foody-AI README](https://github.com/SSAFY-Foody/Foody-AI)

# Foody-Frontend

## 🎨 Frontend Architecture
**Foody-Frontend**는 Vue.js 3와 Vite를 사용한 SPA(Single Page Application)로, 직관적인 UI/UX와 빠른 성능을 제공합니다.

### 핵심 기술
- **Vue.js 3** (Composition API)
- **Vite**: 빌드 도구
- **TypeScript**: 정적 타입 지원
- **TailwindCSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Pinia**: 상태 관리 라이브러리

---

## ⚙️ 설정 (Setup)

### 1. 환경 변수 (.env)
루트 디렉토리에 `.env` 파일을 생성하고 필요한 환경 변수를 설정하세요.
```properties
VITE_API_BASE_URL=http://localhost:8080/api
```

### 2. 의존성 설치
```bash
npm install
```

---

## 🚀 실행 방법 (Run)

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 📂 디렉토리 구조 (Directory Structure)
```
src/
├── api/           # 백엔드 API 통신 모듈 (Axios 인스턴스 등)
├── assets/        # 정적 리소스 (이미지, 폰트)
├── components/    # 재사용 가능한 UI 컴포넌트 (Navbar, Modal 등)
├── router/        # Vue Router 라우팅 설정
├── stores/        # Pinia 상태 관리 스토어
├── types/         # TypeScript 인터페이스 및 타입 정의
├── utils/         # 공통 유틸리티 함수 (에러 핸들링, 포맷팅)
└── views/         # 페이지 단위 뷰 컴포넌트
```

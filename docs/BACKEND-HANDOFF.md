# 백엔드 개발자 전달 사항

> 작성일: 2026-02-15
> 프론트엔드 개발 진행 상황 및 백엔드 협업 필요 사항

---

## 📊 요약

| 구분 | 현황 | 비고 |
|------|------|------|
| **프론트 완료도** | 70-80% | 백엔드 의존 항목 제외 |
| **정상 작동 API** | 94개 (50.3%) | 즉시 연동 가능 🟩 |
| **백엔드 미작업** | 10개 (8.6%) | 작업 필요 ⚪️ |
| **확인 필요 사항** | 11건 | 필드/타입 확정 필요 🟡 |

---

## 🔴 긴급: 백엔드 미작업 API (10개)

### 프론트엔드가 **지금 작업할 수 없는** 기능들

| 순번 | API | 현황 | 우선순위 | 영향 범위 |
|------|-----|------|----------|-----------|
| 1 | **날씨 API** | URL 없음 ⚪️ | 🔴 높음 | 대시보드 위젯 |
| 2 | **배너 API** | URL 없음 ⚪️ | 🔴 높음 | 대시보드 배너 |
| 3 | **전체 엑셀 생성** | URL 없음 ⚪️ | 🟡 중간 | 통합 다운로드 |
| 4 | **현재 비밀번호 확인** | URL 없음 ⚪️ | 🔴 높음 | 마이페이지 |
| 5 | **아이디 찾기** | `/users/find_username/` ⚪️ | 🔴 높음 | 로그인 화면 |
| 6 | **이메일 변경** | `/users/set_my_email/` ⚪️ | 🟡 중간 | 마이페이지 |
| 7 | **비밀번호 변경** | `/users/set_my_password/` ⚪️ | 🔴 높음 | 마이페이지 |
| 8 | **휴대전화 변경** | `/users/set_phone/` ⚪️ | 🟡 중간 | 마이페이지 |
| 9 | **알림 읽음 처리** | `/posts/alarm_is_read/` ⚪️ | 🟡 중간 | 알림 시스템 |
| 10 | **알림 전송** | 미정 ⚪️ | 🔴 높음 | 교육/회의 알림 |

### 상세 설명

#### 1-2. 대시보드 위젯 (날씨, 배너)
```
현황: API 엔드포인트 자체가 없음
요청:
  - GET /dashboard/weather (날씨 정보)
  - GET /dashboard/banners (배너 목록)
영향: 대시보드 화면 완성 불가
```

#### 4-8. 마이페이지 (사용자 정보 수정)
```
현황: URL은 정의되어 있으나 백엔드 미구현
요청: 우선순위 순서로 구현
  1. 비밀번호 변경 (필수)
  2. 현재 비밀번호 확인 (필수)
  3. 아이디 찾기 (필수)
  4. 이메일/휴대전화 변경 (중요도 중)
영향: 마이페이지 핵심 기능 동작 불가
```

#### 10. 알림 전송
```
현황: 방식 미결정 (카카오톡 vs 앱푸시)
요청:
  - 알림 전송 방식 결정
  - API 스펙 정의
  - POST /notification/send
영향: 교육/회의 참석자 알림 발송 불가
```

---

## 🟡 확인 필요: 백엔드 응답 필드 미확정 (11건)

### 프론트엔드에서 **주석 처리**된 필드들

#### 1. 공지사항 API
**파일**: `src/api/08_NoticeBoard/noticeList.api.ts`

```typescript
// 현재 주석 처리됨
// user_name?: string    // 작성자
// view_count?: number   // 조회수
```

**질문**:
- Q1: `user_name` 필드를 응답에 포함할 예정인가요?
- Q2: `view_count` 필드를 응답에 포함할 예정인가요?

**프론트 대응**:
- 현재: optional 타입으로 처리, UI에서 미표시
- 필요 시: 필드 확정 후 required로 변경 및 UI 추가

---

#### 2. 안전작업허가 API
**파일**: `src/api/06_SafetyWorkPermit/safetyWorkPermit.api.ts`

```typescript
// 현재 주석 처리됨
// approval_status?: string  // 결재 상태
// user_name?: string        // 작성자
```

**질문**:
- Q3: 결재 상태(`approval_status`) 필드 포함 여부?
- Q4: 작성자(`user_name`) 필드 포함 여부?

---

#### 3. 협력사 평가 API
**파일**: `src/api/09_SupplyChainManagement/evaluation.api.ts`

```typescript
// 현재 주석 처리됨
// evaluator?: string  // 평가자
```

**질문**:
- Q5: 평가자(`evaluator`) 필드 포함 여부?

---

#### 4. 도급협의체 API
**파일**: `src/api/09_SupplyChainManagement/committee.api.ts`

```typescript
// 현재 주석 처리됨
// user_name?: string   // 작성자
// photofile?: string   // 사진 파일
```

**질문**:
- Q6: 작성자(`user_name`) 필드 포함 여부?
- Q7: 사진 파일(`photofile`) 필드 포함 여부?

---

#### 5. 조직도 API - 타입 코드 매핑
**파일**: `src/pages/BusinessManagement/Organization.tsx`

```typescript
// 프론트에서 추정한 매핑
position: number
// 0: 경영책임자
// 1: 안전보건관리책임자
// 2: 안전관리자
// 3: 보건관리자
// 4: 관리감독자
// 5: 해당없음 (?)
```

**질문**:
- Q8: `position` 값 0-5의 정확한 의미가 맞나요?
- Q9: 5번이 "해당없음"이 맞나요?

---

#### 6. 현장점검 타입 매핑
**파일**: `src/api/09_SupplyChainManagement/siteAudit.api.ts`

```typescript
// 프론트에서 추정한 매핑
type: number
// 0: 정기점검
// 1: 수시점검
// 2: 특별점검
// 3: 합동점검
// 4: 기타

result: number
// 0: 양호
// 1: 불량
// 2: 개선필요
// 3: 해당없음
```

**질문**:
- Q10: `type`과 `result` 값의 매핑이 맞나요?

---

#### 7. 안전교육 API - 필드명 오탈자
**파일**: `src/api/03_SafetyEducation/education.api.ts`

```typescript
// 🔴 오탈자 발견
rist_title?: string  // 현재 응답
// risk_title로 변경 필요
```

**질문**:
- Q11: `rist_title` → `risk_title`로 수정 가능한가요?

**우선순위**: 🔴 높음 (오탈자)

---

#### 8. 조직도 이미지 조회 API
**파일**: `src/pages/BusinessManagement/Organization.tsx`

```
현황: 업로드 API만 있고 조회 API 없음
요청: GET /organization/image (조직도 이미지 URL 반환)
영향: 조직도 이미지 업로드 후 다시 볼 수 없음
```

---

#### 9. 선임신고서 파일 필드
**파일**: `src/pages/BusinessManagement/Organization.tsx`

```
현황: 선임신고서 파일 필드가 API 응답에 없음
요청: appointment_certificate 필드 추가
영향: 선임신고서 다운로드 불가
```

---

## ✅ 프론트엔드 완료 사항

### 1. 독립 작업 완료 (백엔드 무관)

#### ✅ 에러 처리 시스템
- [x] 글로벌 에러 핸들러
- [x] Toast 알림 시스템 (react-hot-toast)
- [x] Logger 시스템 (개발/프로덕션 분리)
- [x] 사용자 친화적 에러 메시지

#### ✅ 재사용 컴포넌트
- [x] FileUpload (파일 검증, 프로그레스)
- [x] FileDownload (다운로드 헬퍼)
- [x] Skeleton 로더 (6가지 타입)
- [x] Button 로딩 상태
- [x] Toast Provider

#### ✅ 유틸리티 함수
- [x] 폼 검증 (15+ 함수)
- [x] 날짜 처리 (20+ 함수)
- [x] 에러 처리 헬퍼
- [x] 로거 헬퍼

#### ✅ 타입 정의
- [x] Enum 타입 (10개 enum)
- [x] 백엔드 미확정 필드 타입
- [x] API 응답 타입
- [x] DTO 타입

#### ✅ 코드 품질
- [x] ESLint 설정
- [x] Prettier 설정
- [x] TODO 주석 표준화
- [x] 코드 중복 제거

---

### 2. API 연동 준비 완료

#### ✅ Axios 인터셉터
```typescript
// 자동 토큰 첨부
config.headers["Authorization"] = `Token ${token}`

// 자동 에러 처리
if (status === 401) {
  logout()
  redirect('/login')
}
```

#### ✅ BaseApi 클래스
```typescript
class BaseApi {
  get<T>()          // GET 요청
  post<T>()         // POST 요청
  put<T>()          // PUT 요청
  delete<T>()       // DELETE 요청
  getPaginated<T>() // 페이지네이션
  uploadFile<T>()   // 파일 업로드
  downloadFile()    // 파일 다운로드
}
```

#### ✅ 에러 처리 자동화
```typescript
try {
  const data = await api.get('/some-endpoint')
} catch (error) {
  // 자동으로 Toast 표시
  showErrorToast(error)
}
```

---

## 🎯 백엔드 작업 우선순위

### Phase 1: 긴급 (1주 내)
```
1. 아이디 찾기 API
2. 비밀번호 변경 API
3. 현재 비밀번호 확인 API
4. 날씨 API
5. 배너 API
```

**이유**: 기본 사용자 기능, 대시보드 완성

---

### Phase 2: 중요 (2주 내)
```
6. 알림 전송 API (방식 결정 필요)
7. 조직도 이미지 조회 API
8. 선임신고서 필드 추가
9. 필드명 오탈자 수정 (rist → risk)
```

**이유**: 핵심 기능 완성

---

### Phase 3: 개선 (3주 내)
```
10. 전체 엑셀 생성 API
11. 이메일/휴대전화 변경 API
12. 응답 필드 확정 (11건)
```

**이유**: 부가 기능, 데이터 완성도

---

## 📋 백엔드 개발 가이드

### API 응답 형식 (표준)

```json
{
  "code": 200,
  "msg": "성공",
  "data": { /* 실제 데이터 */ }
}
```

### 필수 헤더
```
Authorization: Token {token}
Content-Type: application/x-www-form-urlencoded
```

### 에러 응답 형식
```json
{
  "code": 400,
  "msg": "에러 메시지",
  "error_code": "VALIDATION_ERROR"
}
```

---

## 🧪 테스트 방법

### 1. Postman 컬렉션 사용
```
파일: api-spec.json
위치: 프로젝트 루트
```

### 2. 프론트 개발 서버 연동
```bash
# 프론트 서버 실행
npm run dev

# 접속: http://localhost:5174
```

### 3. API 테스트 순서
```
1. 로그인 API → 토큰 받기
2. 토큰으로 다른 API 테스트
3. 에러 케이스 테스트
4. 응답 형식 확인
```

---

## 📞 협업 프로세스

### 1. API 개발 전
```
1. 백엔드: API 스펙 확정
2. Postman 업데이트
3. 프론트: 타입 정의 작성
```

### 2. API 개발 중
```
1. 백엔드: 개발 서버 배포
2. 프론트: 연동 테스트
3. 이슈 발견 시 즉시 공유
```

### 3. API 완료 후
```
1. 백엔드: Postman에 응답 예시 추가
2. 프론트: 프로덕션 연동
3. 통합 테스트
```

---

## 🐛 현재 알려진 이슈

### 1. 필드명 오탈자
```
API: /posts/education_list/
필드: rist_title
수정: risk_title
우선순위: 🔴 높음
```

### 2. Postman 응답 예시 부족
```
현황: 137개 API 중 응답 예시 없음
요청: 주요 API에 응답 예시 추가
목적: 프론트 개발 효율성 향상
```

---

## 📊 API 상태 통계

### Postman 컬렉션 기준

| 상태 | 개수 | 비율 | 설명 |
|------|------|------|------|
| 🟩 정상 | 94개 | 50.3% | 즉시 연동 가능 |
| 🟦 완료 | 4개 | 2.7% | 백엔드 작업 완료 |
| 🟢 OK | 8개 | 5.3% | 문제 없음 |
| ⚪️ 미작업 | 10개 | 8.6% | **작업 필요** |
| 🟡 확인 필요 | 1개 | 0.5% | 스펙 확인 |
| 표기 없음 | 61개 | 32.6% | 피드백 정리 중 |

---

## ✍️ 체크리스트

### 백엔드 팀 작업 사항

- [ ] 미작업 API 10개 우선순위 확인
- [ ] 응답 필드 11건 확정
- [ ] 필드명 오탈자 수정
- [ ] Postman 응답 예시 추가
- [ ] 개발 서버 배포

### 프론트 팀 대기 사항

- [ ] 미작업 API 완료 대기
- [ ] 필드 확정 후 타입 업데이트
- [ ] API 연동 테스트
- [ ] 통합 테스트

---

## 📞 연락처 및 문의

### 질문/이슈 보고
```
방법: GitHub Issues 또는 Slack
응답: 24시간 내
```

### 긴급 문의
```
우선순위 🔴 항목은 즉시 협의 필요
```

---

## 📎 참고 문서

- `api-spec.json`: Postman 컬렉션
- `docs/TODO-GUIDE.md`: TODO 주석 가이드
- `src/types/backend-pending.ts`: 백엔드 의존 타입
- `src/types/enums.ts`: Enum 정의

---

**작성**: 프론트엔드 팀
**최종 업데이트**: 2026-02-15
**문서 버전**: 1.0

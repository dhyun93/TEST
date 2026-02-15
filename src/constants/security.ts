// 장시간 활동이 없을 경우 자동 로그아웃 처리
// 장시간 활동 없음의 카운트 기준 시간 상수

// AUTO_LOGOUT_TIMEOUT_MS: 장시간 활동 없음 카운트 기준 시간
// AUTO_LOGOUT_COUNTDOWN_THRESHOLD_MS: 시간 표시가 시작되는 남은 시간 기준
// ENABLE_AUTO_LOGOUT_COUNTDOWN: 로그아웃에 카운트 표시되도록할지 여부

export const AUTO_LOGOUT_TIMEOUT_MS = 60 * 60 * 1000 //60분
export const AUTO_LOGOUT_COUNTDOWN_THRESHOLD_MS = 60 * 50 * 100 //5분
export const ENABLE_AUTO_LOGOUT_COUNTDOWN = true

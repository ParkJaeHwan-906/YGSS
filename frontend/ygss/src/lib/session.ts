// src/lib/session.ts

let _sessionId: string | null = null;

/** 현재 세션 ID 가져오기 (없으면 null) */
export function getSessionId(): string | null {
  return _sessionId;
}

/** 서버가 내려준 sid를 메모리에 저장 */
export function setSessionId(sid: string): void {
  _sessionId = sid || null;
}

/** 세션 초기화 (앱 종료 시 자연히 리셋 / 테스트용 수동 리셋) */
export function resetSessionId(): void {
  _sessionId = null;
}

/** 세션이 있으면 경로 끝에 붙여주고, 없으면 base를 그대로 반환 */
export function withSessionPath(basePath: string): string {
  const base = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return _sessionId ? `${base}${_sessionId}` : base;
}
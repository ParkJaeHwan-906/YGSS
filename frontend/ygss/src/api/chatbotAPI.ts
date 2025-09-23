// src/api/chatbotAPI.ts
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * 챗봇에게 메시지를 보내고 응답 문자열을 받아옵니다
 */
export async function sendChatbotMessage(
  message: string,
  accessToken: string
): Promise<string> {
  try {
    const response = await axios.post(
      `${API_URL}/chat/send`,
      { message },
      {
        headers: {
          Authorization: `A103 ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    // 응답에서 메시지 문자열 파싱
    return response.data.message || response.data.response || response.data || '응답을 받을 수 없습니다.';

  } catch (error: any) {
    console.error('챗봇 응답 중 오류 발생:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('응답 시간이 초과되었습니다. 다시 시도해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else {
      throw new Error('죄송해요, 지금 응답할 수 없어요. 다시 시도해주세요.');
    }
  }
}

// ──────────────────────────────────────────────────────────────
// 1) 빠른 단어 목록/타입/판별기
// ──────────────────────────────────────────────────────────────
export const QUICK_WORDS = ['DC', 'DB', 'IRP', '채권', '펀드', 'ETF'] as const;
export type QuickWord = typeof QUICK_WORDS[number];

function normalizeWord(s: string) {
  return s.trim().toUpperCase();
}

export function toQuickWordOrNull(text: string): QuickWord | null {
  const n = normalizeWord(text);
  // 한글은 대소문자 개념이 없으므로 그대로 비교해도 OK
  const hit = QUICK_WORDS.find(w => normalizeWord(w) === n);
  return (hit as QuickWord) ?? null;
}

// ──────────────────────────────────────────────────────────────
// 2) /chat/send/{단어} : GET 호출 (응답이 text/plain 이므로 responseType: 'text')
// ──────────────────────────────────────────────────────────────
export async function sendQuickWord(
  word: QuickWord,
  accessToken: string
): Promise<string> {
  try {
    const url = `${API_URL}/chat/send/${encodeURIComponent(word)}`;
    const res = await axios.get(url, {
      headers: {
        Authorization: `A103 ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      // 서버가 예시처럼 순수 문자열을 보내므로:
      responseType: 'text',
      timeout: 15000, // 보통 즉시 응답이므로 짧게
    });

    // 예시 명세: 성공 시 문자열 그대로
    return res.data as string;
  } catch (error: any) {
    // 예시 명세: 실패 400 등
    if (error.response?.status === 400) {
      throw new Error('처리 중 문제가 발생했어요. 다시 시도해주세요.');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('응답 시간이 초과되었습니다. 다시 시도해주세요.');
    }
    if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    }
    throw new Error('죄송해요, 지금 응답할 수 없어요. 다시 시도해주세요.');
  }
}

// ──────────────────────────────────────────────────────────────
// 3) 스마트 라우팅: 단어면 GET, 아니면 기존 POST 로 보내기
// ──────────────────────────────────────────────────────────────
export async function sendSmartChat(
  message: string,
  accessToken: string
): Promise<string> {
  const quick = toQuickWordOrNull(message);
  if (quick) {
    // 명세의 단어와 정확히 일치하면 GET 우선
    try {
      return await sendQuickWord(quick, accessToken);
    } catch {
      // GET 실패시 기존 POST 로 폴백
      return await sendChatbotMessage(message, accessToken);
    }
  }
  // 단어가 아니면 기존 POST
  return await sendChatbotMessage(message, accessToken);
}
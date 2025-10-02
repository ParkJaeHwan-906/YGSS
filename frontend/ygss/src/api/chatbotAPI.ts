// src/api/chatbotAPI.ts
import axios from 'axios';
import { withSessionPath, setSessionId } from '../lib/session';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// 서버 공통 응답 타입
type ChatRes = {
  sid?: string;
  answer?: string;
  message?: string;
  response?: string;
}
type ChatErr = any;

/** 안전 파서: answer 없으면 message/response로 폴백 */
function pickAnswer(data: ChatRes): string {
  return (
    data?.answer ??
    data?.message ??
    data?.response ??
    '응답을 받을 수 없습니다.'
  );
}

/**
 * 일반 챗봇
 */
export async function sendChatbotMessage(
  message: string,
  accessToken: string
): Promise<string> {
  try {
    const base = `${API_URL}/chat/send/`;
    const url = withSessionPath(base);

    const res = await axios.post<ChatRes>(
      url,
      { message },
      {
        headers: {
          Authorization: `A103 ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    // 세션 Id 동기화
    if (res.data?.sid) {
      setSessionId(res.data.sid);
    }
    return pickAnswer(res.data);
  } catch (error: any) {
    console.error('챗봇 응답 중 오류 발생:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('응답 시간이 초과되었습니다. 다시 시도해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else if (error.response?.status === 400) {
      throw new Error('처리 중 문제가 발생했어요. 다시 시도해주세요.');
    } else {
      throw new Error('죄송해요, 지금 응답할 수 없어요. 다시 시도해주세요.');
    }
  }
}


// 퀵탭 판별
export const QUICK_WORDS = ['DC', 'DB', 'IRP', '채권', '펀드', 'ETF'] as const;
export type QuickWord = typeof QUICK_WORDS[number];

function normalizeWord(s: string) {
  return s.trim().toUpperCase();
}

export function toQuickWordOrNull(text: string): QuickWord | null {
  const n = normalizeWord(text);
  const hit = QUICK_WORDS.find((w) => normalizeWord(w) === n);
  return (hit as QuickWord) ?? null;
}

// 퀵 챗봇
export async function sendQuickWord(
  word: QuickWord,
  accessToken: string
): Promise<string> {
  try {
    const path = `${API_URL}/chat/send/${encodeURIComponent(word)}`;
    const url = withSessionPath(path);

    const res = await axios.get<ChatRes>(url, {
      headers: {
        Authorization: `A103 ${accessToken}`,
        // 서버가 text/plain이 아닌 JSON으로 {sid, answer}를 내려준다는 명세 기준
        'Accept': 'application/json',
      },
      timeout: 15000,
    });

    if (res.data?.sid) setSessionId(res.data.sid);

    return pickAnswer(res.data);
  } catch (error: any) {
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


// 분기 처리
export async function sendBranchMessage(
  message: string,
  accessToken: string
): Promise<string> {
  const quick = toQuickWordOrNull(message);
  if (quick) {
    try {
      return await sendQuickWord(quick, accessToken);
    } catch {
      // GET 실패 시 POST로 폴백
      return await sendChatbotMessage(message, accessToken);
    }
  }
  return await sendChatbotMessage(message, accessToken);
}

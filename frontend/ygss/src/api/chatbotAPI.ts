// src/api/chatbotAPI.ts
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * 챗봇에게 메시지를 보내고 응답 문자열을 받아옵니다
 */
export async function sendChatbotMessage(message: string, accessToken: string): Promise<string> {
  try {
    const response = await axios.get(`${API_URL}/chat/send`, {
      params: {
        message: message
      },
      headers: {
        Authorization: `A103 ${accessToken}`,
      },
      timeout: 30000,
    });

    // 응답에서 메시지 문자열 파싱
    return response.data.message || response.data.response || response.data || '응답을 받을 수 없습니다.';

  } catch (error: any) {
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('응답 시간이 초과되었습니다. 다시 시도해주세요.');
    } else if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    } else {
      throw new Error('죄송해요, 지금 응답할 수 없어요. 다시 시도해주세요.');
    }
  }
}
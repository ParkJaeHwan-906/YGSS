// hooks/useTypingEffect.ts
import { useCallback, useRef } from 'react';
import { useAppDispatch } from '@/src/store/hooks';
import { addMessage, updateMessage, Message } from '@/src/store/slices/chatSlice';

export const useTypingEffect = () => {
  const dispatch = useAppDispatch();
  const typingTimeoutRef = useRef<number | null>(null);

  const typeMessage = useCallback((messageId: string, fullText: string) => {
    let currentIndex = 0;
    
    const typeNextChar = () => {
      if (currentIndex <= fullText.length) {
        dispatch(updateMessage({
          id: messageId,
          updates: { 
            displayText: fullText.slice(0, currentIndex), 
            isTyping: false 
          }
        }));
        currentIndex++;
        
        if (currentIndex <= fullText.length) {
          typingTimeoutRef.current = setTimeout(typeNextChar, 10);
        }
      }
    };
    
    typeNextChar();
  }, [dispatch]);

  // async 함수를 지원하도록 타입 변경
  const addTypingMessage = useCallback(async (userText: string, getBotResponse: (text: string) => Promise<string>) => {
    const now = new Date();
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText.trim(),
      isUser: true,
      timestamp: now.toISOString(),
    };

    // 사용자 메시지 추가
    dispatch(addMessage(userMessage));

    // 봇 타이핑 인디케이터 추가
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      isUser: false,
      timestamp: new Date(now.getTime() + 500).toISOString(),
      isTyping: true,
    };

    setTimeout(() => {
      dispatch(addMessage(typingMessage));
    }, 100);

    // API 즉시 호출
    setTimeout(async () => {
      try {
        const botResponseText = await getBotResponse(userText.trim());
        const botMessage: Message = {
          id: typingMessage.id,
          text: botResponseText,
          isUser: false,
          timestamp: new Date(now.getTime() + 500).toISOString(),
          displayText: '',
          isTyping: false,
        };

        dispatch(updateMessage({
          id: typingMessage.id,
          updates: botMessage
        }));

        // 타이핑 효과 시작
        typeMessage(typingMessage.id, botResponseText);
      } catch (error) {
        // 에러 처리
        const errorMessage = '응답 처리 중 오류가 발생했습니다.';
        const botMessage: Message = {
          id: typingMessage.id,
          text: errorMessage,
          isUser: false,
          timestamp: new Date(now.getTime() + 500).toISOString(),
          displayText: '',
          isTyping: false,
        };

        dispatch(updateMessage({
          id: typingMessage.id,
          updates: botMessage
        }));

        typeMessage(typingMessage.id, errorMessage);
      }
      }, 50); // API 호출을 거의 즉시 시작 (200ms → 50ms)
  }, [dispatch, typeMessage]);

  const cleanup = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  return {
    addTypingMessage,
    cleanup
  };
};
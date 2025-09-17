// hooks/useTypingEffect.ts
import { useCallback, useRef } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  displayText?: string;
}

interface UseTypingEffectProps {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const useTypingEffect = ({ setMessages }: UseTypingEffectProps) => {
  const typingTimeoutRef = useRef<number | null>(null);

  const typeMessage = useCallback((messageId: string, fullText: string) => {
    let currentIndex = 0;
    
    const typeNextChar = () => {
      if (currentIndex <= fullText.length) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, displayText: fullText.slice(0, currentIndex), isTyping: false }
              : msg
          )
        );
        currentIndex++;
        
        if (currentIndex <= fullText.length) {
          typingTimeoutRef.current = setTimeout(typeNextChar, 10); // 50ms마다 한 글자씩
        }
      }
    };
    
    typeNextChar();
  }, [setMessages]);

  const addTypingMessage = useCallback((userText: string, getBotResponse: (text: string) => string) => {
    const now = new Date();
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText.trim(),
      isUser: true,
      timestamp: now,
    };

    // 사용자 메시지 추가
    setMessages(prev => [...prev, userMessage]);

    // 봇 타이핑 인디케이터 추가
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      isUser: false,
      timestamp: new Date(now.getTime() + 500),
      isTyping: true,
    };

    setTimeout(() => {
      setMessages(prev => [...prev, typingMessage]);
    }, 300);

    //0.5초후  타이핑 완료하고 실제 메시지로 교체
    setTimeout(() => {
      const botResponseText = getBotResponse(userText.trim());
      const botMessage: Message = {
        id: typingMessage.id,
        text: botResponseText,
        isUser: false,
        timestamp: new Date(now.getTime() + 500),
        displayText: '',
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === typingMessage.id ? botMessage : msg
        )
      );

      // 타이핑 효과 시작
      typeMessage(typingMessage.id, botResponseText);
    }, 1500);
  }, [setMessages, typeMessage]);

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
// hooks/useChatbot.ts
import { useState } from 'react';

export const useChatbot = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  const openChat = () => {
    setIsChatVisible(true);
  };

  const closeChat = () => {
    setIsChatVisible(false);
  };

  return {
    isChatVisible,
    openChat,
    closeChat,
  };
};
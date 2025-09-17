// components/chatbot/ChatBotScreen.tsx
import { Colors } from '@/src/theme/colors';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import { useTypingEffect } from './useTypingEffect';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  displayText?: string;
}

interface ChatBotScreenProps {
  onClose: () => void;
}

const ChatBotScreen: React.FC<ChatBotScreenProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '안녕하세요! 알키가 도와드릴게요!\n퇴직연금에 대해 무엇이든 물어보세요!',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');

  const { addTypingMessage, cleanup } = useTypingEffect({ setMessages });

  const getBotResponse = (userText: string): string => {
    const lower = userText.toLowerCase();
    if (lower.includes('dc') || lower.includes('확정기여')) {
      return 'DC형(확정기여형)은 회사가 일정 금액을 적립하고, 근로자가 운용하는 방식입니다.';
    }
    if (lower.includes('irp') || lower.includes('개인형')) {
      return 'IRP(개인형퇴직연금)는 개인이 직접 가입해 운용할 수 있는 연금계좌입니다.';
    }
    if(lower.includes("hi")|| lower.includes("hello") || lower.includes("hey")){
      return "Nice to meet you my customer. How can I help you?"
    }
    return '잘 모루겟는데요..?';
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    addTypingMessage(inputText, getBotResponse);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={Colors.primary} 
      />

      <ChatHeader onClose={onClose} />

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
        />

        <ChatInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
});

export default ChatBotScreen;
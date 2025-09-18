// components/chatbot/ChatBotScreen.tsx
import { Colors } from '@/src/theme/colors';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import { clearMessages, setSearchQuery, setSearchMode } from '@/src/store/slices/chatSlice';
import { sendChatbotMessage } from '@/src/api/chatbotAPI';

import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import SearchBar from './SearchBar';
import { useTypingEffect } from '../../hooks/useTypingEffect';

interface ChatBotScreenProps {
  onClose: () => void;
}

const ChatBotScreen: React.FC<ChatBotScreenProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { messages, searchQuery, isSearchMode, filteredMessages } = useAppSelector(state => state.chat);
  const accessToken = useAppSelector(state => state.auth.accessToken)||'';
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { addTypingMessage, cleanup } = useTypingEffect();

  const getBotResponse = async (userText: string): Promise<string> => {
    const lower = userText.toLowerCase().trim();
  
  // reset 명령어는 로컬 처리
  if (lower === 'reset' || lower === '리셋' || lower === '초기화') {
    return '대화가 초기화되었습니다. 다시 시작해보세요!';
  }
  // if (lower.includes('dc') || lower.includes('확정기여')) {
  //   return 'DC형(확정기여형)은 회사가 일정 금액을 적립하고, 근로자가 운용하는 방식입니다.';
  // }
  // if (lower.includes('irp') || lower.includes('개인형')) {
  //   return 'IRP(개인형퇴직연금)는 개인이 직접 가입해 운용할 수 있는 연금계좌입니다.';
  // }
  
  try {
    const response = await sendChatbotMessage(userText, accessToken);
    return response;
  } catch (error: any) {
    return error.message;
  }
};

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userInput = inputText.trim();
    
    // reset 명령어는 바로 처리하고 타이핑 효과 없이 응답
    if (userInput.toLowerCase() === 'reset' || userInput.toLowerCase() === '리셋' || userInput.toLowerCase() === '초기화') {
      dispatch(clearMessages());
      setInputText('');
      return;
    }

    addTypingMessage(inputText, getBotResponse);
    setInputText('');
  };

  const handleSearchPress = () => {
    dispatch(setSearchMode(true));
  };

  const handleSearchClose = () => {
    dispatch(setSearchMode(false));
  };

  const handleSearchChange = (text: string) => {
    dispatch(setSearchQuery(text));
  };

  const renderMessage = ({ item }: { item: any }) => (
    <MessageBubble message={item} />
  );

  const renderSearchResult = () => {
    if (!isSearchMode) return null;

    if (searchQuery.trim() === '') {
      return (
        <View style={styles.searchInfo}>
          <Text style={styles.searchInfoText}>검색어를 입력하세요</Text>
        </View>
      );
    }

    if (filteredMessages.length === 0) {
      return (
        <View style={styles.searchInfo}>
          <Text style={styles.searchInfoText}>검색 결과가 없습니다</Text>
        </View>
      );
    }

    return (
      <View style={styles.searchInfo}>
        <Text style={styles.searchInfoText}>
          {filteredMessages.length}개의 메시지를 찾았습니다
        </Text>
      </View>
    );
  };

  const displayMessages = isSearchMode && searchQuery.trim() !== '' ? filteredMessages : messages;

  // 메시지가 추가될 때마다 맨 아래로 스크롤 (검색 모드가 아닐 때만)
  useEffect(() => {
    if (!isSearchMode && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isSearchMode]);

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

      <ChatHeader onClose={onClose} onSearchPress={handleSearchPress} />

      {isSearchMode && (
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          onClose={handleSearchClose}
        />
      )}

      {renderSearchResult()}

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={displayMessages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          onContentSizeChange={() => {
            if (!isSearchMode) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
        />

        {!isSearchMode && (
          <ChatInput
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
          />
        )}
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
  searchInfo: {
    backgroundColor: Colors.back,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  searchInfoText: {
    fontSize: 14,
    color: Colors.gray,
  },
});

export default ChatBotScreen;
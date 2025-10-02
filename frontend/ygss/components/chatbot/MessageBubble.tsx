// components/chatbot/MessageBubble.tsx
import { Colors } from '@/src/theme/colors';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import TypingIndicator from './TypingIndicator';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string; // Date → string으로 변경
  isTyping?: boolean;
  displayText?: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <View style={[
      styles.messageContainer,
      message.isUser ? styles.userMessage : styles.botMessage
    ]}>
      {/* 봇 메시지일 때만 아바타 표시 */}
      {!message.isUser && (
        <Image 
          source={require('@/assets/char/basicAlchi.png')}
          style={styles.avatar}
          resizeMode="contain"
        />
      )}
      <View style={styles.messageContent}>
        <View style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.botBubble
        ]}>
          {message.isTyping ? (
            <TypingIndicator />
          ) : (
            <Text style={[
              styles.messageText,
              message.isUser ? styles.userText : styles.botText
            ]}>
              {message.displayText !== undefined ? message.displayText : message.text}
            </Text>
          )}
        </View>
        {/* 타이핑 중이 아닐 때만 타임스탬프 표시 */}
        {!message.isTyping && (
          <Text style={[
            styles.timestamp,
            message.isUser ? styles.userTimestamp : styles.botTimestamp
          ]}>
            {new Date(message.timestamp).toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  messageContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 20,
    marginBottom: 4,
    maxWidth: 280,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: Colors.back,
    alignSelf: 'flex-start',
    borderRadius: 25,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: Colors.white,
  },
  botText: {
    color: Colors.black,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 2,
    paddingHorizontal: 4,
  },
  userTimestamp: {
    alignSelf: 'flex-end',
  },
  botTimestamp: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 20,
  },
});

export default MessageBubble;
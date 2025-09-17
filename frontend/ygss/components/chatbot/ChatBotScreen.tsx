import { Colors } from '@/src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bubble, GiftedChat, Send } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  _id: number;
  text: string;
  createdAt: Date;
  user: { _id: number; name: string; avatar?: any };
}

interface ChatBotScreenProps {
  onClose: () => void;
}

const ChatBotScreen: React.FC<ChatBotScreenProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // 초기 메시지
    setMessages([
      {
        _id: 1,
        text: '안녕하세요! YGSS 퇴직연금 상담 챗봇입니다.\n퇴직연금에 대해 궁금한 것이 있으시면 언제든 물어보세요!',
        createdAt: new Date(),
        user: { _id: 2, name: 'YGSS Bot', avatar: require('@/assets/char/basicAlchi.png') },
      },
    ]);

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const generateBotResponse = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('안녕') || lower.includes('hi') || lower.includes('hello')) {
      return '안녕하세요! 퇴직연금 관련해서 궁금한 점이 있으시면 언제든 말씀해 주세요!';
    }
    if (lower.includes('퇴직연금') || lower.includes('연금')) {
      return '퇴직연금은 근로자의 노후 생활 안정을 위한 중요한 제도입니다.\n\nDB형, DC형, IRP 등 다양한 종류가 있어요.';
    }
    if (lower.includes('dc') || lower.includes('확정기여')) {
      return 'DC형(확정기여형)은 회사가 일정 금액을 적립하고, 근로자가 운용하는 방식입니다.';
    }
    if (lower.includes('irp') || lower.includes('개인형')) {
      return 'IRP(개인형퇴직연금)는 개인이 직접 가입해 운용할 수 있는 연금계좌입니다.';
    }
    if (lower.includes('투자') || lower.includes('운용') || lower.includes('상품')) {
      return '퇴직연금 운용상품은 원리금보장, 실적배당, 혼합형 등 다양합니다.';
    }
    if (lower.includes('세금') || lower.includes('세액공제') || lower.includes('절세')) {
      return '퇴직연금 세제혜택: 납입 시 세액공제, 운용 수익 비과세, 수령 시 소득세 적용.';
    }
    if (lower.includes('도움') || lower.includes('help') || lower.includes('궁금')) {
      return '퇴직연금 관련 안내: 종류, 투자상품, 세제혜택, 수령 방법, 이직 시 처리 방법 등.';
    }
    if (lower.includes('감사') || lower.includes('고마')) {
      return '도움이 되었다니 기쁩니다! 추가로 궁금한 점이 있으면 언제든 말씀해 주세요!';
    }
    return '질문을 구체적으로 해주시면 더 정확한 답변을 드릴 수 있어요.';
  };

  const onSend = (newMessages: Message[] = []) => {
    if (!newMessages.length) return;

    // 사용자 메시지 추가
    setMessages(prev => GiftedChat.append(prev, newMessages));

    // 타이핑 표시
    setIsTyping(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (!isMounted.current) return;

      const botMessage: Message = {
        _id: Math.floor(Math.random() * 1000000),
        text: generateBotResponse(newMessages[0].text),
        createdAt: new Date(),
        user: { _id: 2, name: 'YGSS Bot', avatar: require('@/assets/char/basicAlchi.png') },
      };

      setMessages(prev => GiftedChat.append(prev, [botMessage]));
      setIsTyping(false);
    }, 1000);
  };

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: Colors?.primary ?? '#007AFF', marginRight: 10, marginVertical: 2 },
        left: { backgroundColor: '#F8F9FA', marginLeft: 10, marginVertical: 2, borderWidth: 1, borderColor: '#E9ECEF' },
      }}
      textStyle={{
        right: { color: '#fff', fontSize: 15, lineHeight: 20 },
        left: { color: '#333', fontSize: 15, lineHeight: 20 },
      }}
    />
  );

  const renderSend = (props: any) => (
    <Send {...props} disabled={isTyping}>
      <View style={[styles.sendButton, isTyping && styles.sendButtonDisabled]}>
        <Ionicons name="send" size={20} color={isTyping ? '#999' : Colors?.primary ?? '#007AFF'} />
      </View>
    </Send>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors?.primary ?? '#007AFF'} />

      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>YGSS 상담봇</Text>
            <View style={styles.onlineStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>{isTyping ? '입력 중...' : '온라인'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 채팅 영역 */}
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        placeholder="퇴직연금에 대해 궁금한 점을 물어보세요..."
        showAvatarForEveryMessage={false}
        showUserAvatar={false}
        alwaysShowSend
        renderTime={() => null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: Colors?.primary ?? '#007AFF', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#0056CC' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  closeButton: { marginRight: 12, padding: 4 },
  headerInfo: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium' },
  onlineStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginRight: 4 },
  onlineText: { color: '#E8F4FD', fontSize: 12 },
  sendButton: { marginBottom: 5, marginRight: 5, width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: '#E0E0E0' },
});

export default ChatBotScreen;

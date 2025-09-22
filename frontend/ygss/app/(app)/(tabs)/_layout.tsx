// app/(app)/(tabs)/_layout.tsx
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { LogBox, Platform, Text } from 'react-native';

// 챗봇 관련 imports

import ChatBotScreen from "@/components/chatbot/ChatBotScreen";
import FloatingChatButton from "@/components/chatbot/FloatingChatButton";
import { useChatbot } from '@/hooks/useChatbot';
import { Modal } from 'react-native';

// 특정 경고 메시지를 무시하도록 설정
LogBox.ignoreLogs([
  'Warning: GiftedChat uses the legacy childContextTypes API'
]);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { isChatVisible, openChat, closeChat } = useChatbot();
  const pathname = usePathname();

  const shouldShowChatbot = !pathname.includes('/mypage');
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: "홈",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name="home" size={size} color={focused ? "skyblue" : color} />
            ),
          }}
        // listeners={{ focus: () => router.replace("/(app)/(tabs)/home") }}

        />
        <Tabs.Screen
          name="dc"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "BasicBold",
                  color: focused ? "skyblue" : "gray",
                }}
              >
                DC
              </Text>
            ),
            tabBarIconStyle: { marginTop: 6 },
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); // 기본 이동 막기
              router.push("/(app)/(tabs)/dc/dc1");
            },
          }}
        />
        <Tabs.Screen
          name="irp"
          options={{
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "BasicBold",
                  color: focused ? "skyblue" : "gray",
                }}
              >
                IRP
              </Text>
            ),
            tabBarIconStyle: { marginTop: 6 }, // ← 수직 위치 조정
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push("/(app)/(tabs)/irp/irp1");
            },
          }} />
        <Tabs.Screen
          name="mypage"
          options={{
            title: "마이페이지",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name="person" size={size} color={focused ? "skyblue" : color} />
            ),
          }}
        // listeners={{ focus: () => router.replace("/(app)/(tabs)/mypage") }}

        />

        {/* ⛔️ 탭바에서 숨길 라우트들 */}
        <Tabs.Screen name="dc/index" options={{ href: null }} />
        <Tabs.Screen name="dc/dc1" options={{ href: null }} />
        <Tabs.Screen name="dc/dc2" options={{ href: null }} />
        <Tabs.Screen name="dc/dc3" options={{ href: null }} />
        <Tabs.Screen name="dc/dc4" options={{ href: null }} />

      </Tabs>

      {/* 조건부로 플로팅 챗봇 버튼 표시 - home, dc, irp에서만 */}
      {shouldShowChatbot && (
        <FloatingChatButton onPress={openChat} />
      )}

      {/* 챗봇 모달 */}
      <Modal
        visible={isChatVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeChat}
      >
        <ChatBotScreen onClose={closeChat} />
      </Modal>
    </>
  );
}

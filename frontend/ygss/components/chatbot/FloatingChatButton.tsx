import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FloatingChatButtonProps {
  onPress: () => void;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
  iconSize?: number;
  hasNotification?: boolean;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onPress,
  size = 60,
  backgroundColor = '#007AFF',
  iconColor = '#FFFFFF',
  iconSize = 28,
  hasNotification = false,
}) => {
  // 초기 위치 (좌측 하단)
  const pan = useRef(new Animated.ValueXY({ x: 20, y: screenHeight - 200 })).current;
  
  // 버튼이 화면 경계를 벗어나지 않도록 제한
  const getConstrainedPosition = (x: number, y: number) => {
    const constrainedX = Math.max(10, Math.min(screenWidth - size - 10, x));
    const constrainedY = Math.max(100, Math.min(screenHeight - size - 100, y));
    return { x: constrainedX, y: constrainedY };
  };

  // 화면 가장자리로 자동 이동 (왼쪽 또는 오른쪽)
  const snapToEdge = (x: number, y: number) => {
    const centerX = screenWidth / 2;
    const targetX = x < centerX ? 20 : screenWidth - size - 20;
    
    Animated.spring(pan, {
      toValue: { x: targetX, y },
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: () => {
      // 드래그 시작 시 현재 위치 설정
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    
    onPanResponderRelease: (evt, gestureState) => {
      // 드래그 종료
      pan.flattenOffset();
      
      const finalX = (pan.x as any)._value;
      const finalY = (pan.y as any)._value;
      
      const constrainedPosition = getConstrainedPosition(finalX, finalY);
      
      // 짧은 드래그인 경우 탭으로 간주
      if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
        onPress();
        return;
      }
      
      // 가장자리로 자동 이동
      snapToEdge(constrainedPosition.x, constrainedPosition.y);
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor,
          transform: pan.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={[styles.button, { width: size, height: size }]}
        activeOpacity={0.8}
        onPress={onPress} // 백업 onPress 추가
      >
        <Ionicons name="chatbubble-ellipses" size={iconSize} color={iconColor} />
        
        {/* 새 메시지 알림 점 */}
        {hasNotification && <View style={styles.notificationDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },
  button: {
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default FloatingChatButton;
// components/chatbot/ChatInput.tsx
import { Colors } from '@/src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChangeText, 
  onSend,
  placeholder = "퇴직연금에 대해 궁금한 점을 물어보세요..."
}) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline
        onSubmitEditing={onSend}
      />
      <TouchableOpacity 
        style={[styles.sendButton, !value.trim() && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!value.trim()}
      >
        <Ionicons 
          name="send" 
          size={20} 
          color={!value.trim() ? '#999' : Colors.primary} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.back,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.back,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.back,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
});

export default ChatInput;
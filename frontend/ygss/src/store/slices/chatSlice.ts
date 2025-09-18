// store/slices/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  isTyping?: boolean;
  displayText?: string;
}

interface ChatState {
  messages: Message[];
  searchQuery: string;
  isSearchMode: boolean;
  filteredMessages: Message[];
}

const initialMessage: Message = {
  id: '1',
  text: '안녕하세요! 알키가 도와드릴게요!\n퇴직연금에 대해 무엇이든 물어보세요!',
  isUser: false,
  timestamp: new Date().toISOString(),
};

const initialState: ChatState = {
  messages: [initialMessage],
  searchQuery: '',
  isSearchMode: false,
  filteredMessages: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<Message> }>) => {
      const { id, updates } = action.payload;
      const messageIndex = state.messages.findIndex(msg => msg.id === id);
      if (messageIndex !== -1) {
        state.messages[messageIndex] = { ...state.messages[messageIndex], ...updates };
      }
    },
    clearMessages: (state) => {
      state.messages = [initialMessage]; // 초기 인사말만 남기기
      state.searchQuery = '';
      state.isSearchMode = false;
      state.filteredMessages = [];
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      if (action.payload.trim() === '') {
        state.filteredMessages = [];
      } else {
        state.filteredMessages = state.messages.filter(message =>
          message.text.toLowerCase().includes(action.payload.toLowerCase()) ||
          (message.displayText && message.displayText.toLowerCase().includes(action.payload.toLowerCase()))
        );
      }
    },
    setSearchMode: (state, action: PayloadAction<boolean>) => {
      state.isSearchMode = action.payload;
      if (!action.payload) {
        state.searchQuery = '';
        state.filteredMessages = [];
      }
    },
  },
});

export const { addMessage, updateMessage, clearMessages, setSearchQuery, setSearchMode } = chatSlice.actions;
export default chatSlice.reducer;
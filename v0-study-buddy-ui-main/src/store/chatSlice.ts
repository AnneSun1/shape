import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { chatService, ChatCreate, ChatOut, ChatCreated } from '@/services/chatService';

interface ChatState {
  chats: ChatOut[];
  currentChat: ChatOut | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: null,
};

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (chatData: ChatCreate) => {
    const response = await chatService.createChat(chatData);
    return response;
  }
);

export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async () => {
    const response = await chatService.getChats();
    console.log('Fetching chats:', response);
    return response;
  }
);

export const fetchChatById = createAsyncThunk(
  'chat/fetchChatById',
  async (chatId: string) => {
    const response = await chatService.getChatById(chatId);
    return response;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addChat: (state, action) => {
      state.chats.unshift(action.payload);
    },
    updateChat: (state, action) => {
      const index = state.chats.findIndex(chat => chat.id === action.payload.id);
      if (index !== -1) {
        state.chats[index] = action.payload;
      }
    },
    setCurrentChatById: (state, action) => {
      const chat = state.chats.find(chat => chat.id === action.payload);
      if (chat) {
        state.currentChat = chat;
      }
    },
  },
  extraReducers: (builder) => {
    // Create Chat
    builder.addCase(createChat.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createChat.fulfilled, (state, action) => {
      state.loading = false;
      // Add the new chat to the beginning of the list
      const newChat: ChatOut = {
        id: action.payload.id,
        title: action.payload.title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };
      state.chats.unshift(newChat);
      state.currentChat = newChat;
    });
    builder.addCase(createChat.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create chat';
    });

    // Fetch Chats
    builder.addCase(fetchChats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchChats.fulfilled, (state, action) => {
      state.loading = false;
      state.chats = action.payload;
    });
    builder.addCase(fetchChats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch chats';
    });

    // Fetch Chat by ID
    builder.addCase(fetchChatById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchChatById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentChat = action.payload;
    });
    builder.addCase(fetchChatById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch chat';
    });
  },
});

export const { setCurrentChat, clearCurrentChat, clearError, addChat, updateChat, setCurrentChatById } = chatSlice.actions;
export default chatSlice.reducer;

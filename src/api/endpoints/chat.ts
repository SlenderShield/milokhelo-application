import { apiClient } from '../client';
import {
  ChatRoom,
  ChatRoomSchema,
  ChatRoomCreate,
  ChatMessage,
  ChatMessageSchema,
  ChatMessageCreate,
  ChatMessageUpdate,
} from '../models';

// Get Chat Rooms
export const getChatRooms = () =>
  apiClient
    .get<ChatRoom[]>('/chat/rooms')
    .then((res) => ChatRoomSchema.array().parse(res.data));

// Create Chat Room
export const createChatRoom = (data: ChatRoomCreate) =>
  apiClient
    .post<ChatRoom>('/chat/rooms', data)
    .then((res) => ChatRoomSchema.parse(res.data));

// Get Chat Messages
export const getChatMessages = (
  roomId: string,
  params?: { limit?: number; before?: string }
) =>
  apiClient
    .get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`, { params })
    .then((res) => ChatMessageSchema.array().parse(res.data));

// Send Chat Message
export const sendChatMessage = (roomId: string, data: ChatMessageCreate) =>
  apiClient
    .post<ChatMessage>(`/chat/rooms/${roomId}/messages`, data)
    .then((res) => ChatMessageSchema.parse(res.data));

// Edit Chat Message
export const editChatMessage = (messageId: string, data: ChatMessageUpdate) =>
  apiClient
    .patch<ChatMessage>(`/chat/messages/${messageId}`, data)
    .then((res) => ChatMessageSchema.parse(res.data));

// Delete Chat Message
export const deleteChatMessage = (messageId: string) =>
  apiClient.delete(`/chat/messages/${messageId}`).then((res) => res.data);

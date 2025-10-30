import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as chatApi from '../endpoints/chat';
import {
  ChatRoomCreate,
  ChatMessageCreate,
  ChatMessageUpdate,
} from '../models';

// Query Keys
export const chatKeys = {
  all: ['chat'] as const,
  rooms: () => [...chatKeys.all, 'rooms'] as const,
  room: (roomId: string) => [...chatKeys.rooms(), roomId] as const,
  messages: (roomId: string) => [...chatKeys.room(roomId), 'messages'] as const,
  messagesList: (roomId: string, params?: { limit?: number; before?: string }) =>
    [...chatKeys.messages(roomId), params] as const,
};

// ===== QUERIES =====

// Get Chat Rooms
export const useGetChatRooms = () =>
  useQuery({
    queryKey: chatKeys.rooms(),
    queryFn: () => chatApi.getChatRooms(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

// Get Chat Messages
export const useGetChatMessages = (
  roomId: string,
  params?: { limit?: number; before?: string }
) =>
  useQuery({
    queryKey: chatKeys.messagesList(roomId, params),
    queryFn: () => chatApi.getChatMessages(roomId, params),
    enabled: !!roomId,
    staleTime: 30 * 1000, // 30 seconds (frequent updates for chat)
  });

// ===== MUTATIONS =====

// Create Chat Room
export const useCreateChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChatRoomCreate) => chatApi.createChatRoom(data),
    onSuccess: () => {
      // Invalidate rooms list to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    },
  });
};

// Send Chat Message
export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: string; data: ChatMessageCreate }) =>
      chatApi.sendChatMessage(roomId, data),
    onSuccess: (_, { roomId }) => {
      // Invalidate messages for this room to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(roomId) });
      // Invalidate rooms list to update last message
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    },
  });
};

// Edit Chat Message
export const useEditChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, data }: { messageId: string; data: ChatMessageUpdate }) =>
      chatApi.editChatMessage(messageId, data),
    onSuccess: (message) => {
      // Invalidate messages for the room to refetch
      if (message.roomId) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(message.roomId),
        });
      }
    },
  });
};

// Delete Chat Message
export const useDeleteChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, roomId }: { messageId: string; roomId: string }) =>
      chatApi.deleteChatMessage(messageId),
    onSuccess: (_, { roomId }) => {
      // Invalidate messages for this room to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(roomId) });
    },
  });
};

/**
 * WebSocket Hook for Real-time Chat
 * 
 * Custom React hook to manage WebSocket connections and events
 * in chat components with automatic cleanup.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketService, SocketEvents, ChatMessage, TypingIndicator } from '@/src/services/websocket';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  roomId?: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  sendMessage: (content: string) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  messages: ChatMessage[];
  typingUsers: TypingIndicator[];
  error: Error | null;
}

/**
 * Hook to use WebSocket connection in components
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true, roomId } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  const currentRoomRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    if (!autoConnect) return;

    const connect = async () => {
      try {
        setConnectionStatus('connecting');
        await websocketService.connect();
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
      } catch (err) {
        console.error('[useWebSocket] Connection error:', err);
        setError(err as Error);
        setConnectionStatus('error');
      }
    };

    connect();

    return () => {
      if (currentRoomRef.current) {
        websocketService.leaveRoom(currentRoomRef.current);
      }
      // Don't disconnect here as other components might be using it
    };
  }, [autoConnect]);

  // Join room if roomId provided
  useEffect(() => {
    if (!roomId || !isConnected) return;

    const joinRoomAsync = async () => {
      try {
        await websocketService.joinRoom(roomId);
        currentRoomRef.current = roomId;
      } catch (err) {
        console.error('[useWebSocket] Failed to join room:', err);
        setError(err as Error);
      }
    };

    joinRoomAsync();

    return () => {
      if (currentRoomRef.current === roomId) {
        websocketService.leaveRoom(roomId);
        currentRoomRef.current = null;
      }
    };
  }, [roomId, isConnected]);

  // Listen to connection status changes
  useEffect(() => {
    const handleConnectionStatus = (data: { status: string; reason?: string }) => {
      setIsConnected(data.status === 'connected');
      setConnectionStatus(data.status as ConnectionStatus);
    };

    const handleReconnecting = (data: { attempt: number }) => {
      setConnectionStatus('reconnecting');
    };

    const handleReconnected = () => {
      setConnectionStatus('connected');
      setIsConnected(true);
      setError(null);
    };

    const handleConnectionError = (data: { error: Error }) => {
      setError(data.error);
      setConnectionStatus('error');
    };

    websocketService.on('connection_status', handleConnectionStatus);
    websocketService.on('reconnecting', handleReconnecting);
    websocketService.on('reconnected', handleReconnected);
    websocketService.on('connection_error', handleConnectionError);

    return () => {
      websocketService.off('connection_status', handleConnectionStatus);
      websocketService.off('reconnecting', handleReconnecting);
      websocketService.off('reconnected', handleReconnected);
      websocketService.off('connection_error', handleConnectionError);
    };
  }, []);

  // Listen to new messages
  useEffect(() => {
    const handleNewMessage = (message: ChatMessage) => {
      console.log('[useWebSocket] New message:', message);
      setMessages(prev => [...prev, message]);
      
      // Mark as delivered
      websocketService.markDelivered(message.id);
    };

    websocketService.on(SocketEvents.NEW_MESSAGE, handleNewMessage);

    return () => {
      websocketService.off(SocketEvents.NEW_MESSAGE, handleNewMessage);
    };
  }, []);

  // Listen to typing indicators
  useEffect(() => {
    const handleUserTyping = (data: TypingIndicator) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return data.isTyping ? [...filtered, data] : filtered;
      });
    };

    const handleUserStoppedTyping = (data: TypingIndicator) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    websocketService.on(SocketEvents.USER_TYPING, handleUserTyping);
    websocketService.on(SocketEvents.USER_STOPPED_TYPING, handleUserStoppedTyping);

    return () => {
      websocketService.off(SocketEvents.USER_TYPING, handleUserTyping);
      websocketService.off(SocketEvents.USER_STOPPED_TYPING, handleUserStoppedTyping);
    };
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!currentRoomRef.current) {
      throw new Error('No active room');
    }

    try {
      const message = await websocketService.sendMessage({
        roomId: currentRoomRef.current,
        sender: 'current-user-id', // Should come from auth context
        content,
        type: 'text',
      });
      
      // Add to local messages immediately for optimistic update
      setMessages(prev => [...prev, message]);
    } catch (err) {
      console.error('[useWebSocket] Failed to send message:', err);
      throw err;
    }
  }, []);

  // Start typing
  const startTyping = useCallback(() => {
    if (!currentRoomRef.current) return;
    
    websocketService.startTyping(currentRoomRef.current);
    
    // Auto-stop typing after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, []);

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!currentRoomRef.current) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    websocketService.stopTyping(currentRoomRef.current);
  }, []);

  // Join room
  const joinRoom = useCallback(async (newRoomId: string) => {
    try {
      // Leave current room if any
      if (currentRoomRef.current) {
        await websocketService.leaveRoom(currentRoomRef.current);
      }
      
      // Join new room
      await websocketService.joinRoom(newRoomId);
      currentRoomRef.current = newRoomId;
      
      // Clear messages when switching rooms
      setMessages([]);
      setTypingUsers([]);
    } catch (err) {
      console.error('[useWebSocket] Failed to join room:', err);
      setError(err as Error);
      throw err;
    }
  }, []);

  // Leave room
  const leaveRoom = useCallback(async (leaveRoomId: string) => {
    try {
      await websocketService.leaveRoom(leaveRoomId);
      if (currentRoomRef.current === leaveRoomId) {
        currentRoomRef.current = null;
        setMessages([]);
        setTypingUsers([]);
      }
    } catch (err) {
      console.error('[useWebSocket] Failed to leave room:', err);
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    startTyping,
    stopTyping,
    joinRoom,
    leaveRoom,
    messages,
    typingUsers,
    error,
  };
}

/**
 * Hook to manage typing indicator
 */
export function useTypingIndicator(roomId: string | null, delay: number = 1000) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = useCallback(() => {
    if (!roomId) return;

    websocketService.startTyping(roomId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.stopTyping(roomId);
    }, delay);
  }, [roomId, delay]);

  const stopTyping = useCallback(() => {
    if (!roomId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    websocketService.stopTyping(roomId);
  }, [roomId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { handleTyping, stopTyping };
}

/**
 * Hook to get online users in a room
 */
export function useRoomUsers(roomId: string | null) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const roomUsers = await websocketService.getRoomUsers(roomId);
        setUsers(roomUsers);
      } catch (err) {
        console.error('[useRoomUsers] Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Listen for user status changes
    const handleUserOnline = (data: any) => {
      if (data.roomId === roomId) {
        setUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          return [...filtered, { ...data, status: 'online' }];
        });
      }
    };

    const handleUserOffline = (data: any) => {
      if (data.roomId === roomId) {
        setUsers(prev =>
          prev.map(u =>
            u.userId === data.userId ? { ...u, status: 'offline' } : u
          )
        );
      }
    };

    websocketService.on(SocketEvents.USER_ONLINE, handleUserOnline);
    websocketService.on(SocketEvents.USER_OFFLINE, handleUserOffline);

    return () => {
      websocketService.off(SocketEvents.USER_ONLINE, handleUserOnline);
      websocketService.off(SocketEvents.USER_OFFLINE, handleUserOffline);
    };
  }, [roomId]);

  return { users, loading };
}

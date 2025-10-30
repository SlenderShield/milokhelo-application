/**
 * WebSocket Service for Real-time Chat
 *
 * Provides WebSocket connection management, message handling,
 * and automatic reconnection for real-time chat functionality.
 */

import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// WebSocket Events
export enum SocketEvents {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  RECONNECT = 'reconnect',
  RECONNECT_ATTEMPT = 'reconnect_attempt',
  RECONNECT_ERROR = 'reconnect_error',
  RECONNECT_FAILED = 'reconnect_failed',

  // Authentication
  AUTHENTICATE = 'authenticate',
  AUTHENTICATED = 'authenticated',
  UNAUTHORIZED = 'unauthorized',

  // Chat room events
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  ROOM_JOINED = 'room_joined',
  ROOM_LEFT = 'room_left',

  // Message events
  SEND_MESSAGE = 'send_message',
  NEW_MESSAGE = 'new_message',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_DELIVERED = 'message_delivered',
  MESSAGE_READ = 'message_read',
  MESSAGE_DELETED = 'message_deleted',

  // Typing indicators
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',
  USER_TYPING = 'user_typing',
  USER_STOPPED_TYPING = 'user_stopped_typing',

  // Presence
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  ROOM_USERS = 'room_users',
}

// Message types
export interface ChatMessage {
  id: string;
  roomId: string;
  sender: string;
  content: string;
  timestamp: string;
  delivered?: boolean;
  read?: boolean;
  type?: 'text' | 'image' | 'file' | 'system';
  metadata?: Record<string, any>;
}

export interface TypingIndicator {
  roomId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface RoomUser {
  userId: string;
  userName: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

// WebSocket configuration
interface WebSocketConfig {
  url: string;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
}

// Event listener type
type EventListener = (...args: any[]) => void;

/**
 * WebSocket Service Class
 */
class WebSocketService {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private listeners: Map<string, Set<EventListener>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;
  private isAuthenticated: boolean = false;
  private currentRooms: Set<string> = new Set();

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = {
      url: process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3000',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      ...config,
    };
  }

  /**
   * Initialize and connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      console.log('[WebSocket] Already connected or connecting');
      return;
    }

    try {
      this.isConnecting = true;

      // Get authentication token
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('[WebSocket] Connecting to:', this.config.url);

      // Create socket connection
      this.socket = io(this.config.url, {
        auth: { token },
        reconnection: this.config.reconnection,
        reconnectionAttempts: this.config.reconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        timeout: this.config.timeout,
        transports: ['websocket', 'polling'],
      });

      this.setupEventHandlers();
      this.isConnecting = false;
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      console.log('[WebSocket] Disconnecting');
      this.socket.disconnect();
      this.socket = null;
    }

    this.isAuthenticated = false;
    this.currentRooms.clear();
    this.listeners.clear();
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Setup default event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on(SocketEvents.CONNECT, () => {
      console.log('[WebSocket] Connected');
      this.emit('connection_status', { status: 'connected' });
    });

    this.socket.on(SocketEvents.DISCONNECT, (reason: string) => {
      console.log('[WebSocket] Disconnected:', reason);
      this.isAuthenticated = false;
      this.emit('connection_status', { status: 'disconnected', reason });

      // Attempt to reconnect
      if (this.config.reconnection && reason === 'io server disconnect') {
        this.reconnect();
      }
    });

    this.socket.on(SocketEvents.ERROR, (error: Error) => {
      console.error('[WebSocket] Error:', error);
      this.emit('connection_error', { error });
    });

    this.socket.on(SocketEvents.RECONNECT, (attemptNumber: number) => {
      console.log('[WebSocket] Reconnected after', attemptNumber, 'attempts');
      this.emit('reconnected', { attempts: attemptNumber });

      // Rejoin rooms after reconnection
      this.rejoinRooms();
    });

    this.socket.on(SocketEvents.RECONNECT_ATTEMPT, (attemptNumber: number) => {
      console.log('[WebSocket] Reconnect attempt:', attemptNumber);
      this.emit('reconnecting', { attempt: attemptNumber });
    });

    this.socket.on(SocketEvents.RECONNECT_ERROR, (error: Error) => {
      console.error('[WebSocket] Reconnection error:', error);
      this.emit('reconnect_error', { error });
    });

    this.socket.on(SocketEvents.RECONNECT_FAILED, () => {
      console.error('[WebSocket] Reconnection failed');
      this.emit('reconnect_failed', {});
    });

    // Authentication events
    this.socket.on(SocketEvents.AUTHENTICATED, () => {
      console.log('[WebSocket] Authenticated');
      this.isAuthenticated = true;
      this.emit('authenticated', {});
    });

    this.socket.on(SocketEvents.UNAUTHORIZED, (error: any) => {
      console.error('[WebSocket] Unauthorized:', error);
      this.isAuthenticated = false;
      this.emit('unauthorized', { error });
    });
  }

  /**
   * Attempt to reconnect
   */
  private reconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.config.reconnectionDelay);
  }

  /**
   * Rejoin rooms after reconnection
   */
  private async rejoinRooms(): Promise<void> {
    for (const roomId of this.currentRooms) {
      await this.joinRoom(roomId);
    }
  }

  /**
   * Join a chat room
   */
  async joinRoom(roomId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit(SocketEvents.JOIN_ROOM, { roomId }, (response: any) => {
        if (response.error) {
          console.error('[WebSocket] Failed to join room:', response.error);
          reject(new Error(response.error));
        } else {
          console.log('[WebSocket] Joined room:', roomId);
          this.currentRooms.add(roomId);
          resolve();
        }
      });
    });
  }

  /**
   * Leave a chat room
   */
  async leaveRoom(roomId: string): Promise<void> {
    if (!this.socket?.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit(SocketEvents.LEAVE_ROOM, { roomId }, (response: any) => {
        if (response.error) {
          console.error('[WebSocket] Failed to leave room:', response.error);
          reject(new Error(response.error));
        } else {
          console.log('[WebSocket] Left room:', roomId);
          this.currentRooms.delete(roomId);
          resolve();
        }
      });
    });
  }

  /**
   * Send a message
   */
  async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit(SocketEvents.SEND_MESSAGE, message, (response: any) => {
        if (response.error) {
          console.error('[WebSocket] Failed to send message:', response.error);
          reject(new Error(response.error));
        } else {
          console.log('[WebSocket] Message sent:', response.message);
          resolve(response.message);
        }
      });
    });
  }

  /**
   * Send typing indicator
   */
  startTyping(roomId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit(SocketEvents.TYPING_START, { roomId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(roomId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit(SocketEvents.TYPING_STOP, { roomId });
  }

  /**
   * Mark message as delivered
   */
  markDelivered(messageId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit(SocketEvents.MESSAGE_DELIVERED, { messageId });
  }

  /**
   * Mark message as read
   */
  markRead(messageId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit(SocketEvents.MESSAGE_READ, { messageId });
  }

  /**
   * Subscribe to an event
   */
  on(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Also subscribe to socket event
    if (this.socket) {
      this.socket.on(event, listener);
    }
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, listener: EventListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }

    // Also unsubscribe from socket event
    if (this.socket) {
      this.socket.off(event, listener);
    }
  }

  /**
   * Emit a custom event
   */
  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  /**
   * Get list of users in a room
   */
  async getRoomUsers(roomId: string): Promise<RoomUser[]> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit(SocketEvents.ROOM_USERS, { roomId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.users);
        }
      });
    });
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

// Export class for testing/custom instances
export default WebSocketService;

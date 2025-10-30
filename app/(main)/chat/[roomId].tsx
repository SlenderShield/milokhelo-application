import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import {
  useGetChatMessages,
  useSendChatMessage,
  useEditChatMessage,
  useDeleteChatMessage,
} from '@/src/api/hooks';
import { useAuth } from '@/src/context/AuthContext';
import { useWebSocket, useTypingIndicator } from '@/src/hooks/useWebSocket';

export default function ChatMessagesScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [messageText, setMessageText] = useState('');
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(
    null
  );

  // Fetch initial messages (paginated)
  const {
    data: initialMessages,
    isLoading,
    error,
    refetch,
  } = useGetChatMessages(roomId, { limit: 50 });

  // WebSocket for real-time messages
  const {
    isConnected,
    connectionStatus,
    sendMessage: sendWSMessage,
    messages: wsMessages,
    typingUsers,
    error: wsError,
  } = useWebSocket({ roomId });

  // Typing indicator
  const { handleTyping, stopTyping } = useTypingIndicator(roomId);

  // Mutations (for edit/delete)
  const sendMessage = useSendChatMessage();
  const editMessage = useEditChatMessage();
  const deleteMessage = useDeleteChatMessage();

  // Combine initial messages with WebSocket messages
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (wsMessages.length > 0) {
      // Add new WebSocket messages
      setMessages(prev => {
        const newMessages = wsMessages.filter(
          wsMsg => !prev.some(msg => msg.id === wsMsg.id)
        );
        return [...prev, ...newMessages];
      });
    }
  }, [wsMessages]);

  // Auto-scroll to bottom when messages load
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    const content = messageText.trim();
    if (!content) return;

    // Stop typing indicator
    stopTyping();

    // Editing existing message
    if (editingMessage) {
      try {
        await editMessage.mutateAsync({
          messageId: editingMessage.id,
          content,
        });
        setMessageText('');
        setEditingMessage(null);
        refetch();
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to edit message');
      }
      return;
    }

    // Sending new message via WebSocket (real-time)
    try {
      if (isConnected) {
        await sendWSMessage(content);
      } else {
        // Fallback to HTTP API if WebSocket not connected
        await sendMessage.mutateAsync({
          roomId,
          content,
        });
        refetch();
      }
      setMessageText('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send message');
    }
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessage({ id: messageId, content });
    setMessageText(content);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setMessageText('');
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMessage.mutateAsync(messageId);
            refetch();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete message');
          }
        },
      },
    ]);
  };

  const handleLongPress = (message: any) => {
    if (message.senderId !== user?.id) return;

    Alert.alert('Message Options', '', [
      {
        text: 'Edit',
        onPress: () => handleEditMessage(message.id, message.content),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => handleDeleteMessage(message.id),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load messages</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderMessage = ({ item }: any) => {
    const isOwnMessage = item.sender === user?.id || item.senderId === user?.id;

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
        disabled={!isOwnMessage}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {!isOwnMessage && item.senderName && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
              ]}
            >
              {formatTime(item.createdAt || item.timestamp)}
            </Text>
            {isOwnMessage && item.delivered && (
              <Text style={styles.deliveryStatus}>✓</Text>
            )}
            {isOwnMessage && item.read && (
              <Text style={styles.deliveryStatus}>✓✓</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages List */}
      {!messages || messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start the conversation</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContent}
          inverted={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
        />
      )}

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        {/* Connection Status */}
        {connectionStatus !== 'connected' && (
          <View style={styles.connectionBar}>
            <Text style={styles.connectionText}>
              {connectionStatus === 'connecting' && '⚡ Connecting...'}
              {connectionStatus === 'reconnecting' && '🔄 Reconnecting...'}
              {connectionStatus === 'disconnected' && '⚠️ Disconnected'}
              {connectionStatus === 'error' && '❌ Connection error'}
            </Text>
          </View>
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingBar}>
            <Text style={styles.typingText}>
              {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </Text>
          </View>
        )}

        {editingMessage && (
          <View style={styles.editingBar}>
            <Text style={styles.editingText}>Editing message</Text>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={styles.cancelEditText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={(text) => {
              setMessageText(text);
              handleTyping();
            }}
            onBlur={stopTyping}
            multiline
            maxLength={1000}
            editable={!sendMessage.isPending && !editMessage.isPending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || sendMessage.isPending || editMessage.isPending) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={
              !messageText.trim() || sendMessage.isPending || editMessage.isPending
            }
          >
            {sendMessage.isPending || editMessage.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>
                {editingMessage ? '✓' : '➤'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ownMessageBubble: {
    backgroundColor: '#6200ee',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  deliveryStatus: {
    fontSize: 10,
    marginLeft: 4,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  connectionBar: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
  },
  connectionText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
  typingBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  typingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  editingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  editingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  cancelEditText: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

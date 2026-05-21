import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../constants/app_constants.dart';
import '../repositories/chat_repository.dart';

/// Chat Provider
/// =============
/// Real-time chat with Socket.IO integration

// Repository Provider
final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return ChatRepository();
});

// Socket.IO Client
final socketProvider = Provider<io.Socket>((ref) {
  final socket = io.io(
    AppConstants.SOCKET_URL,
    io.OptionBuilder()
        .setTransports(['websocket'])
        .enableAutoConnect()
        .enableReconnection()
        .setReconnectionAttempts(5)
        .setReconnectionDelay(1000)
        .build(),
  );
  return socket;
});

// Conversations List
final conversationsProvider = StateNotifierProvider<ConversationsNotifier, AsyncValue<List<Conversation>>>((ref) {
  final repository = ref.watch(chatRepositoryProvider);
  return ConversationsNotifier(repository);
});

class ConversationsNotifier extends StateNotifier<AsyncValue<List<Conversation>>> {
  final ChatRepository _repository;

  ConversationsNotifier(this._repository) : super(const AsyncValue.loading()) {
    loadConversations();
  }

  Future<void> loadConversations({ConversationFilters? filters}) async {
    state = const AsyncValue.loading();
    try {
      final conversations = await _repository.getConversations(filters: filters);
      if (conversations.isEmpty) {
        state = const AsyncValue.data(<Conversation>[]);
      } else {
        state = AsyncValue.data(conversations);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    await loadConversations();
  }
}

// Messages
final messagesProvider = FutureProvider.family<MessagePage, String>((ref, conversationId) async {
  final repository = ref.watch(chatRepositoryProvider);
  return repository.getMessages(conversationId);
});

// Send Message Action
// This provider returns a function that sends a message to the given conversationId
final sendMessageProvider = Provider.family<Future<Message> Function(SendMessageData), String>((ref, conversationId) {
  final repository = ref.watch(chatRepositoryProvider);
  return (SendMessageData data) => repository.sendMessage(conversationId, data);
});

// Unread Count
final unreadCountProvider = Provider<int>((ref) {
  final conversations = ref.watch(conversationsProvider);
  final data = conversations.valueOrNull;
  if (data == null) return 0;
  return data.fold(0, (sum, c) => sum + c.unreadCount);
});

// Active Conversation
final activeConversationProvider = StateProvider<String?>((ref) => null);

// Chat Actions Helper
class ChatActions {
  final ChatRepository _repository;
  final io.Socket _socket;

  ChatActions(this._repository, this._socket);

  Future<Message> sendMessage(String conversationId, String content, {String type = 'text'}) async {
    final data = SendMessageData(content: content, type: type);
    final message = await _repository.sendMessage(conversationId, data);

    _socket.emit('send_message', {
      'conversationId': conversationId,
      'message': message.toJson(),
    });

    return message;
  }

  void sendTyping(String conversationId, bool isTyping) {
    _socket.emit('typing', {
      'conversationId': conversationId,
      'isTyping': isTyping,
    });
  }

  void joinConversation(String conversationId) {
    _socket.emit('join', {'conversationId': conversationId});
  }

  void leaveConversation(String conversationId) {
    _socket.emit('leave', {'conversationId': conversationId});
  }
}

final chatActionsProvider = Provider<ChatActions>((ref) {
  final repository = ref.watch(chatRepositoryProvider);
  final socket = ref.watch(socketProvider);
  return ChatActions(repository, socket);
});
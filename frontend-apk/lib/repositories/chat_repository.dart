import '../services/api_service.dart';

/// Chat Repository
/// ==============
/// Repository for chat/messaging API operations

class ChatRepository {
  final ApiService _api = ApiService();

  // ==========================================================
  // Conversation Operations
  // ==========================================================

  /// Get all conversations
  Future<List<Conversation>> getConversations({ConversationFilters? filters}) async {
    final queryParams = filters?.toQueryParams() ?? {};
    final response = await _api.getConversations(params: queryParams);
    final data = response.data['conversations'] ?? response.data;
    if (data is List) {
      return data.map((json) => Conversation.fromJson(json)).toList();
    }
    return [];
  }

  /// Get messages in a conversation with cursor-based pagination
  /// [cursor] - the last message ID from previous page
  /// [limit] - number of messages per page (default 50)
  Future<MessagePage> getMessages(String conversationId, {String? cursor, int limit = 50}) async {
    final queryParams = <String, dynamic>{
      'limit': limit,
    };
    if (cursor != null) {
      queryParams['cursor'] = cursor;
    }
    
    final response = await _api.getMessages(conversationId, params: queryParams);
    final data = response.data;
    
    final messages = (data['messages'] ?? data['data'] ?? [])
        .map((json) => Message.fromJson(json))
        .toList();
    
    final nextCursor = data['nextCursor'] ?? data['next_cursor'] as String?;
    final hasMore = data['hasMore'] ?? data['has_more'] as bool? ?? false;
    
    return MessagePage(
      messages: messages,
      nextCursor: nextCursor,
      hasMore: hasMore,
    );
  }

  /// Send a message to a conversation
  Future<Message> sendMessage(String conversationId, SendMessageData data) async {
    final response = await _api.sendMessage(conversationId, data.toJson());
    return Message.fromJson(response.data);
  }
}

/// Conversation Model
class Conversation {
  final String id;
  final String? name;
  final String type; // 'direct' or 'group'
  final List<ConversationParticipant> participants;
  final Message? lastMessage;
  final int unreadCount;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Conversation({
    required this.id,
    this.name,
    required this.type,
    required this.participants,
    this.lastMessage,
    this.unreadCount = 0,
    this.createdAt,
    this.updatedAt,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'],
      type: json['type'] ?? 'direct',
      participants: (json['participants'] ?? [])
          .map((p) => ConversationParticipant.fromJson(p))
          .toList(),
      lastMessage: json['lastMessage'] != null
          ? Message.fromJson(json['lastMessage'])
          : null,
      unreadCount: json['unreadCount'] ?? json['unread_count'] ?? 0,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'type': type,
        'participants': participants.map((p) => p.toJson()).toList(),
        'lastMessage': lastMessage?.toJson(),
        'unreadCount': unreadCount,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };
}

/// Conversation participant
class ConversationParticipant {
  final int userId;
  final String? name;
  final String? photoUrl;
  final String? role;
  final DateTime? joinedAt;

  ConversationParticipant({
    required this.userId,
    this.name,
    this.photoUrl,
    this.role,
    this.joinedAt,
  });

  factory ConversationParticipant.fromJson(Map<String, dynamic> json) {
    return ConversationParticipant(
      userId: json['userId'] ?? json['user_id'] ?? 0,
      name: json['name'],
      photoUrl: json['photoUrl'] ?? json['photo_url'],
      role: json['role'],
      joinedAt: json['joinedAt'] != null ? DateTime.tryParse(json['joinedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'userId': userId,
        'name': name,
        'photoUrl': photoUrl,
        'role': role,
        'joinedAt': joinedAt?.toIso8601String(),
      };
}

/// Message Model
class Message {
  final String id;
  final String conversationId;
  final int senderId;
  final String? senderName;
  final String? senderPhotoUrl;
  final String content;
  final String type; // 'text', 'image', 'file'
  final String? attachmentUrl;
  final DateTime createdAt;
  final DateTime? readAt;

  Message({
    required this.id,
    required this.conversationId,
    required this.senderId,
    this.senderName,
    this.senderPhotoUrl,
    required this.content,
    this.type = 'text',
    this.attachmentUrl,
    required this.createdAt,
    this.readAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] ?? json['_id'] ?? '',
      conversationId: json['conversationId'] ?? json['conversation_id'] ?? '',
      senderId: json['senderId'] ?? json['sender_id'] ?? 0,
      senderName: json['senderName'] ?? json['sender_name'],
      senderPhotoUrl: json['senderPhotoUrl'] ?? json['sender_photo_url'],
      content: json['content'] ?? '',
      type: json['type'] ?? 'text',
      attachmentUrl: json['attachmentUrl'] ?? json['attachment_url'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? json['created_at'] ?? '') ?? DateTime.now(),
      readAt: json['readAt'] != null ? DateTime.tryParse(json['readAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'conversationId': conversationId,
        'senderId': senderId,
        'senderName': senderName,
        'senderPhotoUrl': senderPhotoUrl,
        'content': content,
        'type': type,
        'attachmentUrl': attachmentUrl,
        'createdAt': createdAt.toIso8601String(),
        'readAt': readAt?.toIso8601String(),
      };
}

/// Paginated message result
class MessagePage {
  final List<Message> messages;
  final String? nextCursor;
  final bool hasMore;

  MessagePage({
    required this.messages,
    this.nextCursor,
    this.hasMore = false,
  });
}

/// Data class for sending messages
class SendMessageData {
  final String content;
  final String type;
  final String? attachmentUrl;

  SendMessageData({
    required this.content,
    this.type = 'text',
    this.attachmentUrl,
  });

  Map<String, dynamic> toJson() => {
        'content': content,
        'type': type,
        'attachmentUrl': attachmentUrl,
      };
}

/// Filter options for conversation queries
class ConversationFilters {
  final String? type;
  final int? limit;
  final int? offset;

  ConversationFilters({
    this.type,
    this.limit,
    this.offset,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{};
    if (type != null) params['type'] = type;
    if (limit != null) params['limit'] = limit;
    if (offset != null) params['offset'] = offset;
    return params;
  }
}
import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayInit, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket 
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface CollaborationEvent {
  type: 'file-change' | 'cursor-position' | 'selection' | 'join-room' | 'leave-room' | 'chat-message';
  roomId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

export interface FileChangeEvent {
  filePath: string;
  content: string;
  cursorPosition?: number;
  selection?: {
    start: number;
    end: number;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/collaboration',
})
export class CollaborationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);
  
  // Store active rooms and participants
  private rooms: Map<string, Set<string>> = new Map();
  private roomData: Map<string, any> = new Map();

  afterInit(server: Server) {
    this.logger.log('Collaboration Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', { clientId: client.id });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove client from all rooms
    for (const [roomId, participants] of this.rooms.entries()) {
      if (participants.has(client.id)) {
        participants.delete(client.id);
        
        // Notify other participants
        this.server.to(roomId).emit('user-left', {
          userId: client.id,
          roomId,
          participantCount: participants.size,
        });

        // Clean up room if empty
        if (participants.size === 0) {
          this.rooms.delete(roomId);
          this.roomData.delete(roomId);
        }
      }
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; userId: string; userName: string },
    @ConnectedSocket() client: Socket
  ) {
    const { roomId, userId, userName } = data;

    // Join the room
    client.join(roomId);

    // Track room participants
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    const room = this.rooms.get(roomId)!;
    room.add(client.id);

    // Store user info
    client.data.userId = userId;
    client.data.userName = userName;
    client.data.roomId = roomId;

    // Notify other participants
    this.server.to(roomId).emit('user-joined', {
      userId,
      userName,
      clientId: client.id,
      participantCount: room.size,
    });

    // Send current room state to the joining user
    const roomParticipants = Array.from(room).map(clientId => {
      const socket = this.server.sockets.sockets.get(clientId);
      return socket ? { 
        userId: socket.data.userId, 
        userName: socket.data.userName, 
        clientId: socket.id 
      } : null;
    }).filter(Boolean);

    client.emit('room-state', {
      roomId,
      participants: roomParticipants,
      data: this.roomData.get(roomId) || {},
    });

    this.logger.log(`User ${userId} joined room ${roomId}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket
  ) {
    const { roomId } = data;

    client.leave(roomId);

    // Remove from room tracking
    if (this.rooms.has(roomId)) {
      const room = this.rooms.get(roomId)!;
      room.delete(client.id);
      
      // Notify other participants
      this.server.to(roomId).emit('user-left', {
        userId: client.data.userId,
        clientId: client.id,
        roomId,
        participantCount: room.size,
      });

      // Clean up room if empty
      if (room.size === 0) {
        this.rooms.delete(roomId);
        this.roomData.delete(roomId);
      }
    }

    this.logger.log(`User ${client.data.userId} left room ${roomId}`);
  }

  @SubscribeMessage('file-change')
  handleFileChange(
    @MessageBody() data: FileChangeEvent & { roomId: string; userId: string },
    @ConnectedSocket() client: Socket
  ) {
    const { roomId, userId, filePath, content, cursorPosition, selection } = data;

    // Validate user is in the room
    const room = this.rooms.get(roomId);
    if (!this.rooms.has(roomId) || !room || !room.has(client.id)) {
      client.emit('error', { message: 'Not authorized to send file changes to this room' });
      return;
    }

    // Broadcast the change to all other participants in the room
    client.to(roomId).emit('file-change', {
      userId,
      filePath,
      content,
      cursorPosition,
      selection,
      timestamp: new Date(),
    });

    // Store the file content in room data
    if (!this.roomData.has(roomId)) {
      this.roomData.set(roomId, {});
    }
    const roomState = this.roomData.get(roomId);
    if (!roomState.files) {
      roomState.files = {};
    }
    roomState.files[filePath] = {
      content,
      lastModified: new Date(),
      lastModifiedBy: userId,
    };

    this.logger.log(`File change in room ${roomId} by user ${userId}: ${filePath}`);
  }

  @SubscribeMessage('cursor-position')
  handleCursorPosition(
    @MessageBody() data: { roomId: string; userId: string; filePath: string; position: number },
    @ConnectedSocket() client: Socket
  ) {
    const { roomId, userId, filePath, position } = data;

    // Validate user is in the room
    const room = this.rooms.get(roomId);
    if (!this.rooms.has(roomId) || !room || !room.has(client.id)) {
      client.emit('error', { message: 'Not authorized to send cursor position to this room' });
      return;
    }

    // Broadcast cursor position to all other participants in the room
    client.to(roomId).emit('cursor-position', {
      userId,
      filePath,
      position,
      timestamp: new Date(),
    });

    this.logger.log(`Cursor position update in room ${roomId} by user ${userId}: ${position}`);
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(
    @MessageBody() data: { roomId: string; userId: string; message: string; userName?: string },
    @ConnectedSocket() client: Socket
  ) {
    const { roomId, userId, message, userName } = data;

    // Validate user is in the room
    const room = this.rooms.get(roomId);
    if (!this.rooms.has(roomId) || !room || !room.has(client.id)) {
      client.emit('error', { message: 'Not authorized to send messages to this room' });
      return;
    }

    // Broadcast chat message to all participants in the room
    this.server.to(roomId).emit('chat-message', {
      userId,
      userName: userName || client.data.userName,
      message,
      timestamp: new Date(),
    });

    this.logger.log(`Chat message in room ${roomId} by user ${userId}: ${message.substring(0, 50)}...`);
  }

  @SubscribeMessage('sync-request')
  handleSyncRequest(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket
  ) {
    const { roomId } = data;

    // Send current room state to requesting client
    if (this.roomData.has(roomId)) {
      client.emit('sync-response', {
        roomId,
        data: this.roomData.get(roomId),
      });
    }
  }

  // Method to broadcast events to specific rooms (can be called from other services)
  broadcastToRoom(roomId: string, event: string, data: any) {
    if (this.rooms.has(roomId)) {
      this.server.to(roomId).emit(event, data);
    }
  }

  // Get current participants in a room
  getRoomParticipants(roomId: string): string[] {
    if (!this.rooms.has(roomId)) {
      return [];
    }
    const room = this.rooms.get(roomId)!;
    return Array.from(room);
  }

  // Get room count
  getRoomCount(): number {
    return this.rooms.size;
  }
}
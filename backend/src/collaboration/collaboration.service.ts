import { Injectable, Logger } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);

  constructor(private readonly collaborationGateway: CollaborationGateway) {}

  /**
   * Create a new collaboration room
   */
  async createRoom(roomId: string, creatorUserId: string): Promise<void> {
    // Rooms are created automatically when users join
    this.logger.log(`Room ${roomId} created by user ${creatorUserId}`);
  }

  /**
   * Invite a user to a collaboration room
   */
  async inviteUser(roomId: string, inviterUserId: string, inviteeUserId: string): Promise<void> {
    // In a real implementation, this would send an invitation notification
    this.logger.log(`User ${inviterUserId} invited user ${inviteeUserId} to room ${roomId}`);
  }

  /**
   * Broadcast a file change to all participants in a room
   */
  broadcastFileChange(roomId: string, userId: string, filePath: string, content: string): void {
    // The gateway handles broadcasting internally
    this.collaborationGateway.broadcastToRoom(roomId, 'file-change', {
      userId,
      filePath,
      content,
      timestamp: new Date(),
    });
  }

  /**
   * Get current participants in a room
   */
  getRoomParticipants(roomId: string): string[] {
    return this.collaborationGateway.getRoomParticipants(roomId);
  }

  /**
   * Get the number of active collaboration rooms
   */
  getActiveRoomsCount(): number {
    return this.collaborationGateway.getRoomCount();
  }

  /**
   * Send a direct message to a user in a room
   */
  sendDirectMessage(roomId: string, senderUserId: string, recipientUserId: string, message: string): void {
    // In a real implementation, this would find the recipient's socket and send a direct message
    this.logger.log(`Direct message from ${senderUserId} to ${recipientUserId} in room ${roomId}`);
  }

  /**
   * Share project with collaborators
   */
  async shareProject(projectId: string, userId: string, collaboratorEmails: string[]): Promise<void> {
    // In a real implementation, this would create collaboration rooms and send invitations
    this.logger.log(`Project ${projectId} shared by ${userId} with ${collaboratorEmails.length} collaborators`);
  }

  /**
   * Get collaboration statistics
   */
  getStats(): any {
    return {
      activeRooms: this.getActiveRoomsCount(),
      totalParticipants: this.getAllParticipantsCount(),
    };
  }

  private getAllParticipantsCount(): number {
    // Calculate total participants across all rooms
    let count = 0;
    for (const participants of this.collaborationGateway['rooms'].values()) {
      count += participants.size;
    }
    return count;
  }
}
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  // Map userId → Set of socketIds (supports multiple tabs/windows per user)
  private userSocketMap = new Map<string, Set<string>>();

  constructor(private readonly jwtService: JwtService) {}

  private getCookie(cookieString?: string, key = 'access_token'): string | null {
    if (!cookieString) return null;
    const match = cookieString.match(new RegExp(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  }

  private extractToken(client: Socket): string | null {
    // Check Authorization header (Bearer token)
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check handshake auth token (auth: { token: '...' })
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token;
    }

    // Check cookies
    return this.getCookie(client.handshake.headers.cookie, 'access_token');
  }

  private addSocket(userId: string, socketId: string) {
    let sockets = this.userSocketMap.get(userId);
    if (!sockets) {
      sockets = new Set();
      this.userSocketMap.set(userId, sockets);
    }
    sockets.add(socketId);
  }

  private removeSocket(userId: string, socketId: string) {
    const sockets = this.userSocketMap.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSocketMap.delete(userId);
      }
    }
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        console.log('WS Connection rejected: No token found');
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;
      if (!userId) {
        console.log('WS Connection rejected: Invalid payload sub');
        client.disconnect(true);
        return;
      }

      client.data = client.data || {};
      client.data.userId = userId;

      this.addSocket(userId, client.id);
      console.log(`User ${userId} connected (authenticated, socket ${client.id})`);
    } catch (err) {
      console.log('WS Connection rejected: Token verification failed', err);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      this.removeSocket(userId, client.id);
      console.log(`User ${userId} disconnected (socket ${client.id})`);
    }
  }

  sendNotificationToUser(userId: string, notification: any) {
    const socketIds = this.userSocketMap.get(userId);
    if (socketIds) {
      for (const socketId of socketIds) {
        this.server.to(socketId).emit('notification', notification);
      }
    }
  }

  sendMessageToUser(userId: string, message: any) {
    const socketIds = this.userSocketMap.get(userId);
    if (socketIds) {
      for (const socketId of socketIds) {
        this.server.to(socketId).emit('newMessage', message);
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    const authenticatedUserId = client.data?.userId;
    if (!authenticatedUserId || authenticatedUserId !== data.userId) {
      console.log(`WS Warning: User ${authenticatedUserId} tried to join as ${data.userId}`);
      client.disconnect(true);
      return;
    }
    this.addSocket(data.userId, client.id);
    console.log(`User ${data.userId} joined (verified, socket ${client.id})`);
  }
}


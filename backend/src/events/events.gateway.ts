import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 클라이언트 연결 시 JWT 검증 후 userId 기반 룸 입장
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string;
      const payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });
      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  // 클라이언트 연결 해제 시 처리
  handleDisconnect(client: Socket) {
    client.data.userId = null;
  }

  // 그룹 멤버들에게 실시간 이벤트 전송
  notifyGroup(userIds: string[], event: string, payload: unknown) {
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit(event, payload);
    });
  }
}

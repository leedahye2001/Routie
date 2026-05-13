import { Injectable } from '@nestjs/common';
import { Provider } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, nickname: true },
    });
  }

  async findAuthProvider(userId: string, provider: Provider) {
    return this.prisma.authProvider.findUnique({
      where: { provider_userId: { provider, userId } },
      select: { id: true, password: true, provider: true },
    });
  }

  async findRefreshToken(userId: string, deviceId: string) {
    return this.prisma.refreshToken.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
      select: { id: true, token: true, expiresAt: true },
    });
  }
}

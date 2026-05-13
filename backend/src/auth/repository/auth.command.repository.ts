import { Injectable } from '@nestjs/common';
import { Platform, Prisma, Provider } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type Tx = Prisma.TransactionClient;

@Injectable()
export class AuthCommandRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: { email: string; nickname: string }, tx?: Tx) {
    return (tx ?? this.prisma).user.create({
      data,
      select: { id: true, email: true, nickname: true },
    });
  }

  async createAuthProvider(
    data: { userId: string; provider: Provider; password?: string; providerId?: string },
    tx?: Tx,
  ) {
    return (tx ?? this.prisma).authProvider.create({ data });
  }

  async saveRefreshToken(
    data: { userId: string; token: string; deviceId: string; expiresAt: Date },
    tx?: Tx,
  ) {
    return (tx ?? this.prisma).refreshToken.upsert({
      where: { userId_deviceId: { userId: data.userId, deviceId: data.deviceId } },
      create: data,
      update: { token: data.token, expiresAt: data.expiresAt },
    });
  }

  async deleteRefreshToken(userId: string, deviceId: string, tx?: Tx) {
    return (tx ?? this.prisma).refreshToken.delete({
      where: { userId_deviceId: { userId, deviceId } },
    });
  }

  async upsertDevice(
    data: { userId: string; deviceId: string; fcmToken: string; platform: Platform },
    tx?: Tx,
  ) {
    return (tx ?? this.prisma).device.upsert({
      where: { userId_deviceId: { userId: data.userId, deviceId: data.deviceId } },
      create: data,
      update: { fcmToken: data.fcmToken },
    });
  }
}

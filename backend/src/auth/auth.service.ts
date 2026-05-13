import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthCommandRepository } from './repository/auth.command.repository';
import { AuthQueryRepository } from './repository/auth.query.repository';
import { AuthResponseDto } from './dto/auth.response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authQuery: AuthQueryRepository,
    private readonly authCommand: AuthCommandRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.authQuery.findUserByEmail(dto.email);
    if (existing) throw new ConflictException('이미 사용 중인 이메일입니다.');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await this.authCommand.createUser(
        { email: dto.email, nickname: dto.nickname },
        tx,
      );
      await this.authCommand.createAuthProvider(
        { userId: newUser.id, provider: 'LOCAL', password: hashedPassword },
        tx,
      );
      return newUser;
    });

    const tokens = await this.issueTokens(user.id, user.email, dto.deviceId);

    if (dto.deviceId && dto.fcmToken && dto.platform) {
      await this.authCommand.upsertDevice({
        userId: user.id,
        deviceId: dto.deviceId,
        fcmToken: dto.fcmToken,
        platform: dto.platform,
      });
    }

    return { ...tokens, user };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authQuery.findUserByEmail(dto.email);
    if (!user) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');

    const authProvider = await this.authQuery.findAuthProvider(user.id, 'LOCAL');
    if (!authProvider?.password) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');

    const isValid = await bcrypt.compare(dto.password, authProvider.password);
    if (!isValid) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');

    const tokens = await this.issueTokens(user.id, user.email, dto.deviceId);
    return { ...tokens, user };
  }

  async refresh(dto: RefreshDto): Promise<Pick<AuthResponseDto, 'accessToken' | 'refreshToken'>> {
    const stored = await this.authQuery.findRefreshToken(
      // userId를 모르므로 token으로 찾는 대신, deviceId 기반 조회를 위해 토큰 디코딩
      this.extractUserIdFromRefreshToken(dto.refreshToken),
      dto.deviceId,
    );

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    const isValid = await bcrypt.compare(dto.refreshToken, stored.token);
    if (!isValid) throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');

    const userId = this.extractUserIdFromRefreshToken(dto.refreshToken);
    return this.issueTokens(userId, null, dto.deviceId);
  }

  async logout(userId: string, deviceId: string): Promise<void> {
    await this.authCommand.deleteRefreshToken(userId, deviceId);
  }

  private async issueTokens(userId: string, email: string | null, deviceId?: string) {
    const accessToken = this.jwtService.sign({ sub: userId, email });

    const plainRefreshToken = crypto.randomBytes(40).toString('hex');
    const hashedRefreshToken = await bcrypt.hash(plainRefreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    if (deviceId) {
      await this.authCommand.saveRefreshToken({
        userId,
        token: hashedRefreshToken,
        deviceId,
        expiresAt,
      });
    }

    // userId를 refresh token에 인코딩 (Base64)
    const refreshTokenWithUserId = `${Buffer.from(userId).toString('base64url')}.${plainRefreshToken}`;
    return { accessToken, refreshToken: refreshTokenWithUserId };
  }

  private extractUserIdFromRefreshToken(token: string): string {
    const [encodedUserId] = token.split('.');
    return Buffer.from(encodedUserId, 'base64url').toString('utf-8');
  }
}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthQueryRepository } from './repository/auth.query.repository';
import { AuthCommandRepository } from './repository/auth.command.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthQueryRepository, AuthCommandRepository],
})
export class AuthModule {}

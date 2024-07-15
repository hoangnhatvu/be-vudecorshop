import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenBlacklist } from 'src/types/token-blacklist';

type PayloadType = {
  id: string;
  updatedToken: string;
  email: string;
  role: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel('TokenBlacklist')
    private tokenBlacklistModel: Model<TokenBlacklist>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);    
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const isBlackToken = await this.tokenBlacklistModel.findOne({ token });      
      if (isBlackToken) {
        throw new UnauthorizedException();
      }
      const verify = await this.jwtService.verifyAsync<PayloadType>(token, {
        secret: this.configService.get('SECRET'),
      });
      request['user_data'] = verify;
      request['token'] = token;      
      if (roles.find((e) => e === verify.role)) {        
        return true;
      }
    } catch (err) {
      throw new UnauthorizedException();
    }

    return false;
  }

  private extractToken(request: Request) {
    const [type, token] = request.headers.authorization
      ? request.headers.authorization.split(' ')
      : [];
    return type === 'Bearer' ? token : undefined;
  }
}

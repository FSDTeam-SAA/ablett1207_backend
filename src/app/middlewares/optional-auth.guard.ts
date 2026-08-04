import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import config from '../config';
import { JwtPayload } from './auth.guard';

/**
 * Use on endpoints that must work for BOTH guests and logged-in users
 * (e.g. submitting a quote request). If a valid bearer token is present,
 * `req.user` is populated exactly like AuthGuard(). If it's missing or
 * invalid, the request simply proceeds with `req.user` left undefined -
 * it never throws 401.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) return true;

    try {
      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: config.jwt.accessTokenSecret!,
      });
      if (decoded) request.user = decoded;
    } catch {
      // invalid/expired token on an optional-auth route - just treat as guest
    }

    return true;
  }
}
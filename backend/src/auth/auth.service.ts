import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly ADMIN_LOGIN = 'admin';
  private readonly ADMIN_PASSWORD = 'agrotech2025';

  validate(login: string, password: string): boolean {
    if (login === this.ADMIN_LOGIN && password === this.ADMIN_PASSWORD) {
      return true;
    }
    throw new UnauthorizedException('Неверный логин или пароль');
  }
}
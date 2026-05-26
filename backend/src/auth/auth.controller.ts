import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { login: string; password: string }) {
    this.authService.validate(body.login, body.password);
    return { success: true, token: 'admin-token-agrotech-2025' };
  }
}
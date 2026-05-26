import { Controller, Post, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('api/seed')
  async seed() {
    return this.appService.seed();
  }

  @Post('api/clear')
  async clear() {
    return this.appService.clear();
  }

  @Get('api/health')
  async health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
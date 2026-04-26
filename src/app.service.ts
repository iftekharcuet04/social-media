import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return { message: 'OK' };
  }

  async getHealthDetails() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

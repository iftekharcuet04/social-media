import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Social Media API is running! Access /api for Swagger documentation.';
  }
}

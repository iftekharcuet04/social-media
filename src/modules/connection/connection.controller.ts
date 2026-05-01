import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Get('connect/:platform')
  async getConnectUrl(
    @Param('platform') platform: string,
    @Request() req,
    @Query('redirectUri') redirectUri?: string,
  ) {
    const url = await this.connectionService.getConnectUrl(platform, req.user.uid, redirectUri);
    return { url };
  }

  @Get('callback/:platform')
  async handleCallback(
    @Param('platform') platform: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Request() req,
    @Query('redirectUri') redirectUri?: string,
  ) {
    await this.connectionService.handleCallback(platform, {
      userId: req.user.uid,
      code,
      state,
      redirectUri,
    });
    return { message: `${platform} connected successfully` };
  }

  @Get()
  async listConnections(@Request() req) {
    return this.connectionService.listConnections(req.user.uid);
  }

  @Delete(':id')
  async disconnect(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.connectionService.disconnect(req.user.uid, BigInt(id));
    return { message: 'Connection removed' };
  }
}

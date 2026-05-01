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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ConnectionService } from './connection.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('connections')
@ApiBearerAuth()
@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Get('connect/:platform')
  @ApiOperation({ summary: 'Generate OAuth login URL for a platform' })
  @ApiParam({ name: 'platform', example: 'FACEBOOK' })
  @ApiQuery({ name: 'redirectUri', required: false })
  async getConnectUrl(
    @Param('platform') platform: string,
    @Request() req,
    @Query('redirectUri') redirectUri?: string,
  ) {
    const url = await this.connectionService.getConnectUrl(platform, req.user.uid, redirectUri);
    return { url };
  }

  @Get('callback/:platform')
  @ApiOperation({ summary: 'Handle OAuth callback from platform' })
  @ApiParam({ name: 'platform', example: 'FACEBOOK' })
  @ApiQuery({ name: 'code' })
  @ApiQuery({ name: 'state' })
  @ApiQuery({ name: 'redirectUri', required: false })
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
  @ApiOperation({ summary: 'List all social media connections for the current user' })
  async listConnections(@Request() req) {
    return this.connectionService.listConnections(req.user.uid);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect a social media platform' })
  @ApiParam({ name: 'id', description: 'Database ID of the connection' })
  async disconnect(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.connectionService.disconnect(req.user.uid, BigInt(id));
    return { message: 'Connection removed' };
  }
}

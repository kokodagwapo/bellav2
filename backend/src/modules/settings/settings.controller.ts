import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get application settings' })
  async getSettings() {
    // Return basic settings - can be extended later
    return {
      version: '1.0.0',
      features: {
        mfa: true,
        plaid: true,
        calendar: true,
      },
    };
  }
}

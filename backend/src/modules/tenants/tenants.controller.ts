import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Get tenant by slug (public endpoint)' })
  async findBySlug(@Param('slug') slug: string) {
    const tenant = await this.tenantsService.findBySubdomain(slug);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tenant (Super Admin only)' })
  async create(@Body() createTenantDto: CreateTenantDto, @Request() req) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Only super admin can create tenants');
    }
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tenants (Super Admin) or own tenant' })
  async findAll(@Request() req) {
    return this.tenantsService.findAll(req.user.role, req.user.tenantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenant by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.tenantsService.findOne(id, req.user.role, req.user.tenantId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tenant' })
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @Request() req,
  ) {
    return this.tenantsService.update(id, updateTenantDto, req.user.role, req.user.tenantId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tenant (Super Admin only)' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.tenantsService.remove(id, req.user.role);
  }
}


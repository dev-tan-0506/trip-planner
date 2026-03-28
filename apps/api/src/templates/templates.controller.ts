import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TemplatesService } from './templates.service';
import { PublishTemplateDto } from './dto/publish-template.dto';
import { CloneTemplateDto } from './dto/clone-template.dto';

@Controller('trips/:tripId/templates')
@ApiTags('Community Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TripTemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post('publish')
  @ApiOperation({ summary: 'Publish a sanitized community template from this trip' })
  async publish(
    @Param('tripId') tripId: string,
    @Body() dto: PublishTemplateDto,
    @Req() req: any,
  ) {
    return this.templatesService.publishTemplate(tripId, req.user.id, dto);
  }
}

@Controller('templates')
@ApiTags('Community Templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all published community templates' })
  async list() {
    return this.templatesService.listTemplates();
  }

  @Get(':templateId')
  @ApiOperation({ summary: 'Get template details with sanitized snapshot' })
  async get(@Param('templateId') templateId: string) {
    return this.templatesService.getTemplate(templateId);
  }

  @Post(':templateId/clone')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clone a template into a new trip' })
  async clone(
    @Param('templateId') templateId: string,
    @Body() dto: CloneTemplateDto,
    @Req() req: any,
  ) {
    return this.templatesService.cloneTemplate(templateId, req.user.id, dto);
  }
}

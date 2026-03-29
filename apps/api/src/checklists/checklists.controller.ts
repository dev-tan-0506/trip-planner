import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChecklistsService } from './checklists.service';
import { CreateChecklistGroupDto } from './dto/create-checklist-group.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { SubmitChecklistProofDto } from './dto/submit-checklist-proof.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Checklists')
@Controller('trips/:tripId/checklists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Get()
  @ApiOperation({ summary: 'Get checklist snapshot for trip' })
  async getSnapshot(
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.checklistsService.getChecklistSnapshot(tripId, user.sub);
  }

  @Post('groups')
  @ApiOperation({ summary: 'Create a checklist group (Leader only)' })
  async createGroup(
    @Param('tripId') tripId: string,
    @Body() dto: CreateChecklistGroupDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.checklistsService.createGroup(tripId, user.sub, dto);
  }

  @Delete('groups/:groupId')
  @ApiOperation({ summary: 'Delete a checklist group (Leader only)' })
  async deleteGroup(
    @Param('tripId') tripId: string,
    @Param('groupId') groupId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.checklistsService.deleteGroup(tripId, user.sub, groupId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Create a checklist item (Leader only)' })
  async createItem(
    @Param('tripId') tripId: string,
    @Body() dto: CreateChecklistItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.checklistsService.createItem(tripId, user.sub, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update a checklist item (Leader only)' })
  async updateItem(
    @Param('tripId') tripId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateChecklistItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.checklistsService.updateItem(tripId, user.sub, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Delete a checklist item (Leader only)' })
  async deleteItem(
    @Param('tripId') tripId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.checklistsService.deleteItem(tripId, user.sub, itemId);
  }

  @Post('items/:itemId/toggle')
  @ApiOperation({ summary: 'Toggle item done/todo (assigned member or leader)' })
  async toggleItem(
    @Param('tripId') tripId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.checklistsService.toggleItem(tripId, user.sub, itemId);
  }

  @Post('items/:itemId/proof')
  @ApiOperation({ summary: 'Submit checklist proof image for assigned member or leader' })
  async submitProof(
    @Param('tripId') tripId: string,
    @Param('itemId') itemId: string,
    @Body() dto: SubmitChecklistProofDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.checklistsService.submitProof(tripId, user.sub, itemId, dto);
  }
}

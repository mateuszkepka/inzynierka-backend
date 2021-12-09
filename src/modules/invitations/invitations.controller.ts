import { Controller, Get, Post, Body, Param, Delete, Req, UseGuards, Query, SerializeOptions, ParseIntPipe, Patch } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { InvitationStatus } from './interfaces/invitation-status.enum';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { UserIsInvitedGuard } from './guards/invited-player.guard';
import { UserIsCaptainGuard } from '../teams/guards/user-is-captain.guard';

@Controller('invitations')
@Roles(Role.Player)
@SerializeOptions({ strategy: `excludeAll` })
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) { }

  @Get()
  async getFiltered(@Query('status') status: InvitationStatus, @Req() { user }: RequestWithUser) {
    return await this.invitationsService.findPending(status, user);
  }

  @Post()
  @UseGuards(UserIsCaptainGuard)
  async create(@Body() createInvitationDto: CreateInvitationDto) {
    return await this.invitationsService.create(createInvitationDto);
  }

  @Patch(':id')
  @UseGuards(UserIsInvitedGuard)
  async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateInvitationDto) {
    return await this.invitationsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param(`id`, ParseIntPipe) id: number, @Req() { user }: RequestWithUser) {
    return await this.invitationsService.remove(id, user);
  }
}

import { Controller, Get, Post, Body, Param, Delete, Req, Put, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import { InvitationStatus } from '../teams/interfaces/teams.interface';
import { AccountOwnerGuard } from '../players/guards/account-owner.guard';
import { InvitedPlayer } from './guards/invited-player.guard';

@Controller('invitations')
@UseGuards(new JwtAuthGuard(), new AccountOwnerGuard())
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) { }

  @Post()
  create(@Body() createInvitationDto: CreateInvitationDto) {
    return this.invitationsService.create(createInvitationDto);
  }

  @Get()
  findPending(@Query('status') status: InvitationStatus, @Req() request: RequestWithUser) {
    return this.invitationsService.findPending(status, request);
  }

  @Put(':id')
  @UseGuards(InvitedPlayer)
  update(@Param('id') id: string, @Body() updateInvitationDto: UpdateInvitationDto) {
    return this.invitationsService.update(+id, updateInvitationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invitationsService.remove(+id);
  }
}

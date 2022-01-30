import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/modules/auth/dto/roles.enum';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { UserIsCaptainGuard } from '../teams/guards/user-is-captain.guard';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { UserIsInvitedGuard } from './guards/invited-player.guard';
import { InvitationStatus } from './interfaces/invitation-status.enum';
import { InvitationsService } from './invitations.service';

@Controller(`invitations`)
@Roles(Role.Player)
export class InvitationsController {
    constructor(private readonly invitationsService: InvitationsService) { }

    @Get(`/:invitationId`)
    async getById(@Param(`invitationId`, ParseIntPipe) invitationId: number) {
        return this.invitationsService.getById(invitationId);
    }

    @Get()
    async getFiltered(@Query(`status`) status: InvitationStatus, @Req() { user }: RequestWithUser) {
        return this.invitationsService.getFiltered(status, user);
    }

    @Post()
    @UseGuards(UserIsCaptainGuard)
    async create(@Body() createInvitationDto: CreateInvitationDto) {
        return this.invitationsService.create(createInvitationDto);
    }

    @Patch(`/:invitationId`)
    @UseGuards(UserIsInvitedGuard)
    async update(@Param(`invitationId`, ParseIntPipe) invitationId: number, @Body() body: UpdateInvitationDto) {
        return this.invitationsService.update(invitationId, body);
    }

    @Delete(`/:invitationId`)
    @UseGuards(UserIsCaptainGuard)
    async remove(@Param(`invitationId`, ParseIntPipe) invitationId: number, @Req() { user }: RequestWithUser) {
        return this.invitationsService.remove(invitationId, user);
    }
}

import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/modules/auth/dto/roles.enum';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { UpdateTeamDto } from './dto/update-team.dto';
import { MatchQuery } from '../matches/dto/get-matches.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { editFileName, imageFileFilter } from 'src/utils/uploads-util';
import { Public } from 'src/decorators/public.decorator';
import { UserIsCaptainGuard } from './guards/user-is-captain.guard';
import { UserIsAccountOwner } from '../players/guard/user-is-account-owner.guard';

@Controller(`teams`)
@Roles(Role.User)
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Get(`/:teamId/players/available`)
    @UseGuards(UserIsCaptainGuard)
    async getAvailablePlayers(
        @Param(`teamId`, ParseIntPipe) teamId: number,
        @Req() { user }: RequestWithUser,
    ) {
        return this.teamsService.getAvailablePlayers(teamId, user);
    }

    @Get(`/:teamId/members`)
    @Public()
    async getMembers(@Param(`teamId`, ParseIntPipe) teamId: number) {
        return this.teamsService.getMembers(teamId);
    }

    @Get(`/:teamId/matches`)
    async getMatchesByTeams(
        @Param(`teamId`, ParseIntPipe) teamId: number,
        @Query() { status }: MatchQuery,
    ) {
        return this.teamsService.getMatchesByTeams(teamId, status);
    }

    @Get(`/:teamId`)
    @Public()
    async get(@Param(`teamId`, ParseIntPipe) teamId: number) {
        return this.teamsService.getById(teamId);
    }

    @Get()
    async getAll() {
        return this.teamsService.getAll();
    }

    @Get(`avatars/:imgpath`)
    @Public()
    seeUploadedProfile(@Param(`imgpath`) image: Express.Multer.File, @Res() res) {
        return res.sendFile(image, { root: `./uploads/teams/avatars` });
    }

    @Get(`backgrounds/:imgpath`)
    @Public()
    seeUploadedBackground(@Param(`imgpath`) image: Express.Multer.File, @Res() res) {
        return res.sendFile(image, { root: `./uploads/teams/backgrounds` });
    }

    @Post(`:teamId/avatars`)
    @UseGuards(UserIsCaptainGuard)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/teams/avatars`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
            limits: { fileSize: 2000000 },
        }),
    )
    async uploadAvatar(
        @UploadedFile() image: Express.Multer.File,
        @Param(`teamId`, ParseIntPipe) teamId: number
    ) {
        return this.teamsService.setTeamProfile(teamId, image);
    }

    @Post(`:teamId/backgrounds`)
    @UseGuards(UserIsCaptainGuard)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/teams/backgrounds`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
            limits: { fileSize: 4000000 },
        }),
    )
    async uploadBackground(
        @UploadedFile() image: Express.Multer.File,
        @Param(`teamId`, ParseIntPipe) teamId: number,
    ) {
        return this.teamsService.setTeamBackground(teamId, image);
    }

    @Post()
    @Roles(Role.Player)
    @UseGuards(UserIsAccountOwner)
    async create(@Body() teamData: CreateTeamDto) {
        return this.teamsService.create(teamData);
    }

    @Patch(`/:teamId`)
    @Roles(Role.Player)
    @UseGuards(UserIsCaptainGuard)
    async update(@Param(`teamId`, ParseIntPipe) teamId: number, @Body() body: UpdateTeamDto) {
        return this.teamsService.update(teamId, body);
    }

    @Delete(`/:teamId`)
    @Roles(Role.Player)
    @UseGuards(UserIsCaptainGuard)
    async remove(@Param(`teamId`, ParseIntPipe) teamId: number) {
        return this.teamsService.remove(teamId);
    }
}

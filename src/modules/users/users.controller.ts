import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/modules/auth/dto/roles.enum';
import { MatchQuery } from '../matches/dto/get-matches.dto';
import { GetUsersTournamentsQuery } from './dto/get-users-tournaments.dto';
import { RolesDto } from './dto/roles.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { editFileName, imageFileFilter } from 'src/utils/uploads-util';
import { Public } from 'src/decorators/public.decorator';
import { UserIsUserGuard } from './guards/user-is-user.guard';

@Controller(`users`)
@Roles(Role.User)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(`/:id/accounts`)
    async getAccounts(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getAccounts(id);
    }

    @Get(`/:id/tournaments`)
    async getTournaments(
        @Param(`id`, ParseIntPipe) id: number,
        @Query() queryParams: GetUsersTournamentsQuery,
    ) {
        return this.usersService.getTournamentsByUser(id, queryParams);
    }

    @Get(`/:id/matches`)
    async getMatches(@Param(`id`, ParseIntPipe) id: number, @Query() { status }: MatchQuery) {
        return this.usersService.getMatchesByUser(id, status);
    }

    @Get(`/:id/teams`)
    async getTeams(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getTeamsByUser(id);
    }

    @Get(`/:id`)
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getById(id);
    }

    @Get(`avatars/:imgpath`)
    @Public()
    async seeUploadedAvatar(@Param(`imgpath`) image: Express.Multer.File, @Res() res) {
        return res.sendFile(image, { root: `./uploads/users/avatars` });
    }

    @Get(`backgrounds/:imgpath`)
    @Public()
    async seeUploadedBackground(@Param(`imgpath`) image: Express.Multer.File, @Res() res) {
        return res.sendFile(image, { root: `./uploads/users/backgrounds` });
    }

    @Post(`:id/avatars`)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/users/avatars`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
            limits: { fileSize: 2000000 },
        }),
    )
    async uploadedFile(@UploadedFile() image: Express.Multer.File, @Param(`id`, ParseIntPipe) id: number) {
        console.log(image)
        return this.usersService.setProfileImage(id, image);
    }

    @Post(`:userId/backgrounds`)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/users/backgrounds`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
            limits: { fileSize: 4000000 },
        }),
    )
    async uploadedBackground(
        @UploadedFile() image: Express.Multer.File,
        @Param(`userId`, ParseIntPipe) userId: number
    ) {
        return this.usersService.setProfileBackground(userId, image);
    }

    @Post(`/:id/roles/grant`)
    @Roles(Role.Admin)
    async grantRole(@Param(`id`, ParseIntPipe) id: number, @Body() body: RolesDto) {
        return this.usersService.grantRole(id, body);
    }

    @Patch(`/:id`)
    @UseGuards(UserIsUserGuard)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
        return this.usersService.update(id, body);
    }

    @Delete(`/:id`)
    @UseGuards(UserIsUserGuard)
    async remove(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

    @Post(`/:id/roles/revoke`)
    @Roles(Role.Admin)
    async revokeRole(@Param(`id`, ParseIntPipe) id: number, @Body() body: RolesDto) {
        return this.usersService.revokeRole(id, body);
    }
}

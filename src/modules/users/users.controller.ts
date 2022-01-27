import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
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
import { GetUsersQuery } from './dto/get-users-filtered.dto';

@Controller(`users`)
@Roles(Role.User)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async getAllUsers() {
        return this.usersService.getAll();
    }

    @Get(`/:userId/accounts`)
    async getAccounts(@Param(`userId`, ParseIntPipe) userId: number) {
        return this.usersService.getAccounts(userId);
    }

    @Get(`/:userId/tournaments`)
    async getTournaments(
        @Param(`userId`, ParseIntPipe) userId: number,
        @Query() queryParams: GetUsersTournamentsQuery,
    ) {
        return this.usersService.getTournamentsByUser(userId, queryParams);
    }

    @Get(`/:userId/matches`)
    async getMatches(
        @Param(`userId`, ParseIntPipe) userId: number,
        @Query() { status }: MatchQuery,
    ) {
        return this.usersService.getMatchesByUser(userId, status);
    }

    @Get(`/:userId/teams`)
    async getTeams(@Param(`userId`, ParseIntPipe) userId: number) {
        return this.usersService.getTeamsByUser(userId);
    }

    @Get(`/:userId`)
    async getById(@Param(`userId`, ParseIntPipe) userId: number) {
        return this.usersService.getById(userId);
    }

    @Get()
    async getFiltered(@Query() queryParams: GetUsersQuery) {
        return this.usersService.getUsersFiltered(queryParams);
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

    @Post(`:userId/avatars`)
    @Public()
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
    async uploadedFile(
        @UploadedFile() image: Express.Multer.File,
        @Param(`userId`, ParseIntPipe) userId: number,
    ) {
        return this.usersService.setProfileImage(userId, image);
    }

    @Post(`:userId/backgrounds`)
    @Public()
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
        @Param(`userId`, ParseIntPipe) userId: number,
    ) {
        return this.usersService.setProfileBackground(userId, image);
    }

    @Post(`/:userId/roles/grant`)
    @Roles(Role.Admin)
    async grantRole(@Param(`userId`, ParseIntPipe) userId: number, @Body() body: RolesDto) {
        return this.usersService.grantRole(userId, body);
    }

    @Patch(`/:userId`)
    @UseGuards(UserIsUserGuard)
    async update(@Param(`userId`, ParseIntPipe) userId: number, @Body() body: UpdateUserDto) {
        return this.usersService.update(userId, body);
    }

    @Delete(`/:userId`)
    @UseGuards(UserIsUserGuard)
    async remove(@Param(`userId`, ParseIntPipe) userId: number) {
        return this.usersService.remove(userId);
    }

    @Post(`/:userId/roles/revoke`)
    @Roles(Role.Admin)
    async revokeRole(@Param(`userId`, ParseIntPipe) userId: number, @Body() body: RolesDto) {
        return this.usersService.revokeRole(userId, body);
    }
}

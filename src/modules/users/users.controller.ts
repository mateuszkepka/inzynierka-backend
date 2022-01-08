import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor, MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { MatchQueryDto } from '../matches/dto/get-matches.dto';
import { GetUsersTournamentsQuery } from './dto/get-users-tournaments.dto';
import { RolesDto } from './dto/roles.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { v4 as uuidv4 } from 'uuid';
import { Observable, of } from 'rxjs';
import { fileURLToPath } from 'url';
import { extname } from "path";
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { editFileName, imageFileFilter } from 'src/config/user-profile-upload.utils';


@Controller(`users`)
@Roles(Role.User)
@UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
}))
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(`/:id/accounts`)
    async getAccounts(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getAccounts(id);
    }

    @Get(`/:id/tournaments`)
    async getTournaments(@Param(`id`, ParseIntPipe) id: number, @Query() queryParams: GetUsersTournamentsQuery) {
        return this.usersService.getTournamentsByUser(id, queryParams);
    }

    @Get(`/:id/matches`)
    async getMatches(@Param(`id`, ParseIntPipe) id: number, @Query() queryParams: MatchQueryDto) {
        return this.usersService.getMatchesByUser(id, queryParams);
    }

    @Get(`/:id/teams`)
    async getTeams(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getTeamsByUser(id);
    }

    @Get(`/:id`)
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getById(id);
    }

    @Get('avatar/:imgpath')
    async seeUploadedAvatar(@Param('imgpath') image, @Res() res) {
        return res.sendFile(image, { root: './uploads/userProfileImages' });
    }

    @Get('background/:imgpath')
    async seeUploadedBackground(@Param('imgpath') image, @Res() res) {
        return res.sendFile(image, { root: './uploads/userProfileBackgrounds' });
    }

    @Post('/upload-user-image')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads/userProfileImages',
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,

        }),
    )
    async uploadedFile(@UploadedFile() image, @Req() { user }: RequestWithUser) {
        if (!image) {
            throw new BadRequestException('invalid file provided, allowed formats jpg/png/jpng!');
        }
        return this.usersService.setProfileImage(user, image);
    }

    @Post('/upload-user-background')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads/userProfileBackgrounds',
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,

        }),
    )
    async uploadedBackground(@UploadedFile() image, @Req() { user }: RequestWithUser) {
        if (!image) {
            throw new BadRequestException('invalid file provided, allowed formats jpg/png/jpng!');
        }
        return this.usersService.setProfileBackground(user, image);
    }

    @Post(`/:id/roles/grant`)
    @Roles(Role.Admin)
    async grantRole(@Param(`id`, ParseIntPipe) id: number, @Body() body: RolesDto) {
        return this.usersService.grantRole(id, body);
    }

    @Patch(`/:id`)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
        return this.usersService.update(id, body);
    }

    @Delete(`/:id`)
    async remove(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

    @Post(`/:id/roles/revoke`)
    @Roles(Role.Admin)
    async revokeRole(@Param(`id`, ParseIntPipe) id: number, @Body() body: RolesDto) {
        return this.usersService.revokeRole(id, body);
    }
}